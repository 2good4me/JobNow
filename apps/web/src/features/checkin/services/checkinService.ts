import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface CheckInRecord {
    id: string;
    applicationId: string;
    candidateId: string;
    jobId: string;
    shiftId?: string;
    type: 'QR' | 'GPS' | 'MANUAL';
    checkInTime: Date;
    checkOutTime: Date | null;
    gpsLocation?: { latitude: number; longitude: number };
    verifiedBy?: string;
    status: 'CHECKED_IN' | 'CHECKED_OUT' | 'VERIFIED';
}

/**
 * Generate a QR code payload for a specific shift.
 * Payload is a JSON string with job info + timestamp for auto-expiry.
 */
export function generateQRPayload(jobId: string, shiftId: string, employerId: string): string {
    const payload = {
        jobId,
        shiftId,
        employerId,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30_000, // 30 second validity
    };
    return btoa(JSON.stringify(payload));
}

/**
 * Validate a scanned QR code payload.
 */
export function validateQRPayload(encoded: string): { valid: boolean; data?: ReturnType<typeof JSON.parse> } {
    try {
        const data = JSON.parse(atob(encoded));
        if (Date.now() > data.expiresAt) return { valid: false };
        return { valid: true, data };
    } catch {
        return { valid: false };
    }
}

/**
 * Calculate distance between two GPS coordinates in meters (Haversine formula).
 */
export function calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Create a check-in record in the subcollection.
 */
export async function createCheckin(
    applicationId: string,
    data: {
        candidateId: string;
        jobId: string;
        shiftId?: string;
        type: 'QR' | 'GPS' | 'MANUAL';
        gpsLocation?: { latitude: number; longitude: number };
    }
): Promise<string> {
    const checkinsRef = collection(db, 'applications', applicationId, 'checkins');
    const docRef = await addDoc(checkinsRef, {
        ...data,
        status: 'CHECKED_IN',
        checkInTime: serverTimestamp(),
        checkOutTime: null,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Fetch all check-in records for an application.
 */
export async function fetchCheckins(applicationId: string): Promise<CheckInRecord[]> {
    const checkinsRef = collection(db, 'applications', applicationId, 'checkins');
    const q = query(checkinsRef, orderBy('checkInTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapCheckin);
}

/**
 * Fetch check-ins for all applications of a specific job.
 */
export async function fetchCheckinsForJob(jobId: string): Promise<CheckInRecord[]> {
    // First get all applications for this job
    const appsRef = collection(db, 'applications');
    const appsQuery = query(appsRef, where('jobId', '==', jobId));
    const appsSnapshot = await getDocs(appsQuery);

    const allCheckins: CheckInRecord[] = [];
    for (const appDoc of appsSnapshot.docs) {
        const checkins = await fetchCheckins(appDoc.id);
        allCheckins.push(...checkins);
    }
    return allCheckins;
}

/**
 * Subscribe to real-time check-in updates for an application.
 */
export function subscribeToCheckins(
    applicationId: string,
    onUpdate: (checkins: CheckInRecord[]) => void
): Unsubscribe {
    const checkinsRef = collection(db, 'applications', applicationId, 'checkins');
    return onSnapshot(checkinsRef, (snapshot) => {
        const checkins = snapshot.docs.map(mapCheckin);
        onUpdate(checkins);
    });
}

/**
 * Employer verifies / confirms a check-in (manual check-out).
 */
export async function verifyCheckin(applicationId: string, checkinId: string, employerId: string): Promise<void> {
    const checkinRef = doc(db, 'applications', applicationId, 'checkins', checkinId);
    await updateDoc(checkinRef, {
        status: 'VERIFIED',
        verifiedBy: employerId,
    });
}

/**
 * Record check-out time.
 */
export async function checkOut(applicationId: string, checkinId: string): Promise<void> {
    const checkinRef = doc(db, 'applications', applicationId, 'checkins', checkinId);
    await updateDoc(checkinRef, {
        status: 'CHECKED_OUT',
        checkOutTime: serverTimestamp(),
    });
}

function mapCheckin(docSnap: any): CheckInRecord {
    const d = docSnap.data();
    return {
        id: docSnap.id,
        applicationId: d.applicationId || '',
        candidateId: d.candidateId || '',
        jobId: d.jobId || '',
        shiftId: d.shiftId || undefined,
        type: d.type || 'MANUAL',
        checkInTime: d.checkInTime?.toDate?.() ?? new Date(),
        checkOutTime: d.checkOutTime?.toDate?.() ?? null,
        gpsLocation: d.gpsLocation || undefined,
        verifiedBy: d.verifiedBy || undefined,
        status: d.status || 'CHECKED_IN',
    };
}
