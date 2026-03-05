import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createCheckin,
    fetchCheckins,
    fetchCheckinsForJob,
    verifyCheckin,
    checkOut,
    type CheckInRecord,
} from '../services/checkinService';

/**
 * Hook to fetch check-ins for a specific application.
 */
export function useGetCheckins(applicationId: string | undefined) {
    return useQuery<CheckInRecord[]>({
        queryKey: ['checkins', applicationId],
        queryFn: () => fetchCheckins(applicationId!),
        enabled: !!applicationId,
    });
}

/**
 * Hook to fetch all check-ins for a specific job.
 */
export function useGetJobCheckins(jobId: string | undefined) {
    return useQuery<CheckInRecord[]>({
        queryKey: ['checkins', 'job', jobId],
        queryFn: () => fetchCheckinsForJob(jobId!),
        enabled: !!jobId,
    });
}

/**
 * Hook to create a check-in record.
 */
export function useCreateCheckin() {
    const queryClient = useQueryClient();

    return useMutation<string, Error, Parameters<typeof createCheckin>>({
        mutationFn: ([applicationId, data]) => createCheckin(applicationId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });
}

/**
 * Hook for employer to verify a check-in.
 */
export function useVerifyCheckin() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { applicationId: string; checkinId: string; employerId: string }>({
        mutationFn: ({ applicationId, checkinId, employerId }) =>
            verifyCheckin(applicationId, checkinId, employerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });
}

/**
 * Hook to record check-out.
 */
export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { applicationId: string; checkinId: string }>({
        mutationFn: ({ applicationId, checkinId }) => checkOut(applicationId, checkinId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });
}
