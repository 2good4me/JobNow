import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Application } from '@jobnow/types';
import { 
  fetchJobApplications, 
  updateApplicationStatus, 
  fetchEmployerApplications, 
  completeApplicationWithPayment, 
  confirmPaymentReceived, 
  subscribeJobApplications, 
  subscribeEmployerApplications 
} from '../services/applicationService';
import { forceCheckOut, simulateWorkTime } from '../services/attendanceService';
import { toast } from 'sonner';

const APPLICATION_KEYS = {
  ALL: ['applications'],
  JOB: (jobId: string) => ['applications', 'job', jobId],
  CANDIDATE: (candId: string) => ['applications', 'candidate', candId],
  EMPLOYER: (empId: string) => ['applications', 'employer', empId],
  ID: (id: string) => ['applications', 'id', id],
};

/**
 * Hook to fetch all applications for a specific job.
 */
export function useGetApplicants(jobId: string, employerId: string | undefined) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<Application[], Error>({
        queryKey: APPLICATION_KEYS.JOB(jobId),
        queryFn: async () => {
            if (!jobId) throw new Error('Job ID is required');
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchJobApplications(jobId, employerId);
        },
        enabled: !!jobId && !!employerId,
        staleTime: 60 * 1000, 
    });

    useEffect(() => {
        if (!jobId || !employerId) return;

        const unsubscribe = subscribeJobApplications(jobId, employerId, (data) => {
            queryClient.setQueryData(APPLICATION_KEYS.JOB(jobId), data);
        });

        return () => unsubscribe();
    }, [jobId, employerId, queryClient]);

    return queryResult;
}

/**
 * Hook to update an application's status.
 */
export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation<Application, Error, { id: string; status: Application['status'] }>({
        mutationFn: async ({ id, status }) => {
            return await updateApplicationStatus(id, status);
        },
        onSuccess: (updatedApp) => {
            queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.ALL });
        },
    });
}

/**
 * Hook to fetch all applications for a specific employer across all jobs.
 */
export function useGetEmployerApplications(employerId: string | undefined) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<Application[], Error>({
        queryKey: APPLICATION_KEYS.EMPLOYER(employerId || ''),
        queryFn: async () => {
            if (!employerId) throw new Error('Employer ID is required');
            return await fetchEmployerApplications(employerId);
        },
        enabled: !!employerId,
        staleTime: 1 * 60 * 1000,
    });

    useEffect(() => {
        if (!employerId) return;

        const unsubscribe = subscribeEmployerApplications(employerId, (data) => {
            queryClient.setQueryData(APPLICATION_KEYS.EMPLOYER(employerId), data);
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

    return useMutation<Application, Error, { id: string; paymentMethod: 'APP' | 'CASH'; employerId: string }>({
        mutationFn: async ({ id, paymentMethod, employerId }) => {
            return await completeApplicationWithPayment(id, paymentMethod, employerId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.ALL });
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
            queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.ALL });
        },
    });
}

/**
 * Hook for employer to force check-out a candidate.
 */
export function useForceCheckOut() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { applicationId: string; employerId: string }>({
    mutationFn: ({ applicationId, employerId }) =>
      forceCheckOut(applicationId, employerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.ALL });
      toast.success('Đã kết thúc ca làm của ứng viên.');
    },
    onError: (error: any) => {
      toast.error(`Không thể kết thúc ca: ${error.message}`);
    },
  });
}

/**
 * Hook to simulate work time (testing only)
 */
export function useSimulateWorkTime() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { applicationId: string; hoursAgo: number }>({
    mutationFn: ({ applicationId, hoursAgo }) =>
      simulateWorkTime(applicationId, hoursAgo),
    onSuccess: () => {
      queryClient.setQueryData(['applications'], (old: any) => {
          // This is a broad invalidation, but helps for immediate feedback
          return old; 
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Đã giả lập lùi thời gian check-in thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể giả lập thời gian.');
    },
  });
}
