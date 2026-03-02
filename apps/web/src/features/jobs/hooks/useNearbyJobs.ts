import { useQuery } from '@tanstack/react-query';
import { fetchNearbyJobs, NearbyJobResponse } from '@/lib/api';

interface UseNearbyJobsOptions {
    lat: number;
    lng: number;
    radius?: number;
    enabled?: boolean;
}

/**
 * TanStack Query hook to fetch nearby jobs from the backend API.
 * Auto-refetches when lat/lng/radius changes.
 */
export function useNearbyJobs({ lat, lng, radius = 5000, enabled = true }: UseNearbyJobsOptions) {
    return useQuery<NearbyJobResponse[]>({
        queryKey: ['nearbyJobs', lat, lng, radius],
        queryFn: () => fetchNearbyJobs({ lat, lng, radius }),
        enabled: enabled && lat !== 0 && lng !== 0,
        staleTime: 30_000, // 30 seconds
        refetchOnWindowFocus: false,
    });
}
