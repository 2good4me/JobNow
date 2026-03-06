import { useMemo } from 'react';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';

export interface DashboardMetrics {
    activeJobs: number;
    totalJobs: number;
    pendingApps: number;
    totalApps: number;
    recentAppsCount: number;
    shiftsToday: number;
    conversionRate: number;
    applicantsPerJob: Record<string, number>;
    activeJobsList: any[];
    recentApplications: any[];
}

export function useDashboardMetrics(employerId: string | undefined) {
    const {
        data: jobs = [],
        isLoading: isJobsLoading,
        isError: isJobsError,
        error: jobsError,
        refetch: refetchJobs
    } = useGetEmployerJobs(employerId);

    const {
        data: applications = [],
        isLoading: isAppsLoading,
        isError: isAppsError,
        error: appsError,
        refetch: refetchApps
    } = useGetEmployerApplications(employerId);

    const metrics = useMemo<DashboardMetrics>(() => {
        if (!jobs || !applications) {
            return {
                activeJobs: 0,
                totalJobs: 0,
                pendingApps: 0,
                totalApps: 0,
                recentAppsCount: 0,
                shiftsToday: 0,
                conversionRate: 0,
                applicantsPerJob: {},
                activeJobsList: [],
                recentApplications: []
            };
        }

        const activeJobsList = jobs.filter(j => j.status === 'ACTIVE' || j.status === 'OPEN');
        const activeJobs = activeJobsList.length;
        const totalJobs = jobs.length;

        const pendingApps = applications.filter(a => a.status === 'NEW' || a.status === 'PENDING').length;
        const totalApps = applications.length;

        // Recent applications (last 24h)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        // Process safely the created_at property which could be a timestamp or an ISO string
        const recentApplications = applications
            .filter(a => {
                const createdAt = a.createdAt || a.appliedAt;
                if (!createdAt) return false;

                let date: Date;
                if (typeof createdAt === 'object' && 'toDate' in createdAt) {
                    date = createdAt.toDate();
                } else {
                    date = new Date(createdAt);
                }

                return date > oneDayAgo;
            })
            .sort((a, b) => {
                const dateA = typeof a.createdAt === 'object' && a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || a.appliedAt || 0);
                const dateB = typeof b.createdAt === 'object' && b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || b.appliedAt || 0);
                return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5); // Capture the 5 most recent apps

        const recentAppsCount = recentApplications.length;

        // Build the mapping array
        const applicantsPerJob: Record<string, number> = {};
        applications.forEach(app => {
            if (app.jobId) { // Safeguard
                applicantsPerJob[app.jobId] = (applicantsPerJob[app.jobId] || 0) + 1;
            }
        });

        // Determine how many shifts are scheduled for today, roughly
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayStr = today.toISOString().split('T')[0]; // Define todayStr for comparison

        let shiftsToday = 0;
        activeJobsList.forEach(job => {
            if (job.shifts && job.shifts.length > 0) {
                job.shifts.forEach((shift: any) => { // Changed parameter name to 'shift' for clarity, as it's used
                    const shiftDateStr = shift.startTime?.split('T')[0];
                    if (shiftDateStr === todayStr) {
                        shiftsToday++;
                    }
                });
            }
        });

        const conversionRate = totalJobs > 0 ? (totalApps / (totalJobs * 5)) * 100 : 0; // Simulated CR mapping

        return {
            activeJobs,
            totalJobs,
            pendingApps,
            totalApps,
            recentAppsCount,
            shiftsToday,
            conversionRate: Math.min(conversionRate, 100),
            applicantsPerJob,
            activeJobsList,
            recentApplications
        };
    }, [jobs, applications]);

    const hasEmployerId = Boolean(employerId);
    const error = jobsError ?? appsError ?? null;
    const errorMessage = error instanceof Error
        ? error.message
        : 'Không thể tải dữ liệu tổng quan. Vui lòng thử lại.';

    return {
        metrics,
        isLoading: hasEmployerId && (isJobsLoading || isAppsLoading),
        isError: hasEmployerId && (isJobsError || isAppsError),
        error,
        errorMessage,
        refetch: () => {
            refetchJobs();
            refetchApps();
        }
    };
}
