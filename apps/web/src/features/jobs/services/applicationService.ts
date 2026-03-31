import { collection, getDocs, query, where, limit, doc, getDoc, updateDoc, serverTimestamp, onSnapshot, writeBatch, increment, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { addNotification } from '@/features/notifications/services/notificationService';
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
 * Update an application's status directly via Firestore
 */
export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
): Promise<Application> {
    try {
        const appRef = doc(db, 'applications', applicationId);
        
        await updateDoc(appRef, {
            status: status,
            updatedAt: serverTimestamp(),
            updated_at: serverTimestamp()
        });
        
        const refreshed = await getDoc(appRef);
        const data = refreshed.data() as Record<string, unknown>;

        // Send notification
        if (status === 'APPROVED' || status === 'REJECTED') {
            const candidateId = String(data.candidate_id || data.candidateId || '');
            const jobTitle = String(data.job_title || data.jobTitle || 'Một công việc');
            if (candidateId) {
                addNotification({
                    userId: candidateId,
                    type: status === 'APPROVED' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
                    category: 'APPLICATION',
                    title: status === 'APPROVED' ? 'Đơn ứng tuyển được duyệt' : 'Đơn ứng tuyển bị từ chối',
                    body: status === 'APPROVED' 
                        ? `Chúc mừng! Bạn đã được nhận vào vị trí ${jobTitle}.`
                        : `Rất tiếc, đơn ứng tuyển cho vị trí ${jobTitle} của bạn không phù hợp.`,
                    data: { applicationId }
                }).catch(console.error);
            }
        }

        return mapApplicationDocToApplication(refreshed.id, data);
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
        const appRef = doc(db, 'applications', applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) throw new Error('Không tìm thấy đơn ứng tuyển.');
        const appData = appSnap.data() as Record<string, any>;
        
        if (paymentMethod === 'APP') {
            const candidateId = String(appData.candidate_id || appData.candidateId || '');
            const jobId = String(appData.job_id || appData.jobId || '');

            let amount = 0;
            if (jobId) {
                const jobSnap = await getDoc(doc(db, 'jobs', jobId));
                if (jobSnap.exists()) {
                    const jobData = jobSnap.data();
                    const salary = Number(jobData.salary || 0);
                    const salaryType = jobData.salary_type || jobData.salaryType;

                    if (salaryType === 'HOURLY') {
                        const checkIn = appData.check_in_time || appData.checkInTime;
                        const checkOut = appData.check_out_time || appData.checkOutTime;
                        
                        if (checkIn && checkOut) {
                            const inDate = typeof checkIn.toDate === 'function' ? checkIn.toDate() : new Date(checkIn);
                            const outDate = typeof checkOut.toDate === 'function' ? checkOut.toDate() : new Date(checkOut);
                            const diffMs = outDate.getTime() - inDate.getTime();
                            const hours = Math.max(0, diffMs / (1000 * 60 * 60));
                            amount = Math.round(hours * salary);
                        } else {
                            // Fallback calculation if times are missing but it's completed
                            amount = salary * 4;
                        }
                    } else {
                        // DAILY, PER_SHIFT, JOB, etc.
                        amount = salary;
                    }
                }
            }

            if (amount <= 0) amount = 50000; // ultimate fallback to visually see the test transaction happening

            const batch = writeBatch(db);
            const now = serverTimestamp();

            // 1. Cập nhật đơn
            batch.update(appRef, {
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                payment_status: 'PAID',
                paymentMethod: 'APP',
                payment_method: 'APP',
                updatedAt: now,
                updated_at: now
            });

            // 2. Chuyển tiền mock (update balance)
            if (employerId) {
                batch.update(doc(db, 'users', employerId), {
                    balance: increment(-amount)
                });
                
                const txEmpRef = doc(collection(db, 'transactions'));
                batch.set(txEmpRef, {
                    user_id: employerId,
                    userId: employerId,
                    amount: -amount,
                    type: 'PAYMENT',
                    status: 'COMPLETED',
                    reference_id: applicationId,
                    description: 'Thanh toán lương qua ứng dụng',
                    created_at: now,
                    updated_at: now
                });
            }

            if (candidateId) {
                batch.update(doc(db, 'users', candidateId), {
                    balance: increment(amount)
                });

                const txCanRef = doc(collection(db, 'transactions'));
                batch.set(txCanRef, {
                    user_id: candidateId,
                    userId: candidateId,
                    amount: amount,
                    type: 'SALARY',
                    status: 'COMPLETED',
                    reference_id: applicationId,
                    description: 'Nhận lương qua ứng dụng',
                    created_at: now,
                    updated_at: now
                });
            }

            await batch.commit();
        } else {
            await updateDoc(appRef, {
                status: 'CASH_CONFIRMATION',
                paymentMethod: 'CASH',
                payment_method: 'CASH',
                updatedAt: serverTimestamp(),
                updated_at: serverTimestamp()
            });
        }

        // Notify Candidate about Payment Completion
        const candidateId = String(appData.candidate_id || appData.candidateId || '');
        const jobTitle = String(appData.job_title || appData.jobTitle || 'công việc');
        if (candidateId) {
            addNotification({
                userId: candidateId,
                type: 'PAYMENT_RECEIVED',
                category: 'PAYMENT',
                title: paymentMethod === 'APP' ? 'Thanh toán thành công' : 'Chờ xác nhận tiền mặt',
                body: paymentMethod === 'APP'
                    ? `Bạn vừa nhận được thanh toán cho ${jobTitle}.`
                    : `Nhà tuyển dụng đã xác nhận thanh toán tiền mặt cho ${jobTitle}. Vui lòng xác nhận.`,
                data: { applicationId }
            }).catch(console.error);
        }

        const refreshed = await getDoc(appRef);
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

        await updateDoc(appRef, {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            payment_status: 'PAID',
            updatedAt: serverTimestamp(),
            updated_at: serverTimestamp()
        });

        const refreshed = await getDoc(appRef);
        return mapApplicationDocToApplication(refreshed.id, refreshed.data() as any);
    } catch (error: any) {
        console.error('Error in confirmPaymentReceived:', error);
        throw new Error('Không thể xác nhận thanh toán.');
    }
}
