import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
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
        const callable = httpsCallable<CheckInInput, CheckInResult>(functions, 'checkIn');
        const { data } = await callable(input);
        return data;
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
        const callable = httpsCallable<CheckOutInput, { success: boolean }>(functions, 'checkOut');
        const { data } = await callable({
            applicationId: input.applicationId,
            candidateId: input.candidateId,
        });
        return data;
    } catch (error: any) {
        console.error('Error in checkOut:', error);
        throw new Error(error.message || 'Không thể check-out. Vui lòng thử lại.');
    }
}

/**
 * Force check-out an application (Employer action)
 */
export async function forceCheckOut(applicationId: string, employerId: string): Promise<{ success: boolean }> {
    const callable = httpsCallable<
        { applicationId: string; employerId: string },
        { success: boolean }
    >(functions, 'forceCheckOut');
    const { data } = await callable({ applicationId, employerId });
    return data;
}

/**
 * Simulates work time for testing purposes.
 * Moves check_in_time back by specified hours.
 */
export async function simulateWorkTime(applicationId: string, hoursAgo: number): Promise<void> {
    const callable = httpsCallable<
        { applicationId: string; hoursAgo: number },
        { success: boolean }
    >(functions, 'simulateWorkTime');
    await callable({ applicationId, hoursAgo });
}
