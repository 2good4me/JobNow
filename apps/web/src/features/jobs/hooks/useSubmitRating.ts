import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RatingInput, RatingResult } from '@jobnow/types';
import { submitRating } from '../services/ratingService';

export function useSubmitRating() {
    const queryClient = useQueryClient();

    return useMutation<RatingResult, Error, RatingInput>({
        mutationFn: (payload) => submitRating(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}
