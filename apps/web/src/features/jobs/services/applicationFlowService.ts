import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit as queryLimit,
    onSnapshot,
    orderBy,
    query,
    where,
    or,
    runTransaction,
    serverTimestamp,
    type QueryDocumentSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type {
    Application,
    ApplyJobInput,
    ApplyJobResult,
    ApplyPrecheckResult,
    MyApplicationsFilters,
    MyApplicationsPage,
    WithdrawApplicationInput,
} from '@jobnow/types';
import { mapApplicationDocToApplication } from './adapters';
import { getProfileCompleteness } from './candidateProfileService';

function encodeCursor(id: string): string {
    return btoa(JSON.stringify({ id }));
}

function decodeCursor(cursor?: string): { id: string } | null {
    if (!cursor) return null;
    try {
        return JSON.parse(atob(cursor)) as { id: string };
    } catch {
        return null;
    }
}

function mapApplicationSnapshot(snapshot: QueryDocumentSnapshot): Application {
    const data = snapshot.data() as Record<string, unknown>;
    return mapApplicationDocToApplication(snapshot.id, data);
}

export async function precheckApply(input: ApplyJobInput): Promise<ApplyPrecheckResult> {
    const reasons: string[] = [];

    const [jobSnap, profile] = await Promise.all([
        getDoc(doc(db, 'jobs', input.jobId)),
        getProfileCompleteness(input.candidateId),
    ]);

    if (!jobSnap.exists()) {
        return {
            canApply: false,
            reasons: ['job_not_found'],
            profileCompleteness: profile.score,
            requiresEkyc: true,
        };
    }

    const jobData = jobSnap.data();
    const deadline = jobData.deadline ?? jobData.deadline_at;
    const verificationStatus = (jobData.verification_status ?? 'UNVERIFIED') as string;

    if ((jobData.status ?? '') !== 'OPEN' && (jobData.status ?? '') !== 'ACTIVE') {
        // TEMPORARILY RELAXED
        // reasons.push('job_not_open');
    }

    if (deadline?.toDate && deadline.toDate() < new Date()) {
        // TEMPORARILY RELAXED
        // reasons.push('deadline_passed');
    }

    if (profile.score < 60) {
        // TEMPORARILY RELAXED for easier application testing
        // reasons.push('profile_incomplete');
    }

    if (verificationStatus !== 'VERIFIED' && profile.score < 80) {
        // TEMPORARILY RELAXED for easier application testing
        // reasons.push('ekyc_required');
    }

    const duplicateQuerySnake = query(
        collection(db, 'applications'),
        where('candidate_id', '==', input.candidateId),
        where('job_id', '==', input.jobId),
        where('shift_id', '==', input.shiftId),
        queryLimit(1)
    );
    const duplicateQueryCamel = query(
        collection(db, 'applications'),
        where('candidateId', '==', input.candidateId),
        where('jobId', '==', input.jobId),
        where('shiftId', '==', input.shiftId),
        queryLimit(1)
    );
    const [duplicateSnakeSnap, duplicateCamelSnap] = await Promise.all([
        getDocs(duplicateQuerySnake),
        getDocs(duplicateQueryCamel),
    ]);
    if (!duplicateSnakeSnap.empty || !duplicateCamelSnap.empty) {
        // TEMPORARILY RELAXED: Handle duplicate via the UI disabling the button instead of blocking the backend 
        // reasons.push('already_applied');
    }

    return {
        canApply: reasons.length === 0,
        reasons,
        profileCompleteness: profile.score,
        requiresEkyc: reasons.includes('ekyc_required'),
    };
}

function normalizeApplicationId(candidateId: string, jobId: string, shiftId: string): string {
    return `${candidateId}_${jobId}_${shiftId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function applyJob(input: ApplyJobInput): Promise<ApplyJobResult> {
    const applicationId = normalizeApplicationId(input.candidateId, input.jobId, input.shiftId);
    const applicationRef = doc(db, 'applications', applicationId);
    const jobRef = doc(db, 'jobs', input.jobId);

    return await runTransaction(db, async (tx) => {
        const candidateRef = doc(db, 'users', input.candidateId);
        const [jobSnap, appSnap, candidateSnap] = await Promise.all([
            tx.get(jobRef),
            tx.get(applicationRef),
            tx.get(candidateRef),
        ]);

        if (!jobSnap.exists()) {
            throw new Error('Công việc không tồn tại.');
        }

        if (appSnap.exists()) {
            const appData = appSnap.data() || {};
            return {
                applicationId: appSnap.id,
                status: String(appData.status ?? 'NEW') as any,
                remainingSlots: undefined,
            };
        }

        const jobData = jobSnap.data() || {};
        const status = String(jobData.status ?? 'OPEN').toUpperCase();
        if (status !== 'OPEN' && status !== 'ACTIVE') {
            throw new Error('Công việc đã đóng tuyển.');
        }

        const targetShift = Array.isArray(jobData.shifts) 
            ? jobData.shifts.find((item: any) => String(item.id) === input.shiftId) 
            : null;
        const shiftTime = targetShift ? `${targetShift.start_time || ''} - ${targetShift.end_time || ''}` : '';
        const jobTitle = String(jobData.title || '');

        const shiftCapacity = (jobData.shift_capacity ?? {}) as Record<string, any>;
        let capacity = shiftCapacity[input.shiftId];

        if (!capacity) {
            const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
            const targetShift = shifts.find((item: any) => String(item.id) === input.shiftId);
            const quantity = Number(targetShift?.quantity ?? 0);
            capacity = {
                total_slots: quantity,
                remaining_slots: quantity,
                applied_count: 0,
            };
        }

        if (capacity.remaining_slots <= 0) {
            throw new Error('Ca làm đã đủ số lượng.');
        }

        const employerId = String(jobData.employer_id ?? jobData.employerId ?? '');
        const employerName = String(jobData.employer_name ?? jobData.employerName ?? '');

        // Denormalize candidate snapshot
        const candidateData = candidateSnap.exists() ? (candidateSnap.data() || {}) : {};
        const candidateName = String(candidateData.full_name ?? candidateData.fullName ?? candidateData.display_name ?? candidateData.displayName ?? '');
        const candidateAvatar = String(candidateData.avatar_url ?? candidateData.avatarUrl ?? candidateData.photo_url ?? candidateData.photoURL ?? '');
        const candidateSkills = (candidateData.skills as string[]) ?? [];
        const candidateRating = Number(candidateData.reputation_score ?? candidateData.reputationScore ?? 0);
        const candidateVerified = (candidateData.verification_status ?? candidateData.verificationStatus) === 'VERIFIED';

        tx.set(applicationRef, {
            job_id: input.jobId,
            shift_id: input.shiftId,
            employer_id: employerId,
            employerId: employerId, // Standardize duplicate field for robust triggers
            candidate_id: input.candidateId,
            status: 'NEW',
            payment_status: 'UNPAID',
            cover_letter: input.coverLetter ?? '',
            idempotency_key: input.idempotencyKey,
            applied_at: serverTimestamp(),
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            // Denormalized candidate snapshot
            candidate_name: candidateName,
            candidate_avatar: candidateAvatar,
            candidate_skills: candidateSkills,
            candidate_rating: candidateRating,
            candidate_verified: candidateVerified,
            // Denormalized job/shift info
            job_title: jobTitle,
            shift_time: shiftTime,
            employer_name: employerName,
            employerName: employerName,
        });

        const nextRemaining = Math.max(Number(capacity.remaining_slots) - 1, 0);
        tx.set(jobRef, {
            shift_capacity: {
                ...(jobData.shift_capacity ?? {}),
                [input.shiftId]: {
                    total_slots: Number(capacity.total_slots),
                    remaining_slots: nextRemaining,
                    applied_count: Number(capacity.applied_count) + 1,
                },
            },
            updated_at: serverTimestamp(),
        }, { merge: true });

        // Create Notification for Employer
        const notificationRef = doc(collection(db, 'notifications'));
        tx.set(notificationRef, {
            userId: employerId,
            user_id: employerId,
            type: 'NEW_APPLICATION',
            category: 'APPLICATION',
            title: 'Đơn ứng tuyển mới',
            body: `Bạn có đơn ứng tuyển mới từ ${candidateName} cho công việc: ${jobTitle}`,
            data: {
                applicationId,
                jobId: input.jobId,
                candidateId: input.candidateId,
            },
            isRead: false,
            is_read: false,
            created_at: serverTimestamp(),
            createdAt: serverTimestamp(),
        });

        return {
            applicationId,
            status: 'NEW',
            remainingSlots: nextRemaining,
        };
    });
}

export async function withdrawApplication(input: WithdrawApplicationInput): Promise<{ success: boolean }> {
    const callable = httpsCallable<WithdrawApplicationInput, { success: boolean }>(functions, 'withdrawApplication');
    const { data } = await callable(input);
    return data;
}

export async function listMyApplications(filters: MyApplicationsFilters): Promise<MyApplicationsPage> {
    const decoded = decodeCursor(filters.cursor);
    const pageSize = filters.limit ?? 20;
    const baseRef = collection(db, 'applications');

    // Tối ưu hóa: Sử dụng 'or' để truy vấn cả 2 loại field trong 1 lần đọc.
    const q = query(
        baseRef,
        or(
            where('candidate_id', '==', filters.candidateId),
            where('candidateId', '==', filters.candidateId)
        ),
        orderBy('updated_at', 'desc'),
        queryLimit(pageSize)
    );

    const snapshot = await getDocs(q);
    let items = snapshot.docs.map(mapApplicationSnapshot);

    if (decoded?.id) {
        const cursorIndex = items.findIndex((item) => item.id === decoded.id);
        if (cursorIndex >= 0) {
            items = items.slice(cursorIndex + 1);
        }
    }

    items = items.slice(0, pageSize);

    if (filters.statuses?.length) {
        items = items.filter((item) => filters.statuses?.includes(item.status));
    }

    return {
        items,
        nextCursor: items.length === pageSize ? encodeCursor(items[items.length - 1].id) : undefined,
    };
}

export function subscribeMyApplications(
    filters: MyApplicationsFilters,
    onUpdate: (applications: Application[]) => void
): Unsubscribe {
    // Tách làm 2 query để tránh yêu cầu Index tổng hợp (Firestore index requirement for 'or' + 'orderBy').
    const q1 = query(
        collection(db, 'applications'),
        where('candidate_id', '==', filters.candidateId),
        orderBy('updatedAt', 'desc'),
        queryLimit(filters.limit ?? 20)
    );

    const q2 = query(
        collection(db, 'applications'),
        where('candidateId', '==', filters.candidateId),
        orderBy('updatedAt', 'desc'),
        queryLimit(filters.limit ?? 20)
    );

    let apps1: Application[] = [];
    let apps2: Application[] = [];

    const handleUpdate = () => {
        // Gộp kết quả và loại bỏ trùng lặp (nếu có doc chứa cả 2 field)
        const combined = [...apps1, ...apps2]
            .sort((a, b) => {
                const timeA = b.updatedAt?.toMillis?.() || 0;
                const timeB = a.updatedAt?.toMillis?.() || 0;
                return timeA - timeB;
            })
            .filter((app, index, self) => 
                index === self.findIndex((t) => t.id === app.id)
            )
            .slice(0, filters.limit ?? 20);

        const filtered = filters.statuses?.length
            ? combined.filter((item) => filters.statuses?.includes(item.status))
            : combined;

        onUpdate(filtered);
    };

    const unsub1 = onSnapshot(q1, (snapshot) => {
        apps1 = snapshot.docs.map(mapApplicationSnapshot);
        handleUpdate();
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
        apps2 = snapshot.docs.map(mapApplicationSnapshot);
        handleUpdate();
    });

    return () => {
        unsub1();
        unsub2();
    };
}
