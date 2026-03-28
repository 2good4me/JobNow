import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit as queryLimit,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type { RatingInput, RatingResult } from '@jobnow/types';

export interface RatingEligibility {
    canRate: boolean;
    reason?: string;
}

export interface RatingRecord {
    id: string;
    applicationId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    createdAt?: Date;
}

export async function submitRating(input: RatingInput): Promise<RatingResult> {
    try {
        const callable = httpsCallable<RatingInput, RatingResult>(functions, 'submitRating');
        const { data } = await callable(input);
        return data;
    } catch (error: any) {
        console.error('Error in submitRating:', error);
        throw new Error(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
}

export async function getRatingEligibility(applicationId: string, reviewerId: string): Promise<RatingEligibility> {
    const application = await getDoc(doc(db, 'applications', applicationId));
    if (!application.exists()) {
        return { canRate: false, reason: 'application_not_found' };
    }

    const data = application.data();
    const status = String(data.status ?? 'NEW');
    if (status !== 'COMPLETED') {
        return { canRate: false, reason: 'application_not_completed' };
    }

    // Check if user is part of the application
    const candId = data.candidate_id || data.candidateId;
    const empId = data.employer_id || data.employerId;
    if (reviewerId !== candId && reviewerId !== empId) {
        return { canRate: false, reason: 'not_authorized' };
    }

    const existing = await getDocs(query(
        collection(db, 'reviews'),
        where('application_id', '==', applicationId),
        where('reviewer_id', '==', reviewerId),
        queryLimit(1)
    ));

    if (!existing.empty) {
        return { canRate: false, reason: 'already_rated' };
    }

    return { canRate: true };
}

export async function listRatingsForUser(userId: string, pageSize = 20): Promise<RatingRecord[]> {
    const q = query(
        collection(db, 'reviews'),
        where('reviewee_id', '==', userId),
        orderBy('created_at', 'desc'),
        queryLimit(pageSize)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
            id: docSnap.id,
            applicationId: String(d.application_id ?? ''),
            reviewerId: String(d.reviewer_id ?? ''),
            revieweeId: String(d.reviewee_id ?? ''),
            rating: Number(d.rating ?? 0),
            comment: d.comment as string | undefined,
            createdAt: d.created_at?.toDate?.(),
        };
    });
}
