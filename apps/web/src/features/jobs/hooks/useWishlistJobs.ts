import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addWishlistJob, listWishlistJobs, removeWishlistJob } from '../services/wishlistService';
import type { JobWishlistItem } from '@jobnow/types';

export function useWishlistJobs(uid: string | undefined) {
    return useQuery<JobWishlistItem[]>({
        queryKey: ['wishlist', uid],
        queryFn: async () => {
            if (!uid) return [];
            const page = await listWishlistJobs(uid);
            return page.items;
        },
        enabled: !!uid,
        staleTime: 60_000,
    });
}

export function useToggleWishlist(uid: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { jobId: string; wished: boolean }>({
        mutationFn: async ({ jobId, wished }) => {
            if (!uid) throw new Error('Candidate chưa đăng nhập');
            if (wished) {
                await removeWishlistJob(uid, jobId);
                return;
            }
            await addWishlistJob(uid, jobId);
        },
        onSuccess: () => {
            if (!uid) return;
            queryClient.invalidateQueries({ queryKey: ['wishlist', uid] });
        },
    });
}
