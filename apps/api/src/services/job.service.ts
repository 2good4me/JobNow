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
    category_id?: string;
    title: string;
    description: string;
    salary: number;
    salary_type: 'HOURLY' | 'DAILY' | 'JOB';
    location: { latitude: number; longitude: number };
    is_gps_required: boolean;
    status: 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
    shifts: ShiftData[];
    geohash?: string;
    created_at?: admin.firestore.FieldValue;
    updated_at?: admin.firestore.FieldValue;
}

export class JobService {
    private collection = db.collection('jobs');

    async createJob(data: JobData) {
        // Generate geohash
        const geohash = geofire.geohashForLocation([data.location.latitude, data.location.longitude]);

        const newJobRef = this.collection.doc();

        // Convert shifts to include generated IDs if they don't have one
        const shiftsWithIds = data.shifts.map(shift => ({
            ...shift,
            id: shift.id || db.collection('dummy').doc().id // Generate a unique ID for the shift
        }));

        const jobPayload = {
            ...data,
            shifts: shiftsWithIds,
            geohash,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        await newJobRef.set(jobPayload);
        return { id: newJobRef.id, ...jobPayload };
    }

    async getNearbyJobs(lat: number, lng: number, radiusInMeters: number) {
        const center = [lat, lng] as geofire.Geopoint;
        // Each item in 'bounds' represents a startAt/endAt pair. We have to execute
        // a separate query for each pair.
        const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
        const promises = [];

        for (const b of bounds) {
            const q = this.collection
                .where('status', '==', 'OPEN')
                .orderBy('geohash')
                .startAt(b[0])
                .endAt(b[1]);

            promises.push(q.get());
        }

        const snapshots = await Promise.all(promises);
        const matchingDocs: any[] = [];

        for (const snap of snapshots) {
            for (const doc of snap.docs) {
                const job = doc.data() as JobData;
                const location = job.location;
                const jobLat = location.latitude;
                const jobLng = location.longitude;

                // We have to filter out a few false positives due to GeoHash accuracy
                const distanceInKm = geofire.distanceBetween([jobLat, jobLng], center);
                const distanceInM = distanceInKm * 1000;

                if (distanceInM <= radiusInMeters) {
                    matchingDocs.push({
                        id: doc.id,
                        distance: distanceInM,
                        ...job
                    });
                }
            }
        }

        // Sort by distance ascending
        matchingDocs.sort((a, b) => a.distance - b.distance);
        return matchingDocs;
    }
}

export const jobService = new JobService();
