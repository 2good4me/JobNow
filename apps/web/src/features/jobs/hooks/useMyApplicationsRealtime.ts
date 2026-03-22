import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Application, ApplicationStatus } from '@jobnow/types';
import { subscribeMyApplications } from '../services/applicationFlowService';

interface UseMyApplicationsRealtimeInput {
    candidateId: string | undefined;
    statuses?: ApplicationStatus[];
    limit?: number;
}

export function useMyApplicationsRealtime({ candidateId, statuses, limit = 20 }: UseMyApplicationsRealtimeInput) {
    const [data, setData] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!candidateId) {
            setIsLoading(false);
            return undefined;
        }

        setIsLoading(true);
        const unsubscribe = subscribeMyApplications(
            { candidateId, statuses, limit },
            (applications) => {
                setData(applications);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [candidateId, statuses, limit]);

    return { data, isLoading };
}
