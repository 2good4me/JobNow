import { db, admin } from '../config/firebase';
import * as geofire from 'geofire-common';

export interface ShiftData {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    quantity: number;
}

export interface JobData {
    employer_id: string;
    employer_name?: string;
    category_id?: string;
    category?: string;
    title: string;
    description: string;
    salary: number;
    salary_type: 'HOURLY' | 'DAILY' | 'JOB' | 'PER_SHIFT' | 'MONTHLY';
    address: string;
    location: { latitude: number; longitude: number };
    is_gps_required: boolean;
    status: 'OPEN' | 'ACTIVE' | 'FULL' | 'CLOSED' | 'HIDDEN' | 'DRAFT';
    shifts: ShiftData[];
    geohash?: string;
    created_at?: admin.firestore.FieldValue;
    updated_at?: admin.firestore.FieldValue;
    moderation_status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
    is_boosted?: boolean;
    boost_expires_at?: admin.firestore.Timestamp | null;
}

export interface NearbySearchOptions {
    lat: number;
    lng: number;
    radiusInMeters: number;
    salaryMin?: number;
    salaryMax?: number;
    categoryIds?: string[];
    shiftTime?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    keyword?: string;
    limit: number;
    offset: number;
}

export interface NearbySearchResult {
    items: Array<Record<string, unknown>>;
    nextOffset?: number;
}

function normalizeStatus(status: unknown): string {
    const s = String(status ?? 'OPEN').toUpperCase();
    if (s === 'ACTIVE') return 'OPEN';
    return s;
}

function getShiftStartTime(shift: Record<string, unknown>): string {
    return String(shift.start_time ?? shift.startTime ?? '00:00');
}

function shiftToBucket(startTime: string): NearbySearchOptions['shiftTime'] {
    const hour = Number(startTime.split(':')[0] ?? 0);
    if (hour >= 5 && hour < 12) return 'MORNING';
    if (hour >= 12 && hour < 17) return 'AFTERNOON';
    if (hour >= 17 && hour < 22) return 'EVENING';
    return 'NIGHT';
}

function getTimestampMillis(value: unknown): number {
    if (!value) return 0;
    const ts = value as { toMillis?: () => number; toDate?: () => Date };
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (typeof ts.toDate === 'function') return ts.toDate().getTime();

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function includesKeyword(job: Record<string, unknown>, keyword?: string): boolean {
    if (!keyword) return true;
    const target = keyword.trim().toLowerCase();
    if (!target) return true;

    const haystack = [
        String(job.title ?? ''),
        String(job.description ?? ''),
        String(job.category ?? ''),
        String(job.category_id ?? ''),
        String(job.address ?? ''),
    ].join(' ').toLowerCase();

    return haystack.includes(target);
}

function matchCategory(job: Record<string, unknown>, categoryIds?: string[]): boolean {
    if (!categoryIds?.length) return true;
    const normalized = categoryIds.map((item) => item.toLowerCase());
    const category = String(job.category ?? '').toLowerCase();
    const categoryId = String(job.category_id ?? '').toLowerCase();
    return normalized.includes(category) || normalized.includes(categoryId);
}

function matchShift(shiftTime: NearbySearchOptions['shiftTime'], shiftsRaw: unknown): boolean {
    if (!shiftTime) return true;
    if (!Array.isArray(shiftsRaw)) return false;

    return shiftsRaw.some((shift) => {
        if (!shift || typeof shift !== 'object') return false;
        const startTime = getShiftStartTime(shift as Record<string, unknown>);
        return shiftToBucket(startTime) === shiftTime;
    });
}

export class JobService {
    private collection = db.collection('jobs');

    async createJob(data: JobData) {
        const geohash = geofire.geohashForLocation([data.location.latitude, data.location.longitude]);
        const newJobRef = this.collection.doc();

        // 1. Fetch employer's verification status for Tier Logic
        const employerSnap = await db.collection('users').doc(data.employer_id).get();
        const verificationStatus = employerSnap.exists ? (employerSnap.data()?.verification_status || 'UNVERIFIED') : 'UNVERIFIED';

        // 2. Process shifts with Tier Logic
        const shiftsWithIds = data.shifts.map((shift, index) => {
            const shiftStatus = (verificationStatus === 'UNVERIFIED' && index > 0) ? 'LOCKED_TIER_1' : 'OPEN';
            return {
                ...shift,
                id: shift.id || db.collection('dummy').doc().id,
                status: shiftStatus
            };
        });

        const jobPayload = {
            ...data,
            status: 'DRAFT',
            moderation_status: 'PENDING_REVIEW',
            shifts: shiftsWithIds,
            geohash,
            is_boosted: false,
            boost_expires_at: null,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        };

        const batch = db.batch();
        batch.set(newJobRef, jobPayload);

        // 3. Create shifts subcollection (Source of Truth for capacity and status)
        shiftsWithIds.forEach(shift => {
            const shiftRef = newJobRef.collection('shifts').doc(shift.id);
            batch.set(shiftRef, {
                ...shift,
                job_id: newJobRef.id,
                employer_id: data.employer_id,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        
        return { id: newJobRef.id, ...jobPayload };
    }

    async getNearbyJobs(options: NearbySearchOptions): Promise<NearbySearchResult> {
        const {
            lat,
            lng,
            radiusInMeters,
            salaryMin,
            salaryMax,
            categoryIds,
            shiftTime,
            keyword,
            limit,
            offset,
        } = options;

        const center = [lat, lng] as geofire.Geopoint;
        const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
        const queries = bounds.map((bound) => this.collection.orderBy('geohash').startAt(bound[0]).endAt(bound[1]).get());

        const snapshots = await Promise.all(queries);
        const deduped = new Map<string, Record<string, unknown>>();

        for (const snap of snapshots) {
            for (const doc of snap.docs) {
                const raw = doc.data() as Record<string, unknown>;
                const location = raw.location as { latitude?: number; longitude?: number } | undefined;
                const jobLat = Number(location?.latitude ?? 0);
                const jobLng = Number(location?.longitude ?? 0);

                if (!jobLat || !jobLng) continue;

                const distanceInM = geofire.distanceBetween([jobLat, jobLng], center) * 1000;
                if (distanceInM > radiusInMeters) continue;

                const status = normalizeStatus(raw.status);
                if (status !== 'OPEN') continue;
                const moderationStatus = String(raw.moderation_status ?? 'APPROVED').toUpperCase();
                if (moderationStatus !== 'APPROVED' && moderationStatus !== '') continue;

                const salary = Number(raw.salary ?? 0);
                if (salaryMin !== undefined && salary < salaryMin) continue;
                if (salaryMax !== undefined && salary > salaryMax) continue;

                if (!matchCategory(raw, categoryIds)) continue;
                if (!matchShift(shiftTime, raw.shifts)) continue;
                if (!includesKeyword(raw, keyword)) continue;

                deduped.set(doc.id, {
                    ...raw,
                    id: doc.id,
                    status,
                    distance: Math.round(distanceInM),
                });
            }
        }

        const sorted = Array.from(deduped.values()).sort((a, b) => {
            const boostDiff = Number(Boolean(b.is_boosted ?? false)) - Number(Boolean(a.is_boosted ?? false));
            if (boostDiff !== 0) return boostDiff;
            const distanceDiff = Number(a.distance ?? 0) - Number(b.distance ?? 0);
            if (distanceDiff !== 0) return distanceDiff;
            return getTimestampMillis(b.created_at) - getTimestampMillis(a.created_at);
        });

        const sliced = sorted.slice(offset, offset + limit);
        const nextOffset = offset + limit < sorted.length ? offset + limit : undefined;

        return {
            items: sliced,
            nextOffset,
        };
    }
}

export const jobService = new JobService();
