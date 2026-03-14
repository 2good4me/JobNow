import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit as queryLimit,
    orderBy,
    query,
    where,
    serverTimestamp,
    runTransaction,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
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

/**
 * Submits a rating using a Firestore Transaction to ensure consistency.
 * 1. Creates a review record.
 * 2. Updates the reviewee's average_rating and total_ratings.
 * 3. Creates a notification for the reviewee.
 */
export async function submitRating(input: RatingInput): Promise<RatingResult> {
    const revieweeRef = doc(db, 'users', input.revieweeId);
    const reviewsRef = collection(db, 'reviews');
    const notificationsRef = collection(db, 'notifications');

    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Get reviewee profile for aggregation
            const revieweeSnap = await transaction.get(revieweeRef);
            const revieweeData = revieweeSnap.exists() ? revieweeSnap.data() : {};
            
            const currentTotal = Number(revieweeData.total_ratings || 0);
            const currentAvg = Number(revieweeData.average_rating || 0);
            
            const newTotal = currentTotal + 1;
            const newAvg = Number(((currentAvg * currentTotal + input.rating) / newTotal).toFixed(1));

            // 2. Add Review Document (using generated doc for ID)
            const newReviewRef = doc(reviewsRef);
            transaction.set(newReviewRef, {
                application_id: input.applicationId,
                reviewer_id: input.reviewerId,
                reviewee_id: input.revieweeId,
                rating: input.rating,
                comment: input.comment || '',
                created_at: serverTimestamp(),
            });

            // 3. Add Notification
            const newNotifRef = doc(notificationsRef);
            transaction.set(newNotifRef, {
                userId: input.revieweeId,
                user_id: input.revieweeId,
                type: 'NEW_REVIEW',
                category: 'SYSTEM',
                title: 'Đánh giá mới',
                body: `Bạn vừa nhận được đánh giá ${input.rating} sao từ đối tác.`,
                data: {
                    applicationId: input.applicationId,
                    reviewerId: input.reviewerId,
                    rating: input.rating,
                },
                isRead: false,
                is_read: false,
                created_at: serverTimestamp(),
                createdAt: serverTimestamp(),
            });

            // 4. Update Reviewee Profile using set(merge) for robustness
            transaction.set(revieweeRef, {
                average_rating: newAvg,
                total_ratings: newTotal,
                updated_at: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            console.log(`Review submitted: reviewId=${newReviewRef.id}, app=${input.applicationId}, reviewee=${input.revieweeId}`);
            return { reviewId: newReviewRef.id, updatedReputationScore: newAvg };
        });

        return result;
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
