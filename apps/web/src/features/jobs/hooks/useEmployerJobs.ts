import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { BoostPackage, Job, JobPostingQuota } from '@jobnow/types';
import {
    fetchEmployerJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    fetchMyJobPostingQuota,
    purchaseBoostPackage,
    closeJobSafely,
} from '../services/jobService';

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
 * Hook to listen for realtime updates to a single job.
 */
export function useRealtimeJob(jobId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!jobId) return;

        const unsubscribe = onSnapshot(doc(db, 'jobs', jobId), () => {
            queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', jobId] });
        });

        return () => unsubscribe();
    }, [jobId, queryClient]);
}

/**
 * Hook to listen for realtime updates to employer jobs list.
 */
export function useRealtimeEmployerJobs(employerId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!employerId) return;

        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('employerId', '==', employerId));
        
        const unsubscribe = onSnapshot(q, () => {
            queryClient.invalidateQueries({ queryKey: ['jobs', 'employer', employerId] });
        });

        const qFallback = query(jobsRef, where('employer_id', '==', employerId));
        const unsubscribeFallback = onSnapshot(qFallback, () => {
            queryClient.invalidateQueries({ queryKey: ['jobs', 'employer', employerId] });
        });

        return () => {
            unsubscribe();
            unsubscribeFallback();
        };
    }, [employerId, queryClient]);
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

/**
 * Hook to fetch all categories from firestore.
 */
import { fetchCategories } from '../services/jobService';

export function useGetCategories() {
    return useQuery<string[], Error>({
        queryKey: ['categories'],
        queryFn: async () => {
            return await fetchCategories();
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useJobPostingQuota(enabled = true) {
    return useQuery<JobPostingQuota, Error>({
        queryKey: ['jobs', 'quota'],
        queryFn: fetchMyJobPostingQuota,
        enabled,
        staleTime: 30_000,
    });
}

export function usePurchaseBoostPackage() {
    const queryClient = useQueryClient();

    return useMutation<{ expiresAt: string; price: number }, Error, { jobId: string; packageCode: BoostPackage['code'] }>({
        mutationFn: ({ jobId, packageCode }) => purchaseBoostPackage(jobId, packageCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
        },
    });
}

export function useCloseJobSafely() {
    const queryClient = useQueryClient();

    return useMutation<
        { requiresConfirmation: boolean; affectedCandidates: number; latePenaltyPossible: boolean; success?: boolean },
        Error,
        { jobId: string; confirmed?: boolean; notifyCandidates?: boolean }
    >({
        mutationFn: ({ jobId, confirmed, notifyCandidates }) => closeJobSafely(jobId, confirmed, notifyCandidates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
}
