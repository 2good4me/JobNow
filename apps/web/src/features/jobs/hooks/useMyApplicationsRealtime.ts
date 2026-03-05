import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Application, ApplicationStatus } from '@jobnow/types';
import { listMyApplications, subscribeMyApplications } from '../services/applicationFlowService';

interface UseMyApplicationsRealtimeInput {
    candidateId: string | undefined;
    statuses?: ApplicationStatus[];
    limit?: number;
}

export function useMyApplicationsRealtime({ candidateId, statuses, limit = 20 }: UseMyApplicationsRealtimeInput) {
    const queryClient = useQueryClient();

    const queryResult = useQuery<Application[]>({
        queryKey: ['applications', 'candidate', candidateId, statuses, limit],
        queryFn: async () => {
            if (!candidateId) return [];
            const page = await listMyApplications({ candidateId, statuses, limit });
            return page.items;
        },
        enabled: !!candidateId,
    });

    useEffect(() => {
        if (!candidateId) return undefined;

        const unsubscribe = subscribeMyApplications(
            { candidateId, statuses, limit },
            (applications) => {
                queryClient.setQueryData(['applications', 'candidate', candidateId, statuses, limit], applications);
            }
        );

        return () => unsubscribe();
    }, [candidateId, statuses, limit, queryClient]);

    return queryResult;
}
