import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc,
    increment,
    writeBatch,
} from 'firebase/firestore';

import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type { BoostPackage, Job, JobPostingQuota } from '@jobnow/types';
import { mapJobDocToJob, mapNearbyApiToJobDoc } from './adapters';

export type CreateJobDTO = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

const GEOHASH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function encodeGeohash(latitude: number, longitude: number, precision = 9): string {
    let latRange = [-90, 90];
    let lngRange = [-180, 180];
    let hash = '';
    let bit = 0;
    let ch = 0;
    let isEven = true;

    while (hash.length < precision) {
        if (isEven) {
            const mid = (lngRange[0] + lngRange[1]) / 2;
            if (longitude >= mid) {
                ch |= 1 << (4 - bit);
                lngRange[0] = mid;
            } else {
                lngRange[1] = mid;
            }
        } else {
            const mid = (latRange[0] + latRange[1]) / 2;
            if (latitude >= mid) {
                ch |= 1 << (4 - bit);
                latRange[0] = mid;
            } else {
                latRange[1] = mid;
            }
        }

        isEven = !isEven;
        if (bit < 4) {
            bit += 1;
        } else {
            hash += GEOHASH_BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }

    return hash;
}

function dedupeJobs(items: Job[]): Job[] {
    const map = new Map<string, Job>();
    for (const item of items) {
        map.set(item.id, item);
    }
    return Array.from(map.values());
}

async function fetchShiftDocs(jobId: string): Promise<Array<{ id: string; name: string; start_time: string; end_time: string; quantity: number }>> {
    const snapshot = await getDocs(collection(db, 'jobs', jobId, 'shifts'));
    return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: String(data.name ?? ''),
            start_time: String(data.start_time ?? data.startTime ?? '00:00'),
            end_time: String(data.end_time ?? data.endTime ?? '00:00'),
            quantity: Number(data.quantity ?? 0),
        };
    });
}

function mapJobSnapshot(
    docSnap: { id: string; data: () => Record<string, unknown> },
    shiftsOverride?: Array<{ id: string; name: string; start_time: string; end_time: string; quantity: number }>,
): Job {
    const raw = docSnap.data();
    
    // Convert Firestore Timestamp to Date if it has a toDate method
    const convertTimestamp = (timestamp: any): string | undefined => {
        if (!timestamp) return undefined;
        if (typeof timestamp === 'string') return timestamp;
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        return undefined;
    };
    
    const normalized = {
        ...mapNearbyApiToJobDoc(raw),
        employer_id: String(raw.employer_id ?? raw.employerId ?? ''),
        category_id: String(raw.category_id ?? raw.categoryId ?? ''),
        salary_type: (raw.salary_type ?? raw.salaryType ?? 'HOURLY') as any,
        is_gps_required: Boolean(raw.is_gps_required ?? raw.isGpsRequired ?? false),
        shifts: Array.isArray(shiftsOverride) && shiftsOverride.length > 0
            ? shiftsOverride
            : Array.isArray(raw.shifts)
            ? raw.shifts.map((shift) => {
                const s = shift as Record<string, unknown>;
                return {
                    id: String(s.id ?? ''),
                    name: String(s.name ?? ''),
                    start_time: String(s.start_time ?? s.startTime ?? '00:00'),
                    end_time: String(s.end_time ?? s.endTime ?? '00:00'),
                    quantity: Number(s.quantity ?? 0),
                };
            })
            : [],
        created_at: convertTimestamp(raw.created_at ?? raw.createdAt),
        updated_at: convertTimestamp(raw.updated_at ?? raw.updatedAt),
        moderation_status: (raw.moderation_status ?? raw.moderationStatus) as any,
        moderation_reason: String(raw.moderation_reason ?? raw.moderationReason ?? ''),
        is_boosted: Boolean(raw.is_boosted ?? raw.isBoosted ?? false),
        boost_expires_at: raw.boost_expires_at ?? raw.boostExpiresAt,
        boost_package_code: (raw.boost_package_code ?? raw.boostPackageCode) as any,
    };

    return mapJobDocToJob(docSnap.id, normalized);
}

/**
 * Fetch all jobs for a given employer.
 */
export async function fetchEmployerJobs(employerId: string): Promise<Job[]> {
    try {
        const jobsRef = collection(db, 'jobs');
        const [camelSnapshot, snakeSnapshot] = await Promise.all([
            getDocs(query(jobsRef, where('employerId', '==', employerId))),
            getDocs(query(jobsRef, where('employer_id', '==', employerId))),
        ]);

        const allDocs = [...camelSnapshot.docs, ...snakeSnapshot.docs];
        const allItems = await Promise.all(allDocs.map(async (docSnap) => {
            const shifts = await fetchShiftDocs(docSnap.id);
            return mapJobSnapshot(docSnap, shifts);
        }));

        return dedupeJobs(allItems);
    } catch (error) {
        console.error('Error in fetchEmployerJobs:', error);
        throw new Error('Không thể lấy danh sách tin tuyển dụng. Vui lòng thử lại sau.');
    }
}

/**
 * Fetch a single job by its Firestore document ID.
 */
export async function fetchJobById(jobId: string): Promise<Job | null> {
    try {
        const docSnap = await getDoc(doc(db, 'jobs', jobId));
        if (!docSnap.exists()) return null;
        const shifts = await fetchShiftDocs(docSnap.id);
        return mapJobSnapshot(docSnap as any, shifts);
    } catch (error) {
        console.error('Error in fetchJobById:', error);
        throw new Error('Không thể lấy thông tin tin tuyển dụng.');
    }
}

/**
 * Create a new job posting in Firestore directly (bypassing Cloud Function for Spark plan compatibility).
 */
export async function createJob(jobData: Partial<Job>): Promise<Job> {
    try {
        console.log('[createJob] v2 - DIRECT FIRESTORE WRITE - START');
        const { getAuth } = await import('firebase/auth');

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Bạn cần đăng nhập để đăng tin.');

        // Fetch employer profile to get name
        const employerSnap = await getDoc(doc(db, 'users', user.uid));
        if (!employerSnap.exists()) throw new Error('Không tìm thấy hồ sơ nhà tuyển dụng.');
        const employerData = employerSnap.data();
        const employerName = String(
            employerData.company_name ??
            employerData.full_name ??
            employerData.fullName ??
            'Nhà tuyển dụng JobNow'
        );

        const shifts = (jobData.shifts ?? []).map((shift, index) => {
            const id = String(shift.id || `shift_${Date.now()}_${index + 1}`);
            return {
                id,
                name: String(shift.name || `Ca ${index + 1}`),
                start_time: String(shift.startTime || '08:00'),
                end_time: String(shift.endTime || '17:00'),
                quantity: Math.max(Number(shift.quantity || 1), 1),
                status: 'OPEN',
            };
        });

        const shiftCapacity: Record<string, { total_slots: number; remaining_slots: number; applied_count: number }> = {};
        shifts.forEach((s) => {
            shiftCapacity[s.id] = { total_slots: s.quantity, remaining_slots: s.quantity, applied_count: 0 };
        });

        const lat = Number(jobData.location?.latitude ?? 0);
        const lng = Number(jobData.location?.longitude ?? 0);

        const jobRef = doc(collection(db, 'jobs'));
        const now = serverTimestamp();

        const jobPayload = {
            employer_id: user.uid,
            employer_name: employerName,
            category_id: String(jobData.categoryId ?? ''),
            title: String(jobData.title ?? '').trim(),
            description: String(jobData.description ?? '').trim(),
            salary: Number(jobData.salary ?? 0),
            salary_type: (jobData.salaryType ? String(jobData.salaryType).toUpperCase() : 'HOURLY'),
            address: String(jobData.location?.address ?? ''),
            location: { latitude: lat, longitude: lng },
            geohash: encodeGeohash(lat, lng),
            is_gps_required: Boolean(jobData.isGpsRequired ?? false),
            status: ((jobData.status as string) ?? 'OPEN').toUpperCase() as 'OPEN' | 'ACTIVE' | 'DRAFT',
            moderation_status: 'PENDING_REVIEW',

            shifts,
            shift_capacity: shiftCapacity,
            vacancies: Number(jobData.vacancies ?? shifts.reduce((s, sh) => s + sh.quantity, 0)),
            deadline: jobData.deadline ?? null,
            requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
            images: Array.isArray(jobData.images) ? jobData.images : [],
            gender_preference: String(jobData.genderPreference ?? 'ANY').toUpperCase(),
            start_date: jobData.startDate ?? null,
            is_premium: false,
            is_boosted: false,
            boost_expires_at: null,
            created_at: now,
            updated_at: now,
        };

        const batch = writeBatch(db);
        batch.set(jobRef, jobPayload);
        shifts.forEach((shift) => {
            const shiftRef = doc(collection(db, 'jobs', jobRef.id, 'shifts'), shift.id);
            batch.set(shiftRef, {
                ...shift,
                job_id: jobRef.id,
                employer_id: user.uid,
                created_at: now,
                updated_at: now,
            });
        });
        console.log('--- FIRESTORE JOB PAYLOAD ---', JSON.stringify(jobPayload, null, 2));
        await batch.commit();


        const created = await fetchJobById(jobRef.id);
        if (!created) throw new Error('Không thể tải lại tin sau khi tạo.');
        return created;
    } catch (error) {
        console.error('--- FULL CREATE JOB ERROR ---', error);
        if (error && typeof error === 'object') {
            const fbError = error as any;
            console.error('Error Code:', fbError.code);
            console.error('Error Details:', fbError.details ?? fbError.message);
        }
        throw new Error((error as { message?: string })?.message || 'Không thể tạo tin tuyển dụng. Vui lòng thử lại sau.');
    }
}


/**
 * Update an existing job posting in Firestore.
 */
export async function updateJob(jobId: string, data: Partial<Job>): Promise<void> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        const latitude = Number(data.location?.latitude ?? 0);
        const longitude = Number(data.location?.longitude ?? 0);
        const nextGeohash = latitude && longitude
            ? encodeGeohash(latitude, longitude)
            : '';

        const updateData: Record<string, unknown> = {
            updated_at: serverTimestamp(),
        };

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.salary !== undefined) updateData.salary = data.salary;
        if (data.salaryType !== undefined) updateData.salary_type = data.salaryType;
        if (data.status !== undefined) updateData.status = data.status === 'ACTIVE' ? 'OPEN' : data.status;
        if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
        if (data.vacancies !== undefined) updateData.vacancies = data.vacancies;
        if (data.deadline !== undefined) updateData.deadline = data.deadline;
        if (data.requirements !== undefined) updateData.requirements = data.requirements;
        if (data.images !== undefined) updateData.images = data.images;
        if (data.genderPreference !== undefined) updateData.gender_preference = data.genderPreference;
        if (data.startDate !== undefined) updateData.start_date = data.startDate;
        if (data.isPremium !== undefined) updateData.is_premium = data.isPremium;
        if (data.isGpsRequired !== undefined) updateData.is_gps_required = data.isGpsRequired;
        if (data.moderationStatus !== undefined) updateData.moderation_status = data.moderationStatus;
        if (data.moderationReason !== undefined) updateData.moderation_reason = data.moderationReason;
        if (data.isBoosted !== undefined) updateData.is_boosted = data.isBoosted;
        if (data.boostExpiresAt !== undefined) updateData.boost_expires_at = data.boostExpiresAt;
        if (data.boostPackageCode !== undefined) updateData.boost_package_code = data.boostPackageCode;

        if (data.location !== undefined) {
            updateData.address = data.location?.address ?? '';
            updateData.location = {
                latitude,
                longitude,
            };
            updateData.geohash = nextGeohash;
        }

        if (data.shifts !== undefined) {
            updateData.shifts = data.shifts.map((shift) => ({
                id: shift.id,
                name: shift.name,
                start_time: shift.startTime,
                end_time: shift.endTime,
                quantity: shift.quantity,
            }));
        }

        await updateDoc(jobRef, updateData);
    } catch (error) {
        console.error('Error in updateJob:', error);
        throw new Error('Không thể cập nhật tin tuyển dụng.');
    }
}

/**
 * Delete a job posting directly from Firestore (bypassing Cloud Function for Spark plan).
 */
export async function deleteJob(jobId: string): Promise<void> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        // Soft delete: mark as CLOSED then hard delete
        await updateDoc(jobRef, {
            status: 'CLOSED',
            updated_at: serverTimestamp(),
        });
        // Then do hard delete
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(jobRef);
    } catch (error) {
        console.error('Error in deleteJob:', error);
        throw new Error('Không thể xoá tin tuyển dụng: ' + (error as { message?: string })?.message);
    }
}


export async function fetchMyJobPostingQuota(): Promise<JobPostingQuota> {
    const callable = httpsCallable<Record<string, never>, JobPostingQuota>(functions, 'getMyJobPostingQuota');
    const result = await callable({});
    return result.data;
}

export async function reviewJobModeration(
    jobId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string,
): Promise<void> {
    const callable = httpsCallable<{ jobId: string; action: 'APPROVE' | 'REJECT'; reason?: string }, { success: boolean }>(
        functions,
        'reviewJobModeration',
    );
    await callable({ jobId, action, reason });
}

export async function purchaseBoostPackage(
    jobId: string,
    packageCode: BoostPackage['code'],
): Promise<{ expiresAt: string; price: number }> {
    const callable = httpsCallable<
        { jobId: string; packageCode: BoostPackage['code'] },
        { success: boolean; expiresAt: string; price: number }
    >(functions, 'purchaseBoostPackage');
    const result = await callable({ jobId, packageCode });
    return {
        expiresAt: result.data.expiresAt,
        price: result.data.price,
    };
}

export async function closeJobSafely(
    jobId: string,
    confirmed = false,
    notifyCandidates = true,
): Promise<{ requiresConfirmation: boolean; affectedCandidates: number; latePenaltyPossible: boolean; success?: boolean }> {
    const callable = httpsCallable<
        { jobId: string; confirmed?: boolean; notifyCandidates?: boolean },
        { requiresConfirmation: boolean; affectedCandidates: number; latePenaltyPossible: boolean; success?: boolean }
    >(functions, 'closeJobSafely');
    const result = await callable({ jobId, confirmed, notifyCandidates });
    return result.data;
}

export function getBoostPackages(): BoostPackage[] {
    return [
        {
            id: 'BOOST_24H',
            code: 'BOOST_24H',
            name: 'Đẩy top 24 giờ',
            description: 'Ưu tiên hiển thị trong 24 giờ.',
            price: 39000,
            durationHours: 24,
            active: true,
        },
        {
            id: 'BOOST_3D',
            code: 'BOOST_3D',
            name: 'Đẩy top 3 ngày',
            description: 'Ưu tiên hiển thị trong 3 ngày.',
            price: 99000,
            durationHours: 72,
            active: true,
        },
        {
            id: 'BOOST_7D',
            code: 'BOOST_7D',
            name: 'Đẩy top 7 ngày',
            description: 'Ưu tiên hiển thị trong 7 ngày.',
            price: 199000,
            durationHours: 168,
            active: true,
        },
    ];
}

/**
 * Increment the view count for a job posting.
 */
export async function incrementJobView(jobId: string): Promise<void> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
            viewCount: increment(1),
            view_count: increment(1) // update both fields just in case
        });
    } catch (error) {
        console.error('Error in incrementJobView:', error);
        // We don't throw here to avoid disrupting the UI if tracking fails
    }
}

/**
 * Fetch all job categories from Firestore.
 */
export async function fetchCategories(): Promise<string[]> {
    try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        const categories = snapshot.docs.map(doc => {
            const data = doc.data();
            return data.name as string || doc.id;
        }).filter(Boolean);

        return categories;
    } catch (error) {
        console.error('Error in fetchCategories:', error);
        return [];
    }
}
