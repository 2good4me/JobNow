import {
    collection, query, where, getCountFromServer, getDocs,
    orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

/* ── Types ─────────────────────────────────────────── */

export interface DashboardStats {
    totalUsers: number;
    totalJobs: number;
    todayApplications: number;
    pendingReports: number;
}

export interface RecentActivity {
    id: string;
    type: 'NEW_USER' | 'NEW_JOB' | 'NEW_APPLICATION' | 'NEW_REPORT';
    title: string;
    description: string;
    timestamp: Date;
}

export interface WeeklyChartData {
    label: string;
    count: number;
}

/* ── Dashboard Stats ──────────────────────────────── */

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const usersRef = collection(db, 'users');
    const jobsRef = collection(db, 'jobs');
    const appsRef = collection(db, 'applications');
    const reportsRef = collection(db, 'reports');

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTs = Timestamp.fromDate(startOfDay);

    const [usersSnap, jobsSnap, todayAppsSnap, reportsSnap] = await Promise.all([
        getCountFromServer(query(usersRef, where('status', '==', 'ACTIVE'))),
        getCountFromServer(query(jobsRef, where('status', 'in', ['OPEN', 'ACTIVE']))),
        getCountFromServer(query(appsRef, where('created_at', '>=', startTs))),
        getCountFromServer(query(reportsRef, where('status', '==', 'PENDING'))),
    ]);

    return {
        totalUsers: usersSnap.data().count,
        totalJobs: jobsSnap.data().count,
        todayApplications: todayAppsSnap.data().count,
        pendingReports: reportsSnap.data().count,
    };
}

/* ── Weekly Applications Chart ────────────────────── */

export async function fetchWeeklyApplications(): Promise<WeeklyChartData[]> {
    const now = new Date();
    const days: WeeklyChartData[] = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const startTs = Timestamp.fromDate(dayStart);
        const endTs = Timestamp.fromDate(dayEnd);

        const appsRef = collection(db, 'applications');
        const q = query(appsRef, where('created_at', '>=', startTs), where('created_at', '<', endTs));
        const snap = await getCountFromServer(q);

        days.push({
            label: dayNames[dayStart.getDay()],
            count: snap.data().count,
        });
    }
    return days;
}

/* ── Recent Activity ──────────────────────────────── */

export async function fetchRecentActivity(count = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Recent users
    const usersQ = query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(3));
    const usersSnap = await getDocs(usersQ);
    usersSnap.docs.forEach((d) => {
        const data = d.data();
        activities.push({
            id: `user-${d.id}`,
            type: 'NEW_USER',
            title: 'Đăng ký mới',
            description: data.full_name ?? data.fullName ?? 'Người dùng',
            timestamp: data.created_at?.toDate?.() ?? new Date(),
        });
    });

    // Recent jobs
    const jobsQ = query(collection(db, 'jobs'), orderBy('created_at', 'desc'), limit(3));
    const jobsSnap = await getDocs(jobsQ);
    jobsSnap.docs.forEach((d) => {
        const data = d.data();
        activities.push({
            id: `job-${d.id}`,
            type: 'NEW_JOB',
            title: 'Tin tuyển dụng mới',
            description: data.title ?? 'Công việc',
            timestamp: data.created_at?.toDate?.() ?? new Date(),
        });
    });

    // Recent applications
    const appsQ = query(collection(db, 'applications'), orderBy('created_at', 'desc'), limit(4));
    const appsSnap = await getDocs(appsQ);
    appsSnap.docs.forEach((d) => {
        const data = d.data();
        activities.push({
            id: `app-${d.id}`,
            type: 'NEW_APPLICATION',
            title: 'Ứng tuyển',
            description: data.candidate_name ?? 'Ứng viên',
            timestamp: data.created_at?.toDate?.() ?? new Date(),
        });
    });

    // Sort by timestamp desc, take top N
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, count);
}
