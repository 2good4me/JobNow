import { useQuery } from '@tanstack/react-query';
import { getCandidateProfile, type CandidatePublicProfile } from '../services/candidateProfileService';

/**
 * Fetch a single candidate's profile by UID.
 * Uses staleTime of 5 minutes since candidate profiles don't change often.
 */
export function useCandidateProfile(candidateId: string | undefined) {
    return useQuery<CandidatePublicProfile | null>({
        queryKey: ['candidate-profile', candidateId],
        queryFn: () => getCandidateProfile(candidateId!),
        enabled: !!candidateId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
