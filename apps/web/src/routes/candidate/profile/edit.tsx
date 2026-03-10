import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';
import { ArrowLeft, User, Phone, MapPin, AlignLeft, Save } from 'lucide-react';

export const Route = createFileRoute('/candidate/profile/edit')({
    component: CandidateProfileEditPage,
});

function CandidateProfileEditPage() {
    const { userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        full_name: userProfile?.full_name || '',
        phone_number: userProfile?.phone_number || '',
        bio: userProfile?.bio || '',
        address_text: userProfile?.address_text || '',
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');
            await updateUserDocument(userProfile.uid, data);
        },
        onSuccess: async () => {
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Cập nhật hồ sơ thành công');
            navigate({ to: '/candidate/profile' });
        },
        onError: (error: any) => {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            toast.error(error?.message || 'Có lỗi xảy ra khi lưu thông tin.');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.full_name.trim()) {
            toast.error('Vui lòng nhập họ và tên');
            return;
        }

        updateProfileMutation.mutate(formData);
    };

    // Return early or show loading if userProfile is not loaded yet
    if (!userProfile) return null;

    return (
        <div className="min-h-[100dvh] bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <button
                    onClick={() => navigate({ to: '/candidate/profile' })}
                    className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </button>
                <h1 className="text-lg font-bold text-slate-800">Chỉnh sửa hồ sơ</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            <div className="px-5 pt-6 pb-8">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500 mb-6 text-center">
                        Cập nhật thông tin cá nhân giúp nhà tuyển dụng dễ dàng liên hệ với bạn hơn.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Họ và tên */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                                />
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                                Số điện thoại
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 0912345678"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                                />
                            </div>
                        </div>

                        {/* Giới thiệu bản thân */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                                Giới thiệu bản thân (Bio)
                            </label>
                            <div className="relative">
                                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                                    <AlignLeft className="h-5 w-5 text-slate-400" />
                                </div>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Chia sẻ một chút về bản thân, kinh nghiệm làm việc hoặc mục tiêu cá nhân..."
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:font-normal resize-none"
                                />
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider ml-1">
                                Địa chỉ hiện tại
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="address_text"
                                    value={formData.address_text}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Quận 1, TP Hồ Chí Minh"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {updateProfileMutation.isPending ? (
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Lưu thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
