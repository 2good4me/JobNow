import { 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp, 
    collection, 
    addDoc 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { addNotification } from '@/features/notifications/services/notificationService';
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
 * Robust date/time parsing for client-side comparison.
 * Supports YYYY-MM-DD and DD/MM/YYYY.
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
    const dateParts = dateStr.split(/[-/]/);
    let year, month, day;
    
    if (dateParts.length === 3) {
      if (dateParts[0].length === 4) {
        // YYYY-MM-DD
        [year, month, day] = dateParts.map(Number);
      } else if (dateParts[2].length === 4) {
        // DD-MM-YYYY or DD/MM/YYYY
        [day, month, year] = dateParts.map(Number);
      } else {
        return new Date(`${dateStr}T${timeStr}:00`);
      }
      
      const timeParts = timeStr.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      // We use the local Date constructor for comparison as both start and now are local context
      return new Date(year, month - 1, day, hours, minutes, 0);
    }
    
    return new Date(`${dateStr}T${timeStr}:00`);
}

/**
 * Performs check-in directly using Firestore SDK (Client-side validation).
 * Enforces the 30-minute window for Spark plan compatibility.
 */
export async function checkIn(input: CheckInInput): Promise<CheckInResult> {
    try {
        const appRef = doc(db, 'applications', input.applicationId);
        const appSnap = await getDoc(appRef);
        
        if (!appSnap.exists()) {
            throw new Error('Không tìm thấy đơn ứng tuyển.');
        }

        const appData = appSnap.data();
        const jobId = appData.job_id || appData.jobId;
        const shiftId = appData.shift_id || appData.shiftId;
        
        // Fetch job info to get scheduled time
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);
        const jobData = jobSnap.data() || {};
        
        // Find shift start time
        const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
        const targetShift = shifts.find((s: any) => String(s.id) === String(shiftId));
        
        let isLate = false;
        let lateMinutes = 0;

        const startDate = jobData.start_date || jobData.startDate;
        const startTime = targetShift?.start_time || targetShift?.startTime;
        
        if (startDate && startTime) {
            const now = new Date();
            const scheduledStart = parseDateTime(startDate, startTime);
            const diffMs = now.getTime() - scheduledStart.getTime();
            const diffMins = diffMs / (1000 * 60);

            if (diffMins < -30) {
                throw new Error('Còn quá sớm để check-in. Bạn chỉ có thể check-in trước tối đa 30 phút.');
            }

            if (diffMins > 30) {
                throw new Error('Đã quá thời hạn check-in (tối đa 30 phút sau khi ca bắt đầu). Vui lòng liên hệ nhà tuyển dụng.');
            }

            if (diffMins > 0) {
                isLate = true;
                lateMinutes = Math.round(diffMins);
            }
        }

        // Create check-in record in subcollection
        const checkinsRef = collection(appRef, 'checkins');
        const checkinDoc = await addDoc(checkinsRef, {
            application_id: input.applicationId,
            candidate_id: input.candidateId,
            job_id: jobId,
            shift_id: shiftId,
            type: 'GPS',
            gps_location: {
                latitude: input.latitude,
                longitude: input.longitude,
                accuracy: input.accuracy,
            },
            status: 'CHECKED_IN',
            is_late: isLate,
            late_minutes: lateMinutes,
            check_in_time: serverTimestamp(),
            created_at: serverTimestamp(),
        });

        // Update application status
        await updateDoc(appRef, {
            status: 'CHECKED_IN',
            is_late: isLate,
            late_minutes: lateMinutes,
            checkInTime: serverTimestamp(),
            check_in_time: serverTimestamp(),
            checkInLocation: { lat: input.latitude, lng: input.longitude },
            updated_at: serverTimestamp()
        });

        // Notify Employer
        const employerId = String(jobData.employer_id || jobData.employerId || '');
        const candidateName = String(appData.candidate_name || appData.candidateName || 'Ứng viên');
        const jobTitle = String(jobData.title || jobData.jobTitle || 'Công việc');
        if (employerId) {
            addNotification({
                userId: employerId,
                type: 'SHIFT_CHECKIN',
                category: 'SHIFT',
                title: 'Ứng viên đã check-in',
                body: `${candidateName} đã check-in cho ca làm tại "${jobTitle}"${isLate ? ` (Muộn ${lateMinutes} phút)` : ''}.`,
                data: { applicationId: input.applicationId, jobId: String(jobId) }
            }).catch(console.error);
        }
        
        return { 
            success: true, 
            checkinId: checkinDoc.id,
            status: 'CHECKED_IN',
            method: 'GPS' 
        } as any;
    } catch (error: any) {
        console.error('Error in checkIn:', error);
        throw error;
    }
}

/**
 * Performs check-out directly using Firestore SDK.
 */
export async function checkOut(input: CheckOutInput & { latitude?: number; longitude?: number; accuracy?: number; isForce?: boolean }): Promise<{ success: boolean }> {
    try {
        const appRef = doc(db, 'applications', input.applicationId);
        
        // Find active check-in
        // Note: For simplicity on client-side, we update the application. 
        // In a real app we'd query the subcollection for the active one.
        
        await updateDoc(appRef, {
            status: 'COMPLETED',
            checkOutTime: serverTimestamp(),
            check_out_time: serverTimestamp(),
            checkOutLocation: { lat: input.latitude || 0, lng: input.longitude || 0 },
            updated_at: serverTimestamp()
        });

        // Notify Employer
        const appSnap = await getDoc(appRef);
        const appData = appSnap.data() || {};
        const employerId = String(appData.employer_id || appData.employerId || '');
        const candidateName = String(appData.candidate_name || appData.candidateName || 'Ứng viên');
        const jobTitle = String(appData.job_title || appData.jobTitle || 'Công việc');
        if (employerId) {
            addNotification({
                userId: employerId,
                type: 'PAYMENT_REMINDER',
                category: 'PAYMENT',
                title: 'Ứng viên đã hoàn thành ca làm',
                body: `${candidateName} đã check-out tại "${jobTitle}". Vui lòng kiểm tra và thanh toán lương.`,
                data: { applicationId: input.applicationId, jobId: String(appData.jobId || appData.job_id || '') }
            }).catch(console.error);
        }
        
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
    await updateDoc(appRef, {
        status: 'COMPLETED',
        checkOutTime: serverTimestamp(),
        check_out_time: serverTimestamp(),
        forceCheckOutBy: employerId,
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp()
    });
    return { success: true };
}

/**
 * Simulates work time for testing purposes.
 */
export async function simulateWorkTime(applicationId: string, hoursAgo: number): Promise<void> {
    const checkInTime = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, {
        checkInTime: checkInTime,
        check_in_time: checkInTime
    });
}
