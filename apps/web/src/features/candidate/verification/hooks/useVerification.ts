import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { submitCandidateVerification, type CandidateVerificationOcrData } from '../services/verificationService';
import { toast } from 'sonner';

export const useSubmitCandidateVerification = () => {
    const queryClient = useQueryClient();
    const { userProfile, refreshProfile } = useAuth();

    return useMutation({
        mutationFn: async (_file: File) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');

            const candidateId = userProfile.uid;
            let extracted: CandidateVerificationOcrData | undefined;

            // OCR is best-effort only. The admin review flow is the source of truth.
            try {
                const formData = new FormData();
                formData.append('file', _file);

                const response = await fetch('http://localhost:8000/api/verify-cccd', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result?.success && result?.data) {
                        extracted = {
                            cccd_number: result.data.cccd_number || null,
                            full_name: result.data.full_name || null,
                            dob: result.data.dob || null,
                        };
                    }
                }
            } catch (error) {
                console.warn('OCR service unavailable. Submitting verification request without OCR data.', error);
            }

            return submitCandidateVerification(candidateId, _file, extracted);
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
