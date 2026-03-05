import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getWalletBalance,
    fetchTransactions,
    requestPayment,
    type TransactionRecord,
} from '../services/walletService';

/**
 * Hook to fetch wallet balance.
 */
export function useWalletBalance(userId: string | undefined) {
    return useQuery<number>({
        queryKey: ['wallet', 'balance', userId],
        queryFn: () => getWalletBalance(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to fetch transaction history.
 */
export function useTransactionHistory(userId: string | undefined) {
    return useQuery<TransactionRecord[]>({
        queryKey: ['wallet', 'transactions', userId],
        queryFn: () => fetchTransactions(userId!),
        enabled: !!userId,
    });
}

/**
 * Hook to request a payment to a candidate.
 * NOTE: This is a placeholder — actual implementation requires Cloud Functions.
 */
export function useRequestPayment() {
    return useMutation<void, Error, {
        employerId: string;
        candidateId: string;
        amount: number;
        jobId: string;
        applicationId: string;
    }>({
        mutationFn: ({ employerId, candidateId, amount, jobId, applicationId }) =>
            requestPayment(employerId, candidateId, amount, jobId, applicationId),
    });
}
