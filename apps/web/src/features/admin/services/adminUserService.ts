import {
    collection, query, where, orderBy, limit, getDocs,
    doc, updateDoc, getDoc, startAfter, getCountFromServer,
    serverTimestamp, addDoc,
    type QueryConstraint, type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserProfile } from '@/features/auth/types/user';

/* ── Types ─────────────────────────────────────────── */

export interface AdminUserFilters {
    search?: string;
    role?: 'ALL' | 'CANDIDATE' | 'EMPLOYER';
    status?: 'ALL' | 'ACTIVE' | 'LOCKED' | 'BANNED';
    sortBy?: 'created_at' | 'reputation_score';
    sortDir?: 'asc' | 'desc';
}

export interface PaginatedUsers {
    users: UserProfile[];
    total: number;
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
}

/* ── Read ──────────────────────────────────────────── */

export async function fetchAdminUsers(
    filters: AdminUserFilters,
    pageSize = 20,
    afterDoc?: DocumentSnapshot | null,
): Promise<PaginatedUsers> {
    const usersRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [];

    // Role filter
    if (filters.role && filters.role !== 'ALL') {
        constraints.push(where('role', '==', filters.role));
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
        constraints.push(where('status', '==', filters.status));
    }

    // Sort
    const sortField = filters.sortBy ?? 'created_at';
    const sortDirection = filters.sortDir ?? 'desc';
    constraints.push(orderBy(sortField, sortDirection));

    // Pagination cursor
    if (afterDoc) {
        constraints.push(startAfter(afterDoc));
    }

    constraints.push(limit(pageSize + 1)); // fetch 1 extra to check hasMore

    const q = query(usersRef, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

    // Total count (separate query – only when first page)
    let total = 0;
    if (!afterDoc) {
        const countConstraints: QueryConstraint[] = [];
        if (filters.role && filters.role !== 'ALL') {
            countConstraints.push(where('role', '==', filters.role));
        }
        if (filters.status && filters.status !== 'ALL') {
            countConstraints.push(where('status', '==', filters.status));
        }
        const countQ = query(usersRef, ...countConstraints);
        const countSnap = await getCountFromServer(countQ);
        total = countSnap.data().count;
    }

    const users: UserProfile[] = pageDocs.map((d) => {
        const data = d.data();
        return {
            uid: d.id,
            email: data.email ?? '',
            full_name: data.full_name ?? data.fullName ?? '',
            role: data.role ?? 'CANDIDATE',
            phone_number: data.phone_number ?? data.phoneNumber ?? '',
            avatar_url: data.avatar_url ?? data.avatarUrl ?? null,
            bio: data.bio ?? null,
            address_text: data.address_text ?? null,
            status: data.status ?? 'ACTIVE',
            balance: data.balance ?? 0,
            reputation_score: data.reputation_score ?? data.reputationScore ?? 0,
            skills: data.skills ?? [],
            identity_images: data.identity_images ?? [],
            company_name: data.company_name ?? undefined,
            verification_status: data.verification_status ?? undefined,
            created_at: data.created_at?.toDate?.() ?? new Date(),
            updated_at: data.updated_at?.toDate?.() ?? new Date(),
        } as UserProfile;
    });

    return {
        users,
        total,
        lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
        hasMore,
    };
}

export async function fetchUserById(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
        uid: snap.id,
        email: data.email ?? '',
        full_name: data.full_name ?? data.fullName ?? '',
        role: data.role ?? 'CANDIDATE',
        phone_number: data.phone_number ?? data.phoneNumber ?? '',
        avatar_url: data.avatar_url ?? data.avatarUrl ?? null,
        bio: data.bio ?? null,
        address_text: data.address_text ?? null,
        status: data.status ?? 'ACTIVE',
        balance: data.balance ?? 0,
        reputation_score: data.reputation_score ?? data.reputationScore ?? 0,
        skills: data.skills ?? [],
        identity_images: data.identity_images ?? [],
        company_name: data.company_name ?? undefined,
        verification_status: data.verification_status ?? undefined,
        created_at: data.created_at?.toDate?.() ?? new Date(),
        updated_at: data.updated_at?.toDate?.() ?? new Date(),
    } as UserProfile;
}

/* ── Actions ──────────────────────────────────────── */

export async function updateUserStatus(
    userId: string,
    newStatus: 'ACTIVE' | 'LOCKED' | 'BANNED',
    adminId: string,
    reason: string,
): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        status: newStatus,
        updated_at: serverTimestamp(),
    });

    // Audit log
    await addDoc(collection(db, 'admin_logs'), {
        admin_id: adminId,
        action: newStatus === 'ACTIVE' ? 'UNLOCK_USER' : newStatus === 'LOCKED' ? 'LOCK_USER' : 'BAN_USER',
        target_type: 'USER',
        target_id: userId,
        reason,
        created_at: serverTimestamp(),
    });

    // Notify user
    await addDoc(collection(db, 'notifications'), {
        userId,
        user_id: userId,
        type: 'SYSTEM',
        category: 'SYSTEM',
        title: newStatus === 'BANNED' ? 'Tài khoản bị cấm' : newStatus === 'LOCKED' ? 'Tài khoản bị khóa' : 'Tài khoản được mở khóa',
        body: reason,
        isRead: false,
        is_read: false,
        created_at: serverTimestamp(),
        createdAt: serverTimestamp(),
    });
}
