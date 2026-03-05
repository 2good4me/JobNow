import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Application } from '@jobnow/types';
import { fetchJobApplications, updateApplicationStatus, fetchEmployerApplications } from '../services/applicationService';

/**
 * Hook to fetch all applications for a specific job.
 */
export function useGetApplicants(jobId: string) {
    return useQuery<Application[], Error>({
        queryKey: ['applications', 'job', jobId],
        queryFn: async () => {
            if (!jobId) throw new Error('Job ID is required');
            return await fetchJobApplications(jobId);
        },
        enabled: !!jobId,
    });
}

/**
 * Hook to update an application's status.
 * Automatically invalidates job applicants list on success.
 */
export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation<Application, Error, { id: string; status: Application['status'] }>({
        mutationFn: async ({ id, status }) => {
            return await updateApplicationStatus(id, status);
        },
        onSuccess: (updatedApp) => {
            // Invalidate the applications list for this job
            if (updatedApp.jobId) {
                queryClient.invalidateQueries({
                    queryKey: ['applications', 'job', updatedApp.jobId],
                });
            }
            // Also invalidate candidate's personal application list if it exists
            if (updatedApp.candidateId) {
                queryClient.invalidateQueries({
                    queryKey: ['applications', 'candidate', updatedApp.candidateId],
                });
            }
            // And a single application query
            queryClient.invalidateQueries({
                queryKey: ['applications', 'id', updatedApp.id],
            });
            // Also invalidate employer's comprehensive application list
            queryClient.invalidateQueries({
                queryKey: ['applications', 'employer'],
            });
        },
    });
}

/**
 * Hook to fetch all applications for a specific employer across all jobs.
 */
export function useGetEmployerApplications(employerId: string | undefined) {
    return useQuery<Application[], Error>({
        queryKey: ['applications', 'employer', employerId],
        queryFn: async () => {
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchEmployerApplications(employerId);
        },
        enabled: !!employerId,
        staleTime: 1 * 60 * 1000, // 1 min — apps change more often
    });
}
