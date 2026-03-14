import { useQuery } from '@tanstack/react-query';
import { getUserDocument } from '@/lib/firestore';
import type { UserProfile } from '../types/user';

/**
 * Hook to fetch any user profile by its ID from Firestore.
 */
export function useUserProfile(userId: string | undefined) {
    return useQuery<UserProfile | null>({
        queryKey: ['userProfile', userId],
        queryFn: () => getUserDocument(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
