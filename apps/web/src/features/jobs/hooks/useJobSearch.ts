import { useInfiniteQuery } from '@tanstack/react-query';
import type { JobSearchFilters } from '@jobnow/types';
import { searchJobs } from '../services/jobSearchService';

interface UseJobSearchInput {
    lat: number;
    lng: number;
    filters: JobSearchFilters;
    enabled?: boolean;
}

export function useJobSearch({ lat, lng, filters, enabled = true }: UseJobSearchInput) {
    return useInfiniteQuery({
        queryKey: ['jobs', 'search', lat, lng, filters],
        queryFn: ({ pageParam }) => searchJobs({
            lat,
            lng,
            filters,
            cursor: pageParam as string | undefined,
        }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: enabled && lat !== 0 && lng !== 0,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * (2 ** attempt), 10_000),
    });
}
