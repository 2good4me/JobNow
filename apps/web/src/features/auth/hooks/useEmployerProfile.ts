import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
    updateEmployerProfile,
    uploadCompanyLogo,
    uploadBusinessLicense,
    type EmployerProfileUpdate,
} from '@/features/auth/services/employerProfileService';

/**
 * Mutation to update employer profile fields.
 * Automatically refreshes the AuthContext profile on success.
 */
export function useUpdateEmployerProfile() {
    const { userProfile, refreshProfile } = useAuth();

    return useMutation<void, Error, Partial<EmployerProfileUpdate>>({
        mutationFn: async (data) => {
            if (!userProfile?.uid) throw new Error('Not authenticated');
            return updateEmployerProfile(userProfile.uid, data);
        },
        onSuccess: () => {
            refreshProfile();
        },
    });
}

/**
 * Mutation to upload a company logo.
 * Returns the download URL after upload.
 */
export function useUploadCompanyLogo() {
    const { userProfile, refreshProfile } = useAuth();

    return useMutation<string, Error, File>({
        mutationFn: async (file) => {
            if (!userProfile?.uid) throw new Error('Not authenticated');
            return uploadCompanyLogo(userProfile.uid, file);
        },
        onSuccess: () => {
            refreshProfile();
        },
    });
}

/**
 * Mutation to submit business license for E-KYC verification.
 * Sets verification_status to PENDING.
 */
export function useSubmitVerification() {
    const { userProfile, refreshProfile } = useAuth();

    return useMutation<string, Error, File>({
        mutationFn: async (file) => {
            if (!userProfile?.uid) throw new Error('Not authenticated');
            return uploadBusinessLicense(userProfile.uid, file);
        },
        onSuccess: () => {
            refreshProfile();
        },
    });
}
