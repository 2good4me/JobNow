import {
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';

export interface AdminVerificationItem {
    id: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    frontImageUrl: string;
    submittedAt: Date | null;
    updatedAt: Date | null;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    verificationStatus: string;
    ocrData?: {
        cccd_number?: string | null;
        full_name?: string | null;
        dob?: string | null;
    };
    rejectionReason?: string | null;
}

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        try {
            return (value as { toDate: () => Date }).toDate();
        } catch {
            return null;
        }
    }

    const parsed = new Date(value as string | number | Date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function fetchPendingVerifications(): Promise<AdminVerificationItem[]> {
    const verificationQuery = query(
        collectionGroup(db, 'verification_requests'),
        where('status', '==', 'PENDING'),
        orderBy('created_at', 'desc'),
    );

    const snapshot = await getDocs(verificationQuery);
    const items = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userId =
            String(data.user_id ?? '') ||
            docSnap.ref.parent.parent?.id ||
            '';

        const userSnap = userId ? await getDoc(doc(db, 'users', userId)) : null;
        const userData = userSnap?.data() ?? {};

        return {
            id: docSnap.id,
            userId,
            status: (data.status ?? 'PENDING') as AdminVerificationItem['status'],
            frontImageUrl: String(data.front_image_url ?? data.document_url ?? ''),
            submittedAt: toDate(data.submitted_at ?? data.created_at),
            updatedAt: toDate(data.updated_at),
            candidateName: String(userData.full_name ?? userData.fullName ?? data.ocr_data?.full_name ?? 'Chưa có tên'),
            candidateEmail: String(userData.email ?? ''),
            candidatePhone: String(userData.phone_number ?? userData.phoneNumber ?? ''),
            verificationStatus: String(userData.verification_status ?? 'UNVERIFIED'),
            ocrData: data.ocr_data
                ? {
                    cccd_number: data.ocr_data.cccd_number ?? null,
                    full_name: data.ocr_data.full_name ?? null,
                    dob: data.ocr_data.dob ?? null,
                }
                : undefined,
            rejectionReason: typeof data.rejection_reason === 'string' ? data.rejection_reason : null,
        } satisfies AdminVerificationItem;
    }));

    return items;
}

export async function reviewVerificationRequest(
    userId: string,
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
): Promise<void> {
    const callable = httpsCallable<
        { userId: string; requestId: string; action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
        { success: boolean }
    >(functions, 'reviewVerificationRequest');

    await callable({
        userId,
        requestId,
        action,
        rejectionReason,
    });
}
