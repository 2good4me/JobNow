import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Application } from '@jobnow/types';
import { fetchJobApplications, updateApplicationStatus, fetchEmployerApplications, completeApplicationWithPayment, confirmPaymentReceived, subscribeJobApplications, subscribeEmployerApplications } from '../services/applicationService';

/**
 * Hook to fetch all applications for a specific job.
 */
export function useGetApplicants(jobId: string, employerId: string | undefined) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<Application[], Error>({
        queryKey: ['applications', 'job', jobId, employerId],
        queryFn: async () => {
            if (!jobId) throw new Error('Job ID is required');
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchJobApplications(jobId, employerId);
        },
        enabled: !!jobId && !!employerId,
        staleTime: 60 * 1000, // 1 min — apps change but instant back-navigation is needed
    });

    useEffect(() => {
        if (!jobId || !employerId) return;

        const unsubscribe = subscribeJobApplications(jobId, employerId, (data) => {
            queryClient.setQueryData(['applications', 'job', jobId, employerId], data);
        });

        return () => unsubscribe();
    }, [jobId, employerId, queryClient]);

    return queryResult;
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
    const queryClient = useQueryClient();

    const queryResult = useQuery<Application[], Error>({
        queryKey: ['applications', 'employer', employerId],
        queryFn: async () => {
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchEmployerApplications(employerId);
        },
        enabled: !!employerId,
        staleTime: 1 * 60 * 1000, // 1 min — apps change more often
    });

    useEffect(() => {
        if (!employerId) return;

        const unsubscribe = subscribeEmployerApplications(employerId, (data) => {
            queryClient.setQueryData(['applications', 'employer', employerId], data);
        });

        return () => unsubscribe();
    }, [employerId, queryClient]);

    return queryResult;
}
/**
 * Hook to complete application with payment.
 */
export function useCompleteApplication() {
    const queryClient = useQueryClient();

    return useMutation<Application, Error, { id: string; paymentMethod: 'APP' | 'CASH' }>({
        mutationFn: async ({ id, paymentMethod }) => {
            return await completeApplicationWithPayment(id, paymentMethod);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
}

/**
 * Hook for candidate to confirm receipt of cash payment.
 */
export function useConfirmPayment() {
    const queryClient = useQueryClient();

    return useMutation<Application, Error, string>({
        mutationFn: async (id: string) => {
            return await confirmPaymentReceived(id);
        },
        onSuccess: (updatedApp) => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            // And a single application query
            queryClient.invalidateQueries({
                queryKey: ['applications', 'id', updatedApp.id],
            });
        },
    });
}
