import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, MapPin, XCircle, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useState } from 'react';
import { useUpdateApplicationStatus } from '@/features/jobs/hooks/useManageApplicants';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/applications')({
    component: CandidateApplications,
});

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

function CandidateApplications() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
    const updateStatusMutation = useUpdateApplicationStatus();

    // Fetch user applications
    const { data: applications = [], isLoading } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
        limit: 100, // Fetch up to 100 recent applications
    });

    const filteredApplications = applications.filter(app => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'PENDING') return app.status === 'NEW' || app.status === 'PENDING';
        return app.status === activeFilter;
    });

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Đã nhận', icon: CheckCircle2 };
            case 'REJECTED':
                return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Từ chối', icon: XCircle };
            case 'NEW':
            case 'PENDING':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Chờ duyệt', icon: Clock };
            case 'CHECKED_IN':
                return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Đang làm', icon: Briefcase };
            case 'COMPLETED':
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Hoàn thành', icon: CheckCircle2 };
            case 'CANCELLED':
                return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', label: 'Đã hủy', icon: XCircle };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status, icon: Clock };
        }
    };

    const handleCancelApplication = async (e: React.MouseEvent, applicationId: string) => {
        e.preventDefault();
        e.stopPropagation();

        toast('Rút đơn ứng tuyển?', {
            description: 'Bạn có chắc chắn muốn hủy đơn ứng tuyển này không?',
            action: {
                label: 'Hủy đơn',
                onClick: async () => {
                    try {
                        await updateStatusMutation.mutateAsync({ id: applicationId, status: 'CANCELLED' });
                        toast.success('Đã rút đơn ứng tuyển thành công');
                    } catch (error) {
                        toast.error('Không thể hủy đơn, vui lòng thử lại');
                    }
                }
            }
        });
    };

    const filters: { label: string; value: FilterStatus }[] = [
        { label: 'Tất cả', value: 'ALL' },
        { label: 'Chờ duyệt', value: 'PENDING' },
        { label: 'Đã nhận', value: 'APPROVED' },
        { label: 'Từ chối', value: 'REJECTED' },
    ];

    return (
        <div className="min-h-[100dvh] bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
                <div className="p-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate({ to: '/candidate/profile' })}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Việc làm đã ứng tuyển</h1>
                </div>

                {/* Status Tabs */}
                <div className="flex px-4 pb-2 gap-2 overflow-x-auto no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setActiveFilter(f.value)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2 ${activeFilter === f.value
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="p-4 max-w-lg mx-auto space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-medium text-slate-500">Đang tải danh sách...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-12 px-4 shadow-sm bg-white rounded-3xl border border-slate-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy ứng tuyển</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            {activeFilter === 'ALL'
                                ? 'Bạn chưa ứng tuyển công việc nào.'
                                : `Bạn không có đơn ứng tuyển nào ở trạng thái này.`}
                        </p>
                        <Link
                            to="/jobs"
                            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all"
                        >
                            Tìm việc làm
                        </Link>
                    </div>
                ) : (
                    filteredApplications.map((app) => {
                        const theme = getStatusTheme(app.status);
                        const StatusIcon = theme.icon;
                        const canCancel = app.status === 'NEW' || app.status === 'PENDING';

                        return (
                            <Link
                                key={app.id}
                                to="/candidate/jobs/$jobId"
                                params={{ jobId: app.jobId }}
                                className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="pr-4 flex-1">
                                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {app.jobTitle || 'Công việc đã ứng tuyển'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs mb-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Ca làm: {app.shiftTime || 'Chưa xác định'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[11px] text-slate-400 font-medium">Mã Đơn: #{app.id.slice(-6).toUpperCase()}</p>
                                            {canCancel && (
                                                <button
                                                    onClick={(e) => handleCancelApplication(e, app.id)}
                                                    className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-2 py-0.5 rounded-full"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Rút đơn
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-bold tracking-wide uppercase">{theme.label}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                            <span>Chi tiết</span>
                                        </div>
                                        <span className="text-slate-200">•</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            <span>{app.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="text-blue-600 font-bold flex items-center gap-0.5">
                                        Xem <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CandidateApplications;
