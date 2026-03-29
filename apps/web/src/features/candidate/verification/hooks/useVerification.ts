import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { submitCandidateVerification, type CandidateVerificationOcrData } from '../services/verificationService';
import { toast } from 'sonner';

export const useSubmitCandidateVerification = () => {
    const queryClient = useQueryClient();
    const { userProfile, refreshProfile } = useAuth();

    return useMutation({
        mutationFn: async ({ frontFile, portraitFile, confirmedOcr }: { 
            frontFile: File, 
            portraitFile?: File | null, 
            confirmedOcr?: CandidateVerificationOcrData 
        }) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');
            const candidateId = userProfile.uid;

            return submitCandidateVerification(candidateId, frontFile, portraitFile, confirmedOcr);
        },
        onSuccess: async () => {
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error: any) => {
            console.error('Lỗi khi gửi yêu cầu xác thực:', error);
            toast.error(error?.message || 'Không thể tải lên tài liệu. Vui lòng thử lại.');
        }
    });
};
