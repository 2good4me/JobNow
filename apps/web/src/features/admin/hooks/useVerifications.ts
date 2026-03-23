import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchPendingVerifications,
    reviewVerificationRequest,
    type AdminVerificationItem,
} from '../services/verificationService';

const VERIFICATION_QUERY_KEY = ['admin', 'verifications', 'pending'];

export function useVerifications() {
    return useQuery<AdminVerificationItem[]>({
        queryKey: VERIFICATION_QUERY_KEY,
        queryFn: fetchPendingVerifications,
        staleTime: 30_000,
    });
}

export function useReviewVerificationRequest() {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        Error,
        { userId: string; requestId: string; action: 'APPROVE' | 'REJECT'; rejectionReason?: string }
    >({
        mutationFn: ({ userId, requestId, action, rejectionReason }) =>
            reviewVerificationRequest(userId, requestId, action, rejectionReason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VERIFICATION_QUERY_KEY });
        },
    });
}
