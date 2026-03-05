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
        reasons.push('job_not_open');
    }

    if (deadline?.toDate && deadline.toDate() < new Date()) {
        reasons.push('deadline_passed');
    }

    if (profile.score < 60) {
        reasons.push('profile_incomplete');
    }

    if (verificationStatus !== 'VERIFIED' && profile.score < 80) {
        reasons.push('ekyc_required');
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
        reasons.push('already_applied');
    }

    return {
        canApply: reasons.length === 0,
        reasons,
        profileCompleteness: profile.score,
        requiresEkyc: reasons.includes('ekyc_required'),
    };
}

export async function applyJob(input: ApplyJobInput): Promise<ApplyJobResult> {
    const callable = httpsCallable<ApplyJobInput, ApplyJobResult>(functions, 'applyJob');
    const { data } = await callable(input);
    return data;
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
