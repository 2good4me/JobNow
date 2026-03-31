import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Settings, Save, ShieldCheck, Percent, Banknote, 
    BellRing, Mail, Construction, Loader2, AlertCircle, 
    CheckCircle2, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchSystemSettings, saveSystemSettings, SystemSettings } from '@/features/admin/services/adminSettingsService';

export const Route = createFileRoute('/admin/settings')({
    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);

    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['system_settings'],
        queryFn: fetchSystemSettings,
    });

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const saveMutation = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => saveSystemSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system_settings'] });
            toast.success('Đã lưu cấu hình hệ thống!');
        },
        onError: () => {
            toast.error('Lỗi khi lưu cấu hình');
        }
    });

    const handleToggle = (key: keyof SystemSettings) => {
        if (!localSettings) return;
        setLocalSettings({
            ...localSettings,
            [key]: !localSettings[key]
        });
    };

    const handleChange = (key: keyof SystemSettings, value: any) => {
        if (!localSettings) return;
        setLocalSettings({
            ...localSettings,
            [key]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSettings) {
            saveMutation.mutate(localSettings);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-slate-500 font-medium">Đang tải cấu hình...</p>
            </div>
        );
    }

    if (error || !localSettings) {
        return (
            <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                    <p className="font-bold">Lỗi tải dữ liệu</p>
                    <p className="text-sm opacity-90">Không thể kết nối với cấu hình hệ thống trên Firebase. Vui lòng thử lại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-indigo-600" />
                        Cài đặt Hệ thống
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tùy chỉnh thông số vận hành và các quy định của sàn JobNow</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu thay đổi
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Phí & Tài chính */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="font-bold text-slate-800">Tài chính & Giao dịch</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phí sàn (%)</label>
                            <div className="relative">
                                <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    value={localSettings.platformFeePercentage}
                                    onChange={(e) => handleChange('platformFeePercentage', Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                                    placeholder="10"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 ml-1 italic">* Phí tự động khấu trừ vào ví nhà tuyển dụng khi hoàn thành công việc.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Lương tối thiểu (VND/h)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</div>
                                <input
                                    type="number"
                                    value={localSettings.minHourlyWage}
                                    onChange={(e) => handleChange('minHourlyWage', Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                                    placeholder="20000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Quản lý Nội dung */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="font-bold text-slate-800">Kiểm duyệt & Bảo mật</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-1">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Tự động duyệt tin</p>
                                <p className="text-[11px] text-slate-500">Tin đăng mới sẽ hiển thị ngay mà không cần chờ Admin.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('autoApproveJobs')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.autoApproveJobs ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.autoApproveJobs ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-1">
                            <div>
                                <p className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
                                    Chế độ Bảo trì
                                    <Construction className="w-3.5 h-3.5" />
                                </p>
                                <p className="text-[11px] text-slate-500">Khóa tính năng đăng nhập & giao dịch đối với toàn bộ người dùng.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggle('maintenanceMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${localSettings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Liên hệ & Hỗ trợ */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="font-bold text-slate-800">Thông tin hỗ trợ</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email hỗ trợ khách hàng</label>
                            <input
                                type="email"
                                value={localSettings.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                placeholder="support@jobnow.vn"
                            />
                        </div>

                        <div className="bg-indigo-50/50 rounded-2xl p-4 flex items-start gap-3 border border-indigo-100">
                            <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="text-[11px] text-indigo-800 leading-relaxed">
                                <p className="font-bold mb-1">Ghi chú vận hành:</p>
                                <p>Các thay đổi này sẽ có hiệu lực tức thì cho tất cả ứng dụng Client (Apps/Web). Hãy cẩn thận khi bật <strong>Chế độ Bảo trì</strong>.</p>
                                <p className="mt-2">Lần cập nhật cuối: <strong>{localSettings.updatedAt?.toLocaleString('vi-VN')}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Trạng thái kết nối */}
                <div className="md:col-span-2 py-4 flex items-center justify-center opacity-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Kết nối Firebase: OK
                        <span className="mx-2">•</span>
                        Realtime Sync: Enabled
                    </div>
                </div>
            </form>
        </div>
    );
}
