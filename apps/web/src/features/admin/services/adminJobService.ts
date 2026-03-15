import {
    collection, query, where, orderBy, limit, getDocs,
    doc, updateDoc, getDoc, startAfter, getCountFromServer,
    serverTimestamp, addDoc,
    type QueryConstraint, type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

/* ── Types ─────────────────────────────────────────── */

export interface AdminJob {
    id: string;
    title: string;
    employer_id: string;
    employer_name?: string;
    category?: string;
    salary: number;
    salary_type: string;
    status: string;
    address?: string;
    created_at: Date;
    updated_at: Date;
    applicant_count?: number;
    report_count?: number;
}

export interface AdminJobFilters {
    search?: string;
    status?: 'ALL' | 'OPEN' | 'ACTIVE' | 'FULL' | 'CLOSED' | 'HIDDEN';
    category?: string;
    hasReports?: boolean;
    sortBy?: 'created_at' | 'salary';
    sortDir?: 'asc' | 'desc';
}

export interface PaginatedJobs {
    jobs: AdminJob[];
    total: number;
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
}

/* ── Read ──────────────────────────────────────────── */

export async function fetchAdminJobs(
    filters: AdminJobFilters,
    pageSize = 20,
    afterDoc?: DocumentSnapshot | null,
): Promise<PaginatedJobs> {
    const jobsRef = collection(db, 'jobs');
    const constraints: QueryConstraint[] = [];

    if (filters.status && filters.status !== 'ALL') {
        constraints.push(where('status', '==', filters.status));
    }

    const sortField = filters.sortBy ?? 'created_at';
    const sortDirection = filters.sortDir ?? 'desc';
    constraints.push(orderBy(sortField, sortDirection));

    if (afterDoc) {
        constraints.push(startAfter(afterDoc));
    }
    constraints.push(limit(pageSize + 1));

    const q = query(jobsRef, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

    let total = 0;
    if (!afterDoc) {
        const countConstraints: QueryConstraint[] = [];
        if (filters.status && filters.status !== 'ALL') {
            countConstraints.push(where('status', '==', filters.status));
        }
        const countQ = query(jobsRef, ...countConstraints);
        const countSnap = await getCountFromServer(countQ);
        total = countSnap.data().count;
    }

    const jobs: AdminJob[] = pageDocs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            title: data.title ?? '',
            employer_id: data.employer_id ?? data.employerId ?? '',
            employer_name: data.employer_name ?? data.employerName ?? '',
            category: data.category ?? data.category_id ?? '',
            salary: data.salary ?? 0,
            salary_type: data.salary_type ?? data.salaryType ?? 'JOB',
            status: data.status ?? 'OPEN',
            address: data.address ?? '',
            created_at: data.created_at?.toDate?.() ?? new Date(),
            updated_at: data.updated_at?.toDate?.() ?? new Date(),
        };
    });

    return { jobs, total, lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null, hasMore };
}

/* ── Actions ──────────────────────────────────────── */

export async function hideJob(jobId: string, adminId: string, reason: string): Promise<void> {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    const employerId = jobSnap.data()?.employer_id ?? jobSnap.data()?.employerId ?? '';

    await updateDoc(jobRef, { status: 'HIDDEN', updated_at: serverTimestamp() });

    await addDoc(collection(db, 'admin_logs'), {
        admin_id: adminId,
        action: 'HIDE_JOB',
        target_type: 'JOB',
        target_id: jobId,
        reason,
        created_at: serverTimestamp(),
    });

    if (employerId) {
        await addDoc(collection(db, 'notifications'), {
            userId: employerId, user_id: employerId,
            type: 'SYSTEM', category: 'SYSTEM',
            title: 'Tin tuyển dụng bị ẩn',
            body: `Tin "${jobSnap.data()?.title}" đã bị ẩn bởi quản trị viên. Lý do: ${reason}`,
            isRead: false, is_read: false,
            created_at: serverTimestamp(), createdAt: serverTimestamp(),
        });
    }
}
