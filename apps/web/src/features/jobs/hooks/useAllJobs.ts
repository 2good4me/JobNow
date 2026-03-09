import { useQuery } from '@tanstack/react-query';
import { fetchAllJobs } from '../services/jobSearchService';

export function useAllJobs(enabled = true) {
    return useQuery({
        queryKey: ['jobs', 'all'],
        queryFn: fetchAllJobs,
        enabled,
        staleTime: 60_000,
    });
}
