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
    return snapshot.docs
        .map(docSnap => {
            const raw = docSnap.data();
            const shiftCapacity = (raw.shift_capacity ?? raw.shiftCapacity ?? {}) as Record<string, any>;
            const normalized: JobDoc = {
                employer_id: String(raw.employer_id ?? raw.employerId ?? ''),
                employer_name: String(raw.employer_name ?? raw.employerName ?? ''),
                category_id: String(raw.category_id ?? raw.categoryId ?? ''),
                category: String(raw.category ?? ''),
                title: String(raw.title ?? ''),
                description: String(raw.description ?? ''),
                salary: Number(raw.salary ?? 0),
                salary_type: (raw.salary_type ?? raw.salaryType ?? 'HOURLY') as any,
                address: String(raw.address ?? raw.address_text ?? ''),
                location: {
                    latitude: Number(raw.location?.latitude ?? 0),
                    longitude: Number(raw.location?.longitude ?? 0),
                },
                geohash: String(raw.geohash ?? ''),
                is_gps_required: Boolean(raw.is_gps_required ?? raw.isGpsRequired ?? false),
                status: (raw.status ?? 'OPEN') as any,
                shifts: Array.isArray(raw.shifts) ? raw.shifts : [],
                shift_capacity: shiftCapacity,
                created_at: raw.created_at ?? raw.createdAt,
                updated_at: raw.updated_at ?? raw.updatedAt,
                images: Array.isArray(raw.images) ? raw.images : [],
                is_premium: Boolean(raw.is_premium ?? raw.isPremium ?? false),
                moderation_status: (raw.moderation_status ?? raw.moderationStatus) as JobDoc['moderation_status'],
                moderation_reason: String(raw.moderation_reason ?? raw.moderationReason ?? ''),
                is_boosted: Boolean(raw.is_boosted ?? raw.isBoosted ?? false),
                boost_expires_at: raw.boost_expires_at ?? raw.boostExpiresAt,
                boost_package_code: (raw.boost_package_code ?? raw.boostPackageCode) as JobDoc['boost_package_code'],
            };
            return mapJobDocToJob(docSnap.id, normalized);
        })
        .filter(job => {
            const moderationStatus = String(job.moderationStatus ?? '').toUpperCase();
            return (moderationStatus === '' || moderationStatus === 'APPROVED') && ['OPEN', 'ACTIVE', 'FULL'].includes(String(job.status ?? '').toUpperCase());
        })
        .filter(job => {
            // Hide jobs where ALL shifts are fully booked (remaining_slots <= 0)
            // If no shift_capacity data exists, show the job (assume slots available)
            const raw = snapshot.docs.find(d => d.id === job.id)?.data();
            if (!raw) return true;
            const shiftCapacity = (raw.shift_capacity ?? raw.shiftCapacity) as Record<string, any> | undefined;
            if (!shiftCapacity || Object.keys(shiftCapacity).length === 0) return true;
            // Show job if at least one shift still has remaining slots
            const hasOpenSlot = Object.values(shiftCapacity).some(
                (cap: any) => !cap || cap.remaining_slots === undefined || Number(cap.remaining_slots) > 0
            );
            return hasOpenSlot;
        })
        .sort((a, b) => {
            const boostA = a.isBoosted ? 1 : 0;
            const boostB = b.isBoosted ? 1 : 0;
            if (boostA !== boostB) return boostB - boostA;

            const timeA = new Date(a.createdAt ?? 0).getTime();
            const timeB = new Date(b.createdAt ?? 0).getTime();
            return timeB - timeA;
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
