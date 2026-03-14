import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWalletBalance,
    fetchTransactions,
    requestPayment,
    processDeposit,
    processWithdrawal,
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

/**
 * Hook to deposit money into wallet
 */
export function useDeposit() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { userId: string; amount: number; method: string }>({
        mutationFn: ({ userId, amount, method }) => processDeposit(userId, amount, method),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance', userId] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', userId] });
        },
    });
}

/**
 * Hook to withdraw money from wallet
 */
export function useWithdraw() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { userId: string; amount: number; bankAccount: string }>({
        mutationFn: ({ userId, amount, bankAccount }) => processWithdrawal(userId, amount, bankAccount),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance', userId] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions', userId] });
        },
    });
}
