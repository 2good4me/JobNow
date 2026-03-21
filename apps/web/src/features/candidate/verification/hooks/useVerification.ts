import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { uploadCandidateID, submitCandidateVerification } from '../services/verificationService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';

export const useSubmitCandidateVerification = () => {
    const queryClient = useQueryClient();
    const { userProfile, refreshProfile } = useAuth();

    return useMutation({
        mutationFn: async (_file: File) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');

            const candidateId = userProfile.uid;

            // Gọi API bằng fetch
            const formData = new FormData();
            formData.append('file', _file);

            console.log('Sending CCCD to OCR service...');
            const response = await fetch('http://localhost:8000/api/verify-cccd', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Không thể kết nối với dịch vụ OCR');
            }

            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Lỗi xử lý hình ảnh');
            }

            const extracted = result.data;
            const isSuccess = !!(extracted.cccd_number && extracted.full_name);

            console.log('Update firestore for candidate:', candidateId, extracted);
            
            await updateUserDocument(candidateId, {
                verification_status: isSuccess ? 'VERIFIED' : 'PENDING',
                cccd_number: extracted.cccd_number || null,
                cccd_full_name: extracted.full_name || null,
                cccd_dob: extracted.dob || null,
            });

            return result;
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
