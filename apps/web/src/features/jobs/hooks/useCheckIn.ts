import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CheckInInput, CheckInResult, CheckOutInput } from '@jobnow/types';
import { checkIn, checkOut } from '../services/attendanceService';

export function useCheckIn() {
    const queryClient = useQueryClient();

    return useMutation<CheckInResult, Error, CheckInInput>({
        mutationFn: (payload) => checkIn(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });
}

export function useCheckOut() {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, CheckOutInput & { latitude?: number; longitude?: number; accuracy?: number }>({
        mutationFn: (payload) => checkOut(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['checkins'] });
        },
    });
}
