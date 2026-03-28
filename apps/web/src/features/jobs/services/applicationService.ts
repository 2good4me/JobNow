import { collection, getDocs, query, where, limit, doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
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
 * Subscribe to all applications for a specific job, filtered by employerId.
 */
export function subscribeJobApplications(
    jobId: string, 
    employerId: string, 
    onUpdate: (applications: Application[]) => void
): Unsubscribe {
    const appsRef = collection(db, 'applications');
    
    // Listen for both camelCase and snake_case variants
    const qCamel = query(
        appsRef,
        where('jobId', '==', jobId),
        where('employerId', '==', employerId)
    );
    
    const qSnake = query(
        appsRef,
        where('job_id', '==', jobId),
        where('employer_id', '==', employerId)
    );

    let camelItems: Application[] = [];
    let snakeItems: Application[] = [];

    const flush = () => {
        const deduped = dedupeById([...camelItems, ...snakeItems]);
        onUpdate(deduped);
    };

    const unsubCamel = onSnapshot(qCamel, (snapshot) => {
        camelItems = snapshot.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));
        flush();
    }, (error) => {
        console.error('Error subscribing to job applications (camel):', error);
    });

    const unsubSnake = onSnapshot(qSnake, (snapshot) => {
        snakeItems = snapshot.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));
        flush();
    }, (error) => {
        console.error('Error subscribing to job applications (snake):', error);
    });

    return () => {
        unsubCamel();
        unsubSnake();
    };
}

/**
 * Fetch all applications for a given employer across all jobs.
 */
export async function fetchEmployerApplications(employerId: string): Promise<Application[]> {
    try {
        const appsRef = collection(db, 'applications');
        const qCamel = query(appsRef, where('employerId', '==', employerId), limit(100));
        const qSnake = query(appsRef, where('employer_id', '==', employerId), limit(100));

        const [snapCamel, snapSnake] = await Promise.all([getDocs(qCamel), getDocs(qSnake)]);
        
        const camelItems = snapCamel.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));
        const snakeItems = snapSnake.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));

        return dedupeById([...camelItems, ...snakeItems])
            .sort((a, b) => getApplicationSortTime(b) - getApplicationSortTime(a))
            .slice(0, 100);
    } catch (error) {
        console.error('Error in fetchEmployerApplications:', { employerId, error });
        throw mapServiceError(error, 'Không thể lấy danh sách đơn ứng tuyển. Vui lòng thử lại sau.');
    }
}

/**
 * Subscribe to all applications for a given employer across all jobs.
 */
export function subscribeEmployerApplications(
    employerId: string,
    onUpdate: (applications: Application[]) => void
): Unsubscribe {
    const appsRef = collection(db, 'applications');
    
    const qCamel = query(appsRef, where('employerId', '==', employerId), limit(100));
    const qSnake = query(appsRef, where('employer_id', '==', employerId), limit(100));

    let camelItems: Application[] = [];
    let snakeItems: Application[] = [];

    const flush = () => {
        const deduped = dedupeById([...camelItems, ...snakeItems])
            .sort((a, b) => getApplicationSortTime(b) - getApplicationSortTime(a))
            .slice(0, 100);
        onUpdate(deduped);
    };

    const unsubCamel = onSnapshot(qCamel, (snapshot) => {
        camelItems = snapshot.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));
        flush();
    }, (error) => {
        console.error('Error subscribing to employer applications (camel):', error);
    });

    const unsubSnake = onSnapshot(qSnake, (snapshot) => {
        snakeItems = snapshot.docs.map(docSnap => mapApplicationDocToApplication(docSnap.id, docSnap.data() as any));
        flush();
    }, (error) => {
        console.error('Error subscribing to employer applications (snake):', error);
    });

    return () => {
        unsubCamel();
        unsubSnake();
    };
}

/**
 * Update an application's status directly via Firestore (Client-side logic).
 */
export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
): Promise<Application> {
    try {
        const callable = httpsCallable<
            { applicationId: string; status: ApplicationStatus },
            { application: Record<string, unknown> }
        >(functions, 'updateApplicationStatus');
        const { data } = await callable({ applicationId, status });
        return mapApplicationDocToApplication(applicationId, data.application as Record<string, unknown>);
    } catch (error: any) {
        console.error('Lỗi chi tiết khi updateApplicationStatus:', error);
        if (error?.code) {
           throw new Error(`Firebase [${error.code}]: ` + (error?.message || 'Không rõ nguyên nhân.'));
        }
        throw new Error(error?.message || 'Không thể cập nhật trạng thái đơn ứng tuyển. (Internal)');
    }
}

/**
 * Marks an application as completed and handles payment details.
 */
export async function completeApplicationWithPayment(
    applicationId: string,
    paymentMethod: 'APP' | 'CASH',
    employerId: string
): Promise<Application> {
    try {
        if (paymentMethod === 'APP') {
            const callable = httpsCallable<
                { applicationId: string; employerId: string },
                { amount: number; candidateId: string; employerId: string; jobTitle: string }
            >(functions, 'processPayment');
            await callable({ applicationId, employerId });
        } else {
            const callable = httpsCallable<
                { applicationId: string; employerId: string },
                { success: boolean }
            >(functions, 'markCashPayment');
            await callable({ applicationId, employerId });
        }

        const refreshed = await getDoc(doc(db, 'applications', applicationId));
        if (!refreshed.exists()) {
            throw new Error('Không tìm thấy đơn ứng tuyển sau khi cập nhật thanh toán.');
        }
        return mapApplicationDocToApplication(refreshed.id, refreshed.data() as any);
    } catch (error: any) {
        console.error('Error in completeApplicationWithPayment:', error);
        throw new Error(error.message || 'Thanh toán thất bại.');
    }
}

/**
 * Candidate confirms receipt of cash payment.
 */
export async function confirmPaymentReceived(applicationId: string): Promise<Application> {
    try {
        const appRef = doc(db, 'applications', applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) throw new Error('Đơn ứng tuyển không tồn tại.');

        const appData = appSnap.data();
        const candidateId = String(appData.candidate_id || appData.candidateId || '');

        const callable = httpsCallable<
            { applicationId: string; candidateId: string },
            { success: boolean }
        >(functions, 'confirmCashPaymentReceived');
        await callable({ applicationId, candidateId });

        const refreshed = await getDoc(appRef);
        return mapApplicationDocToApplication(refreshed.id, refreshed.data() as any);
    } catch (error: any) {
        console.error('Error in confirmPaymentReceived:', error);
        throw new Error('Không thể xác nhận thanh toán.');
    }
}
