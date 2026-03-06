import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '@jobnow/types';
import { fetchEmployerJobs, fetchJobById, createJob, updateJob, deleteJob } from '../services/jobService';

/**
 * Hook to fetch all jobs created by a specific employer.
 */
export function useGetEmployerJobs(employerId: string | undefined) {
    return useQuery<Job[], Error>({
        queryKey: ['jobs', 'employer', employerId],
        queryFn: async () => {
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchEmployerJobs(employerId);
        },
        enabled: !!employerId,
        staleTime: 2 * 60 * 1000, // 2 min — avoid re-fetch on revisit
    });
}

/**
 * Hook to fetch a single job by its ID.
 */
export function useJobDetail(jobId: string | undefined) {
    return useQuery<Job | null, Error>({
        queryKey: ['jobs', 'detail', jobId],
        queryFn: async () => {
            if (!jobId) return null;
            return await fetchJobById(jobId);
        },
        enabled: !!jobId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook to create a new job.
 * Automatically invalidates employer jobs list on success.
 */
export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation<Job, Error, Partial<Job>>({
        mutationFn: async (jobData) => {
            return await createJob(jobData);
        },
        onSuccess: (newJob) => {
            queryClient.invalidateQueries({
                queryKey: ['jobs', 'employer', newJob.employerId],
            });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

/**
 * Hook to update an existing job.
 */
export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { jobId: string; data: Partial<Job> }>({
        mutationFn: async ({ jobId, data }) => {
            return await updateJob(jobId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

/**
 * Hook to delete a job.
 */
export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (jobId) => {
            return await deleteJob(jobId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}
