import { collection, getDocs, query, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { fetchNearbyJobsPage, type NearbyJobResponse } from '@/lib/api';
import type { Job, JobDoc, JobSearchCursor, JobSearchFilters, JobSearchPage } from '@jobnow/types';
import { mapJobDocToJob, mapNearbyApiToJobDoc } from './adapters';

export interface SearchJobsInput {
    lat: number;
    lng: number;
    filters: JobSearchFilters;
    cursor?: string;
}

function decodeCursor(cursor?: string): JobSearchCursor | undefined {
    if (!cursor) return undefined;
    try {
        return JSON.parse(atob(cursor)) as JobSearchCursor;
    } catch {
        return undefined;
    }
}

export function encodeCursor(cursor: JobSearchCursor): string {
    return btoa(JSON.stringify(cursor));
}

export function mapNearbyApiToJobDocSafe(job: NearbyJobResponse): JobDoc {
    return mapNearbyApiToJobDoc(job as unknown as Record<string, unknown>);
}

export async function searchJobs(input: SearchJobsInput): Promise<JobSearchPage> {
    const cursor = decodeCursor(input.cursor);

    const result = await fetchNearbyJobsPage({
        lat: input.lat,
        lng: input.lng,
        radius: input.filters.radius_m,
        salary_min: input.filters.salary_min,
        salary_max: input.filters.salary_max,
        category_ids: input.filters.category_ids,
        shift_time: input.filters.shift_time,
        keyword: input.filters.keyword,
        limit: input.filters.limit,
        cursor: cursor ? encodeCursor(cursor) : undefined,
    });

    const items: Job[] = result.data.map((rawJob) => {
        const jobDoc = mapNearbyApiToJobDocSafe(rawJob);
        return mapJobDocToJob(rawJob.id, jobDoc);
    });

    return {
        items,
        nextCursor: result.next_cursor,
    };
}

export async function fetchAllJobs(): Promise<Job[]> {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
        const raw = docSnap.data();
        const normalized: JobDoc = {
            employer_id: String(raw.employer_id ?? raw.employerId ?? ''),
            category_id: String(raw.category_id ?? raw.categoryId ?? ''),
            title: String(raw.title ?? ''),
            description: String(raw.description ?? ''),
            salary: Number(raw.salary ?? 0),
            salary_type: (raw.salary_type ?? raw.salaryType ?? 'HOURLY') as any,
            location: {
                latitude: Number(raw.location?.latitude ?? 0),
                longitude: Number(raw.location?.longitude ?? 0),
            },
            geohash: String(raw.geohash ?? ''),
            is_gps_required: Boolean(raw.is_gps_required ?? raw.isGpsRequired ?? false),
            status: (raw.status ?? 'OPEN') as any,
            shifts: Array.isArray(raw.shifts) ? raw.shifts : [],
            created_at: raw.created_at ?? raw.createdAt,
            updated_at: raw.updated_at ?? raw.updatedAt,
        };
        return mapJobDocToJob(docSnap.id, normalized);
    });
}

export async function getJobById(jobId: string): Promise<Job | null> {
    const snapshot = await getDoc(doc(db, 'jobs', jobId));
    if (!snapshot.exists()) return null;

    const raw = snapshot.data() as Record<string, unknown>;
    const normalized: JobDoc = {
        ...mapNearbyApiToJobDoc(raw),
        employer_id: String(raw.employer_id ?? raw.employerId ?? ''),
        category_id: String(raw.category_id ?? raw.categoryId ?? ''),
        salary_type: (raw.salary_type ?? raw.salaryType ?? 'HOURLY') as JobDoc['salary_type'],
        is_gps_required: Boolean(raw.is_gps_required ?? raw.isGpsRequired ?? false),
        created_at: raw.created_at ?? raw.createdAt,
        updated_at: raw.updated_at ?? raw.updatedAt,
    };

    return mapJobDocToJob(snapshot.id, normalized);
}
