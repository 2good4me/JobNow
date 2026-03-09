import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type { Application, ApplicationStatus } from '@jobnow/types';
import { mapApplicationDocToApplication } from './adapters';

function dedupeById(items: Application[]): Application[] {
    const map = new Map<string, Application>();
    for (const item of items) {
        map.set(item.id, item);
    }
    return Array.from(map.values());
}

function timestampToMillis(value: unknown): number {
    if (!value) return 0;

    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        try {
            return ((value as { toDate: () => Date }).toDate().getTime());
        } catch {
            return 0;
        }
    }

    const parsed = new Date(value as string | number | Date).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function getApplicationSortTime(application: Application): number {
    return Math.max(
        timestampToMillis(application.updatedAt),
        timestampToMillis(application.createdAt),
        timestampToMillis(application.appliedAt)
    );
}

function mapServiceError(error: unknown, fallbackMessage: string): Error {
    const code = typeof error === 'object' && error && 'code' in error
        ? String((error as { code?: unknown }).code)
        : undefined;

    if (code === 'permission-denied') {
        return new Error('Bạn không có quyền truy cập dữ liệu ứng tuyển. Vui lòng đăng nhập lại.');
    }

    if (code === 'failed-precondition') {
        return new Error('Thiếu chỉ mục Firestore cho truy vấn này. Vui lòng liên hệ kỹ thuật để bổ sung index.');
    }

    return new Error(fallbackMessage);
}

async function fetchApplicationsByField(
    jobField: 'jobId' | 'job_id',
    jobValue: string,
    employerField: 'employerId' | 'employer_id',
    employerValue: string,
    maxResults?: number
): Promise<Application[]> {
    const appsRef = collection(db, 'applications');
    const orderField = (jobField === 'jobId') ? 'createdAt' : 'updated_at';

    // Query with composite index (jobId + employerId) (temporarily removed orderBy)
    const baseQuery = query(
        appsRef,
        where(jobField, '==', jobValue),
        where(employerField, '==', employerValue)
    );
    const finalQuery = maxResults ? query(baseQuery, limit(maxResults)) : baseQuery;
    const snapshot = await getDocs(finalQuery);

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        return mapApplicationDocToApplication(docSnap.id, data);
    });
}

function fetchAllAppsByEmployerField(field: 'employerId' | 'employer_id', value: string, maxResults?: number): Promise<Application[]> {
    const appsRef = collection(db, 'applications');
    const orderField = (field === 'employerId') ? 'createdAt' : 'updated_at';
    const baseQuery = query(appsRef, where(field, '==', value));
    const finalQuery = maxResults ? query(baseQuery, limit(maxResults)) : baseQuery;
    return getDocs(finalQuery).then(snapshot => snapshot.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any)));
}

/**
 * Fetch all applications for a specific job, filtered by employerId.
 */
export async function fetchJobApplications(jobId: string, employerId: string): Promise<Application[]> {
    try {
        const [camelItems, snakeItems] = await Promise.all([
            fetchApplicationsByField('jobId', jobId, 'employerId', employerId),
            fetchApplicationsByField('job_id', jobId, 'employer_id', employerId),
        ]);
        // Remove client-side sorting since Firestore handles it via orderBy, just dedupe.
        return dedupeById([...camelItems, ...snakeItems]);
    } catch (error) {
        console.error('Error in fetchJobApplications:', { jobId, employerId, error });
        throw mapServiceError(error, 'Không thể lấy danh sách ứng viên. Vui lòng thử lại sau.');
    }
}

/**
 * Fetch all applications for a given employer across all jobs.
 */
export async function fetchEmployerApplications(employerId: string): Promise<Application[]> {
    try {
        const [camelItems, snakeItems] = await Promise.all([
            fetchAllAppsByEmployerField('employerId', employerId, 100),
            fetchAllAppsByEmployerField('employer_id', employerId, 100),
        ]);
        return dedupeById([...camelItems, ...snakeItems])
            .sort((a, b) => getApplicationSortTime(b) - getApplicationSortTime(a))
            .slice(0, 100);
    } catch (error) {
        console.error('Error in fetchEmployerApplications:', { employerId, error });
        throw mapServiceError(error, 'Không thể lấy danh sách đơn ứng tuyển. Vui lòng thử lại sau.');
    }
}

/**
 * Update an application's status via callable function (server-side authorization).
 */
export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
): Promise<Application> {
    try {
        const callable = httpsCallable<{ applicationId: string; status: ApplicationStatus }, { application: Application }>(
            functions,
            'updateApplicationStatus'
        );
        const result = await callable({ applicationId, status });
        return result.data.application;
    } catch (error) {
        console.error('Error in updateApplicationStatus:', error);
        throw new Error('Không thể cập nhật trạng thái đơn ứng tuyển.');
    }
}
