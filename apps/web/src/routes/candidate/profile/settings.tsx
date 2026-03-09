import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserDocument } from '@/lib/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Bell, BellRing, Save, Shield, FileText } from 'lucide-react';

export const Route = createFileRoute('/candidate/profile/settings')({
    component: CandidateProfileSettingsPage,
});

function CandidateProfileSettingsPage() {
    const { userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [settings, setSettings] = useState({
        notification_push: userProfile?.notification_push ?? true,
        notification_email: userProfile?.notification_email ?? true,
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (data: typeof settings) => {
            if (!userProfile?.uid) throw new Error('Chưa đăng nhập');
            await updateUserDocument(userProfile.uid, data);
        },
        onSuccess: async () => {
            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Lưu cài đặt thành công');
        },
        onError: (error: any) => {
            console.error('Lỗi khi lưu cài đặt:', error);
            toast.error(error?.message || 'Có lỗi xảy ra khi lưu.');
        }
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        updateSettingsMutation.mutate(settings);
    };

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
                <h1 className="text-lg font-bold text-slate-800">Cài đặt ứng dụng</h1>
                <div className="w-10" />
            </div>

            <div className="px-5 pt-6 space-y-6">

                {/* Notification Settings */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Thông báo
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-[15px]">Thông báo ứng dụng (Push)</p>
                                    <p className="text-[13px] text-slate-500">Nhận thông báo khi có việc làm mới, trạng thái ứng tuyển</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle('notification_push')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notification_push ? 'bg-blue-600' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${settings.notification_push ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-[15px]">Thông báo Email</p>
                                    <p className="text-[13px] text-slate-500">Nhận email tổng hợp việc làm hàng tuần</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle('notification_email')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.notification_email ? 'bg-blue-600' : 'bg-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ease-in-out ${settings.notification_email ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account & Security */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                        Bảo mật & Chính sách
                    </h2>

                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 py-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-[15px]">Quyền riêng tư</p>
                                <p className="text-[13px] text-slate-500">Quản lý dữ liệu cá nhân của bạn</p>
                            </div>
                        </button>
                        <button className="w-full flex items-center gap-3 py-3 text-left">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-[15px]">Điều khoản sử dụng</p>
                                <p className="text-[13px] text-slate-500">Đọc các quy định của JobNow</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleSave}
                        disabled={updateSettingsMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {updateSettingsMutation.isPending ? (
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Lưu thay đổi</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
