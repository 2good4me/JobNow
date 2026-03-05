import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Job } from '@jobnow/types';
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

function mapJobSnapshot(docSnap: { id: string; data: () => Record<string, unknown> }): Job {
    const raw = docSnap.data();
    const normalized = {
        ...mapNearbyApiToJobDoc(raw),
        employer_id: String(raw.employer_id ?? raw.employerId ?? ''),
        category_id: String(raw.category_id ?? raw.categoryId ?? ''),
        salary_type: (raw.salary_type ?? raw.salaryType ?? 'HOURLY') as any,
        is_gps_required: Boolean(raw.is_gps_required ?? raw.isGpsRequired ?? false),
        shifts: Array.isArray(raw.shifts)
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
        created_at: raw.created_at ?? raw.createdAt,
        updated_at: raw.updated_at ?? raw.updatedAt,
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

        const allItems = [
            ...camelSnapshot.docs.map((docSnap) => mapJobSnapshot(docSnap)),
            ...snakeSnapshot.docs.map((docSnap) => mapJobSnapshot(docSnap)),
        ];

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
        return mapJobSnapshot(docSnap as any);
    } catch (error) {
        console.error('Error in fetchJobById:', error);
        throw new Error('Không thể lấy thông tin tin tuyển dụng.');
    }
}

/**
 * Create a new job posting in Firestore.
 */
export async function createJob(jobData: Partial<Job>): Promise<Job> {
    try {
        const jobsRef = collection(db, 'jobs');
        const newJobRef = doc(jobsRef);
        const latitude = Number(jobData.location?.latitude ?? 0);
        const longitude = Number(jobData.location?.longitude ?? 0);

        const geohash = latitude && longitude
            ? encodeGeohash(latitude, longitude)
            : '';

        const jobToSave = {
            employer_id: jobData.employerId,
            category_id: jobData.categoryId,
            title: jobData.title,
            description: jobData.description,
            salary: jobData.salary,
            salary_type: jobData.salaryType,
            address: jobData.location?.address ?? '',
            location: {
                latitude,
                longitude,
            },
            geohash,
            is_gps_required: jobData.isGpsRequired ?? false,
            status: jobData.status === 'ACTIVE' ? 'OPEN' : (jobData.status ?? 'OPEN'),
            shifts: (jobData.shifts ?? []).map((shift) => ({
                id: shift.id,
                name: shift.name,
                start_time: shift.startTime,
                end_time: shift.endTime,
                quantity: shift.quantity,
            })),
            vacancies: jobData.vacancies,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        };

        await setDoc(newJobRef, jobToSave);
        return mapJobDocToJob(newJobRef.id, jobToSave as any);
    } catch (error) {
        console.error('Error in createJob:', error);
        throw new Error('Không thể tạo tin tuyển dụng. Vui lòng thử lại sau.');
    }
}

/**
 * Update an existing job posting in Firestore.
 */
export async function updateJob(jobId: string, data: Partial<Job>): Promise<void> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.salary !== undefined ? { salary: data.salary } : {}),
            ...(data.salaryType !== undefined ? { salary_type: data.salaryType } : {}),
            ...(data.status !== undefined ? { status: data.status === 'ACTIVE' ? 'OPEN' : data.status } : {}),
            updated_at: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error in updateJob:', error);
        throw new Error('Không thể cập nhật tin tuyển dụng.');
    }
}

/**
 * Delete a job posting from Firestore.
 */
export async function deleteJob(jobId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
        console.error('Error in deleteJob:', error);
        throw new Error('Không thể xoá tin tuyển dụng.');
    }
}
