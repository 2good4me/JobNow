import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplyJobInput, ApplyJobResult } from '@jobnow/types';
import { applyJob, precheckApply } from '../services/applicationFlowService';

export function createIdempotencyKey(candidateId: string, jobId: string, shiftId: string): string {
    return `${candidateId}_${jobId}_${shiftId}`;
}

export function useApplyJob() {
    const queryClient = useQueryClient();

    return useMutation<ApplyJobResult, Error, Omit<ApplyJobInput, 'idempotencyKey'>>({
        mutationFn: async (payload) => {
            const idempotencyKey = createIdempotencyKey(payload.candidateId, payload.jobId, payload.shiftId);
            const precheck = await precheckApply({ ...payload, idempotencyKey });
            if (!precheck.canApply) {
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
