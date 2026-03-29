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

            // If confirmedOcr is not provided, try to get it from API (Step 1)
            let finalOcr = confirmedOcr;
            if (!finalOcr) {
                try {
                    const formData = new FormData();
                    formData.append('file', frontFile);
                    const response = await fetch('http://localhost:8000/api/verify-cccd', {
                        method: 'POST',
                        body: formData,
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result?.success && result?.data) {
                            finalOcr = {
                                cccd_number: result.data.cccd_number || null,
                                full_name: result.data.full_name || null,
                                dob: result.data.dob || null,
                            };
                        }
                    }
                } catch (error) {
                    console.warn('OCR service unavailable', error);
                }
            }

            return submitCandidateVerification(candidateId, frontFile, portraitFile, finalOcr);
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
