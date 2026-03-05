import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getCandidateProfile,
    getProfileCompleteness,
    submitEkyc,
    updateCandidatePublicProfile,
    uploadEkycAssets,
    type CandidatePublicProfile,
} from '../services/candidateProfileService';

export function useCandidateProfileForm(uid: string | undefined) {
    const queryClient = useQueryClient();

    const profileQuery = useQuery<CandidatePublicProfile | null>({
        queryKey: ['candidateProfileForm', uid],
        queryFn: async () => {
            if (!uid) return null;
            return getCandidateProfile(uid);
        },
        enabled: !!uid,
    });

    const completenessQuery = useQuery({
        queryKey: ['candidateProfileCompleteness', uid],
        queryFn: async () => {
            if (!uid) return { score: 0, missing: ['profile'] };
            return getProfileCompleteness(uid);
        },
        enabled: !!uid,
    });

    const saveMutation = useMutation({
        mutationFn: async (payload: Parameters<typeof updateCandidatePublicProfile>[1]) => {
            if (!uid) throw new Error('Candidate chưa đăng nhập');
            await updateCandidatePublicProfile(uid, payload);
        },
        onSuccess: () => {
            if (!uid) return;
            queryClient.invalidateQueries({ queryKey: ['candidateProfileForm', uid] });
            queryClient.invalidateQueries({ queryKey: ['candidateProfileCompleteness', uid] });
        },
    });

    return {
        profileQuery,
        completenessQuery,
        saveMutation,
    };
}

export function useEkycUpload(uid: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (files: File[]) => {
            if (!uid) throw new Error('Candidate chưa đăng nhập');
            const identityImages = await uploadEkycAssets(uid, files);
            await submitEkyc(uid, { identityImages });
            return identityImages;
        },
        onSuccess: () => {
            if (!uid) return;
            queryClient.invalidateQueries({ queryKey: ['candidateProfileForm', uid] });
            queryClient.invalidateQueries({ queryKey: ['candidateProfileCompleteness', uid] });
        },
    });
}
