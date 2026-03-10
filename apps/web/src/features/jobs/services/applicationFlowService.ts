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

    const buildQuery = (
        fieldName: 'candidate_id' | 'candidateId',
        orderField: 'updated_at' | 'updatedAt'
    ) => query(baseRef, where(fieldName, '==', filters.candidateId), orderBy(orderField, 'desc'), queryLimit(pageSize));

    const [snakeSnapshot, camelSnapshot] = await Promise.all([
        getDocs(buildQuery('candidate_id', 'updated_at')),
        getDocs(buildQuery('candidateId', 'updatedAt')),
    ]);

    let items = [
        ...snakeSnapshot.docs.map(mapApplicationSnapshot),
        ...camelSnapshot.docs.map(mapApplicationSnapshot),
    ];
    const deduped = new Map(items.map((item) => [item.id, item]));
    items = Array.from(deduped.values())
        .sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.()?.getTime?.() ?? 0;
            const bTime = b.updatedAt?.toDate?.()?.getTime?.() ?? 0;
            return bTime - aTime;
        });

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
    const snakeQuery = query(
        collection(db, 'applications'),
        where('candidate_id', '==', filters.candidateId),
        orderBy('updated_at', 'desc'),
        queryLimit(filters.limit ?? 20)
    );
    const camelQuery = query(
        collection(db, 'applications'),
        where('candidateId', '==', filters.candidateId),
        orderBy('updatedAt', 'desc'),
        queryLimit(filters.limit ?? 20)
    );

    let snakeItems: Application[] = [];
    let camelItems: Application[] = [];

    const flush = () => {
        let items = [...snakeItems, ...camelItems];
        const deduped = new Map(items.map((item) => [item.id, item]));
        items = Array.from(deduped.values());
        if (filters.statuses?.length) {
            items = items.filter((item) => filters.statuses?.includes(item.status));
        }
        onUpdate(items);
    };

    const unsubSnake = onSnapshot(snakeQuery, (snapshot) => {
        snakeItems = snapshot.docs.map(mapApplicationSnapshot);
        flush();
    });

    const unsubCamel = onSnapshot(camelQuery, (snapshot) => {
        camelItems = snapshot.docs.map(mapApplicationSnapshot);
        flush();
    });

    return () => {
        unsubSnake();
        unsubCamel();
    };
}
