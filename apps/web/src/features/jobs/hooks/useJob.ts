import { useQuery } from '@tanstack/react-query';
import { fetchJobById } from '../services/jobService';

export function useJob(jobId: string) {
    return useQuery({
        queryKey: ['job', jobId],
        queryFn: () => fetchJobById(jobId),
        enabled: !!jobId,
        staleTime: 60_000,
    });
}
