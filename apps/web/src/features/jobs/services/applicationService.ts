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

async function fetchApplicationsByField(field: 'jobId' | 'job_id' | 'employerId' | 'employer_id', value: string, maxResults?: number): Promise<Application[]> {
    const appsRef = collection(db, 'applications');
    const q = maxResults
        ? query(appsRef, where(field, '==', value), orderBy('created_at', 'desc'), limit(maxResults))
        : query(appsRef, where(field, '==', value));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        return mapApplicationDocToApplication(docSnap.id, data);
    });
}

/**
 * Fetch all applications for a specific job.
 */
export async function fetchJobApplications(jobId: string): Promise<Application[]> {
    try {
        const [camelItems, snakeItems] = await Promise.all([
            fetchApplicationsByField('jobId', jobId),
            fetchApplicationsByField('job_id', jobId),
        ]);
        return dedupeById([...camelItems, ...snakeItems]);
    } catch (error) {
        console.error('Error in fetchJobApplications:', error);
        throw new Error('Không thể lấy danh sách ứng viên. Vui lòng thử lại sau.');
    }
}

/**
 * Fetch all applications for a given employer across all jobs.
 */
export async function fetchEmployerApplications(employerId: string): Promise<Application[]> {
    try {
        const [camelItems, snakeItems] = await Promise.all([
            fetchApplicationsByField('employerId', employerId, 100),
            fetchApplicationsByField('employer_id', employerId, 100),
        ]);
        return dedupeById([...camelItems, ...snakeItems]);
    } catch (error) {
        console.error('Error in fetchEmployerApplications:', error);
        throw new Error('Không thể lấy danh sách đơn ứng tuyển. Vui lòng thử lại sau.');
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
