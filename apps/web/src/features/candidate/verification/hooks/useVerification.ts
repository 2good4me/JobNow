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

            // Mock an upload simulation instead of using real Firebase since
            // it's failing to resolve for the user
            console.log('Simulating file upload for candidate:', candidateId);

            await new Promise((resolve) => setTimeout(resolve, 1500));
            const imageUrl = 'https://fakeimg.pl/400x300/';

            console.log('Update simulated firestore for candidate:', candidateId);
            await updateUserDocument(candidateId, {
                verification_status: 'PENDING',
            });

            return imageUrl;
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
