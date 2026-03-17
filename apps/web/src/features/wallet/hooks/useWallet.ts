import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
    getWalletBalance,
    fetchTransactions,
    requestPayment,
    processDeposit,
    processWithdrawal,
    subscribeWalletBalance,
    subscribeTransactions,
    type TransactionRecord,
} from '../services/walletService';

/**
 * Hook to fetch wallet balance.
 */
export function useWalletBalance(userId: string | undefined) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<number>({
        queryKey: ['wallet', 'balance', userId],
        queryFn: () => getWalletBalance(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 seconds
    });

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeWalletBalance(userId, (balance) => {
            queryClient.setQueryData(['wallet', 'balance', userId], balance);
        });

        return () => unsubscribe();
    }, [userId, queryClient]);

    return queryResult;
}

/**
 * Hook to fetch transaction history.
 */
export function useTransactionHistory(userId: string | undefined) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<TransactionRecord[]>({
        queryKey: ['wallet', 'transactions', userId],
        queryFn: () => fetchTransactions(userId!),
        enabled: !!userId,
    });

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeTransactions(userId, (data) => {
            queryClient.setQueryData(['wallet', 'transactions', userId], data);
        });

        return () => unsubscribe();
    }, [userId, queryClient]);

    return queryResult;
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
