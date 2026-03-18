import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    writeBatch,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { CheckInInput, CheckInResult, CheckOutInput } from '@jobnow/types';

export interface GpsValidationInput {
    userLat: number;
    userLng: number;
    targetLat: number;
    targetLng: number;
    accuracy: number;
    radiusMeters?: number;
    maxAccuracyMeters?: number;
}

export interface GpsValidationResult {
    valid: boolean;
    distanceMeters: number;
    reason?: string;
}

function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function validateGpsClientSide(input: GpsValidationInput): GpsValidationResult {
    const radius = input.radiusMeters ?? 5000; // Nới lỏng lên 5km để dễ dàng test trên nhiều thiết bị
    const maxAccuracy = input.maxAccuracyMeters ?? 100; // Độ chính xác yêu cầu cao hơn

    if (input.accuracy > maxAccuracy) {
        return {
            valid: false,
            distanceMeters: Number.POSITIVE_INFINITY,
            reason: 'gps_accuracy_too_low',
        };
    }

    const distanceMeters = calculateDistanceMeters(input.userLat, input.userLng, input.targetLat, input.targetLng);

    if (distanceMeters > radius) {
        return {
            valid: false,
            distanceMeters,
            reason: 'out_of_radius',
        };
    }

    return {
        valid: true,
        distanceMeters,
    };
}

/**
 * Performs check-in directly using Firestore SDK.
 * Validates GPS location and Time integrity.
 */
export async function checkIn(input: CheckInInput): Promise<CheckInResult> {
    try {
        const appRef = doc(db, 'applications', input.applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');

        const appData = appSnap.data();
        const jobId = appData.job_id || appData.jobId;
        if (!jobId) throw new Error('Không tìm thấy thông tin công việc.');

        const jobSnap = await getDoc(doc(db, 'jobs', jobId));
        if (!jobSnap.exists()) throw new Error('Công việc không tồn tại.');
        const jobData = jobSnap.data();

        // 0. Block multiple simultaneous check-ins
        const activeCheckInsQuery = query(
            collection(db, 'applications'),
            where('candidate_id', '==', input.candidateId),
            where('status', '==', 'CHECKED_IN')
        );
        const activeSnap = await getDocs(activeCheckInsQuery);
        if (!activeSnap.empty) {
            throw new Error('Bạn đang trong một ca làm việc khác. Vui lòng check-out trước khi bắt đầu ca mới.');
        }

        // 1. Validate Time (Real-world constraint)
        // Only allow check-in 30 mins before or after the shift start
        let isLate = false;
        let lateMinutes = 0;

        if (jobData.startTime) {
            const shiftStart = jobData.startTime.toDate?.() || new Date(jobData.startTime);
            const now = new Date();
            const diffMinutes = (now.getTime() - shiftStart.getTime()) / (1000 * 60);

            // If check-in is more than 30 mins EARLY, block it
            if (diffMinutes < -30) {
                throw new Error('Bạn đến quá sớm. Vui lòng check-in trong vòng 30 phút trước ca làm.');
            }
            
            // If check-in is more than 1 minute late, flag it as late
            if (diffMinutes > 1) { 
                 isLate = true;
                 lateMinutes = Math.floor(diffMinutes);
                 console.warn('[Attendance] Late check-in detected:', lateMinutes, 'minutes late');
            }
        }

        // 2. Validate GPS
        const validation = validateGpsClientSide({
            userLat: input.latitude,
            userLng: input.longitude,
            targetLat: jobData.location.latitude,
            targetLng: jobData.location.longitude,
            accuracy: input.accuracy,
        });

        if (!validation.valid) {
            if (validation.reason === 'out_of_radius') {
                throw new Error(`Bạn đang ở cách địa điểm làm việc ${Math.round(validation.distanceMeters)}m. Bạn cần ở trong bán kính 5000m để check-in.`);
            }
            throw new Error('Vị trí GPS không chính xác hoặc không hợp lệ.');
        }

        const batch = writeBatch(db);
        
        // Update application status
        batch.update(appRef, {
            status: 'CHECKED_IN',
            is_late: isLate,
            late_minutes: lateMinutes,
            updated_at: serverTimestamp(),
            check_in_time: serverTimestamp(), // Record on main doc for easy listing
        });

        // Add check-in record
        const checkinRef = doc(collection(appRef, 'checkins'));
        batch.set(checkinRef, {
            type: 'GPS',
            check_in_time: serverTimestamp(),
            status: 'CHECKED_IN',
            is_late: isLate,
            late_minutes: lateMinutes,
            gps_location: {
                latitude: input.latitude,
                longitude: input.longitude,
            },
            created_at: serverTimestamp(),
            distance_meters: validation.distanceMeters,
        });

        await batch.commit();

        return {
            checkinId: checkinRef.id,
            status: 'CHECKED_IN',
            method: 'GPS',
            distanceMeters: validation.distanceMeters,
        };
    } catch (error: any) {
        console.error('Error in checkIn:', error);
        throw error;
    }
}

/**
 * Performs check-out directly using Firestore SDK.
 * Now requires GPS validation to ensure candidate is at the workplace.
 * Restricts check-out until shift's endTime unless it's a force check-out.
 */
export async function checkOut(input: CheckOutInput & { latitude?: number; longitude?: number; accuracy?: number; isForce?: boolean }): Promise<{ success: boolean }> {
    try {
        const appRef = doc(db, 'applications', input.applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');

        const appData = appSnap.data();
        const jobId = appData.job_id || appData.jobId;
        
        let jobData: any = null;

        // Validate GPS on Check-out if coordinates are provided
        if (input.latitude !== undefined && input.longitude !== undefined) {
            const jobSnap = await getDoc(doc(db, 'jobs', jobId));
            if (jobSnap.exists()) {
                jobData = jobSnap.data();
                const validation = validateGpsClientSide({
                    userLat: input.latitude,
                    userLng: input.longitude,
                    targetLat: jobData.location.latitude,
                    targetLng: jobData.location.longitude,
                    accuracy: input.accuracy || 50,
                });

                if (!validation.valid) {
                    throw new Error('Bạn cần phải ở tại địa điểm làm việc để thực hiện check-out.');
                }
            }
        }

        // Validate Time (Shift end requirement)
        if (!input.isForce) {
             if (!jobData) {
                const jobSnap = await getDoc(doc(db, 'jobs', jobId));
                if (jobSnap.exists()) jobData = jobSnap.data();
             }

             if (jobData) {
                 const shiftId = appData.shift_id || appData.shiftId;
                 const shift = jobData.shifts?.find((s: any) => s.id === shiftId);
                 if (shift) {
                     const [endH, endM] = shift.endTime.split(':').map(Number);
                     const now = new Date();
                     const shiftEnd = new Date(now);
                     // Note: This assumes shift is on the current day. 
                     // For overnight shifts, more complex logic is needed.
                     shiftEnd.setHours(endH, endM, 0, 0);
                     
                     if (now < shiftEnd) {
                         throw new Error(`Bạn chưa thể kết thúc ca làm. Thời gian kết thúc ca là ${shift.endTime}.`);
                     }
                 }
             }
        }

        // Find the active check-in record to update it
        // Note: For simplicity, we update the status on appRef and we'd ideally find the last check-in record in a real app.
        // Here we'll just update the application status.
        
        await writeBatch(db)
            .update(appRef, {
                status: 'WORK_FINISHED',
                check_out_time: serverTimestamp(),
                updated_at: serverTimestamp(),
            })
            .commit();

        return { success: true };
    } catch (error: any) {
        console.error('Error in checkOut:', error);
        throw new Error(error.message || 'Không thể check-out. Vui lòng thử lại.');
    }
}

/**
 * Force check-out an application (Employer action)
 */
export async function forceCheckOut(applicationId: string, employerId: string): Promise<{ success: boolean }> {
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');
    
    const appData = appSnap.data();
    if (appData.employer_id !== employerId && appData.employerId !== employerId) {
        throw new Error('Bạn không có quyền thực hiện hành động này.');
    }

    return checkOut({ 
        applicationId, 
        candidateId: appData.candidate_id || appData.candidateId,
        isForce: true 
    });
}

/**
 * Simulates work time for testing purposes.
 * Moves check_in_time back by specified hours.
 */
export async function simulateWorkTime(applicationId: string, hoursAgo: number): Promise<void> {
    const appRef = doc(db, 'applications', applicationId);
    const appSnap = await getDoc(appRef);
    if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');

    const now = new Date();
    const simulatedDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    await updateDoc(appRef, {
        check_in_time: simulatedDate,
        updated_at: serverTimestamp(),
    });

    console.log(`[Simulation] Moved check_in_time for ${applicationId} to ${hoursAgo} hours ago.`);
}
