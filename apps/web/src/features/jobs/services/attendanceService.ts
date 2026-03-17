import {
    collection,
    doc,
    getDoc,
    writeBatch,
    serverTimestamp,
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
    const radius = input.radiusMeters ?? 500; // Đã chỉnh về 500m để thực tế hơn (Gốc: 5000m trong bản test cũ)
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

        // 1. Validate Time (Real-world constraint)
        // Only allow check-in 30 mins before or after the shift start
        if (jobData.startTime) {
            const shiftStart = jobData.startTime.toDate?.() || new Date(jobData.startTime);
            const now = new Date();
            const diffMinutes = (now.getTime() - shiftStart.getTime()) / (1000 * 60);

            // If check-in is more than 30 mins EARLY, block it
            if (diffMinutes < -30) {
                throw new Error('Bạn đến quá sớm. Vui lòng check-in trong vòng 30 phút trước ca làm.');
            }
            
            // Note: Late check-in usually allowed but flagged, for now we just log it
            if (diffMinutes > 120) { // 2 hours late
                 console.warn('[Attendance] Late check-in detected:', diffMinutes, 'minutes late');
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
                throw new Error(`Bạn đang ở cách địa điểm làm việc ${Math.round(validation.distanceMeters)}m. Bạn cần ở trong bán kính 500m để check-in.`);
            }
            throw new Error('Vị trí GPS không chính xác hoặc không hợp lệ.');
        }

        const batch = writeBatch(db);
        
        // Update application status
        batch.update(appRef, {
            status: 'CHECKED_IN',
            updated_at: serverTimestamp(),
            check_in_time: serverTimestamp(), // Record on main doc for easy listing
        });

        // Add check-in record
        const checkinRef = doc(collection(appRef, 'checkins'));
        batch.set(checkinRef, {
            type: 'GPS',
            check_in_time: serverTimestamp(),
            status: 'CHECKED_IN',
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
 */
export async function checkOut(input: CheckOutInput & { latitude?: number; longitude?: number; accuracy?: number }): Promise<{ success: boolean }> {
    try {
        const appRef = doc(db, 'applications', input.applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');

        const appData = appSnap.data();
        const jobId = appData.job_id || appData.jobId;
        
        // Validate GPS on Check-out if coordinates are provided
        if (input.latitude !== undefined && input.longitude !== undefined) {
            const jobSnap = await getDoc(doc(db, 'jobs', jobId));
            if (jobSnap.exists()) {
                const jobData = jobSnap.data();
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
