import { collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface TimeSeriesData {
    label: string;
    users: number;
    jobs: number;
    applications: number;
    rawDate: Date;
}

export async function fetchTimeSeriesData(daysToFetch = 14): Promise<TimeSeriesData[]> {
    const now = new Date();
    const result: TimeSeriesData[] = [];
    
    // Arrays for parallel promise execution
    const userPromises = [];
    const jobPromises = [];
    const appPromises = [];
    const labels = [];
    const rawDates = [];

    // Format DD/MM
    const formatDay = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

    for (let i = daysToFetch - 1; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const startTs = Timestamp.fromDate(dayStart);
        const endTs = Timestamp.fromDate(dayEnd);
        
        labels.push(formatDay(dayStart));
        rawDates.push(dayStart);

        // Queries
        userPromises.push(getCountFromServer(query(collection(db, 'users'), where('created_at', '>=', startTs), where('created_at', '<', endTs))));
        jobPromises.push(getCountFromServer(query(collection(db, 'jobs'), where('created_at', '>=', startTs), where('created_at', '<', endTs))));
        appPromises.push(getCountFromServer(query(collection(db, 'applications'), where('created_at', '>=', startTs), where('created_at', '<', endTs))));
    }

    const [userSnaps, jobSnaps, appSnaps] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(jobPromises),
        Promise.all(appPromises),
    ]);

    for (let i = 0; i < daysToFetch; i++) {
        result.push({
            label: labels[i],
            users: userSnaps[i].data().count,
            jobs: jobSnaps[i].data().count,
            applications: appSnaps[i].data().count,
            rawDate: rawDates[i]
        });
    }

    return result;
}
