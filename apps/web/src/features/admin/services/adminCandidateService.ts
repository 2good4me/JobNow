import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    serverTimestamp,
    limit,
    updateDoc,
    startAfter,
    getCountFromServer,
    type DocumentSnapshot,
    type QueryConstraint
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserProfile } from '@/features/auth/types/user';

export interface PaginatedCandidates {
    users: UserProfile[];
    total: number;
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
}

/**
 * Fetch all candidate users with optional verification status filtering.
 */
export async function fetchCandidateUsers(
    filters: { verificationStatus?: string; search?: string },
    pageSize = 20,
    afterDoc?: DocumentSnapshot | null
): Promise<PaginatedCandidates> {
    try {
        const usersRef = collection(db, 'users');
        const constraints: QueryConstraint[] = [
            where('role', '==', 'CANDIDATE')
        ];

        if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
            constraints.push(where('verification_status', '==', filters.verificationStatus));
        }

        // No orderBy to avoid index requirements for now

        if (afterDoc) {
            constraints.push(startAfter(afterDoc));
        }

        constraints.push(limit(pageSize + 1));

        const q = query(usersRef, ...constraints);
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

        let total = 0;
        if (!afterDoc) {
            const countConstraints: QueryConstraint[] = [where('role', '==', 'CANDIDATE')];
            if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
                countConstraints.push(where('verification_status', '==', filters.verificationStatus));
            }
            const countQ = query(usersRef, ...countConstraints);
            const countSnap = await getCountFromServer(countQ);
            total = countSnap.data().count;
        }

        const users: UserProfile[] = pageDocs.map(d => {
            const data = d.data();
            return {
                uid: d.id,
                full_name: data.full_name || data.fullName || '',
                email: data.email || '',
                phone_number: data.phone_number || data.phoneNumber || '',
                verification_status: data.verification_status || 'UNVERIFIED',
                created_at: data.created_at?.toDate?.() || new Date(),
                avatar_url: data.avatar_url || null,
            } as UserProfile;
        });

        return {
            users,
            total,
            lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
            hasMore
        };
    } catch (error) {
        console.error('Error fetching candidates:', error);
        throw new Error('Không thể tải danh sách ứng viên.');
    }
}

/**
 * Directly update a user's verification status.
 */
export async function updateUserVerificationDirectly(
    userId: string,
    status: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'UNVERIFIED',
    reason?: string
): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            verification_status: status,
            ...(reason ? { verification_rejection_reason: reason } : {}),
            updated_at: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating verification status:', error);
        throw new Error('Không thể cập nhật trạng thái xác thực.');
    }
}
