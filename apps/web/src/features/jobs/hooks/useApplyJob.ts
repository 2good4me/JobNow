import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplyJobInput, ApplyJobResult, WithdrawApplicationInput } from '@jobnow/types';
import { applyJob, precheckApply, withdrawApplication } from '../services/applicationFlowService';

export function createIdempotencyKey(candidateId: string, jobId: string, shiftId: string): string {
    return `${candidateId}_${jobId}_${shiftId}`;
}

export function useApplyJob() {
    const queryClient = useQueryClient();

    return useMutation<ApplyJobResult, Error, Omit<ApplyJobInput, 'idempotencyKey'>>({
        mutationFn: async (payload) => {
            const idempotencyKey = createIdempotencyKey(payload.candidateId, payload.jobId, payload.shiftId);
            const precheck = await precheckApply({ ...payload, idempotencyKey });
            console.log('Precheck result:', precheck);
            if (!precheck.canApply) {
                console.error('Cannot apply due to reasons:', precheck.reasons);
                throw new Error(`Không thể ứng tuyển: ${precheck.reasons.join(', ')}`);
            }
            return applyJob({ ...payload, idempotencyKey });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', 'search'] });
        },
    });
}

export function useWithdrawApplication() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, WithdrawApplicationInput>({
        mutationFn: async (payload) => withdrawApplication(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', 'search'] });
        },
    });
}
