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
    employer_name: string;
    category?: string;
    title: string;
    description: string;
    salary: number;
    salary_type: 'HOURLY' | 'DAILY' | 'JOB';
    address: string;
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
        try {
            console.log(`Searching nearby jobs: Lat=${lat}, Lng=${lng}, Radius=${radiusInMeters}m`);
            const center = [lat, lng] as geofire.Geopoint;
            const bounds = geofire.geohashQueryBounds(center, radiusInMeters);
            const promises = [];

            for (const b of bounds) {
                const q = this.collection
                    .orderBy('geohash')
                    .startAt(b[0])
                    .endAt(b[1]);
                promises.push(q.get());
            }

            const snapshots = await Promise.all(promises);
            const matchingDocs: any[] = [];

            for (const snap of snapshots) {
                for (const doc of snap.docs) {
                    const data = doc.data();

                    // Safter data access
                    if (!data || !data.location || typeof data.location.latitude !== 'number' || typeof data.location.longitude !== 'number') {
                        console.warn(`Skipping invalid job document: ${doc.id}`);
                        continue;
                    }

                    const jobLat = data.location.latitude;
                    const jobLng = data.location.longitude;

                    const distanceInKm = geofire.distanceBetween([jobLat, jobLng], center);
                    const distanceInM = distanceInKm * 1000;

                    if (distanceInM <= radiusInMeters && data.status === 'OPEN') {
                        // Format dates for JSON serialization
                        const formattedJob = { ...data };
                        if (formattedJob.created_at && typeof (formattedJob.created_at as any).toDate === 'function') {
                            formattedJob.created_at = (formattedJob.created_at as any).toDate().toISOString();
                        }
                        if (formattedJob.updated_at && typeof (formattedJob.updated_at as any).toDate === 'function') {
                            formattedJob.updated_at = (formattedJob.updated_at as any).toDate().toISOString();
                        }

                        matchingDocs.push({
                            id: doc.id,
                            distance: Math.round(distanceInM),
                            ...formattedJob
                        });
                    }
                }
            }

            matchingDocs.sort((a, b) => a.distance - b.distance);
            console.log(`Found ${matchingDocs.length} nearby jobs`);
            return matchingDocs;
        } catch (error) {
            console.error('Error in jobService.getNearbyJobs:', error);
            throw error; // Rethrow to be caught by controller
        }
    }
}

export const jobService = new JobService();
