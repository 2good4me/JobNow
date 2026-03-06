import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadVerificationDocument, submitVerificationRequest } from '../services/verificationService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';

export const useSubmitVerification = () => {
    const queryClient = useQueryClient();
    const { userProfile } = useAuth();

    return useMutation({
        mutationFn: async (file: File) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');

            const employerId = userProfile.uid;

            // 1. Upload the physical document to Storage
            const imageUrl = await uploadVerificationDocument(file, employerId);

            // 2. Submit the records to Firestore
            await submitVerificationRequest(employerId, imageUrl);

            return imageUrl;
        },
        onSuccess: () => {
            // Invalidate the user profile query or trigger a context refresh if applicable
            // Ensure the UI updates immediately if it relies on context
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error: any) => {
            console.error('Lỗi khi gửi yêu cầu xác thực:', error);
            toast.error(error?.message || 'Không thể tải lên tài liệu. Vui lòng thử lại.');
        }
    });
};
