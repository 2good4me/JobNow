import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Briefcase, Calendar, Clock, MapPin, Trash2, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useState } from 'react';
import { useUpdateApplicationStatus } from '@/features/jobs/hooks/useManageApplicants';
import { toast } from 'sonner';
import { ReviewModal } from '@/features/jobs/components/ReviewModal';
import { Star, DollarSign, Loader2 } from 'lucide-react';
import { useConfirmPayment } from '@/features/jobs/hooks/useManageApplicants';

export const Route = createFileRoute('/candidate/applications/')({
    component: CandidateApplications,
});

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

function CandidateApplications() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
    const [searchText, setSearchText] = useState('');
    const updateStatusMutation = useUpdateApplicationStatus();
    const { mutate: confirmPayment, isPending: isConfirming } = useConfirmPayment();
    
    const [reviewAppId, setReviewAppId] = useState<string | null>(null);
    const [reviewTargetId, setReviewTargetId] = useState<string | null>(null);
    const [reviewTargetName, setReviewTargetName] = useState<string>('');
    const [reviewJobTitle, setReviewJobTitle] = useState<string>('');

    const { data: applications = [], isLoading } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
        limit: 100,
    });

    const filteredApplications = applications.filter(app => {
        // Status filter
        if (activeFilter === 'PENDING' && app.status !== 'NEW' && app.status !== 'PENDING') return false;
        if (activeFilter === 'APPROVED' && app.status !== 'APPROVED') return false;
        if (activeFilter === 'REJECTED' && app.status !== 'REJECTED') return false;
        // Search filter
        if (searchText && !app.jobTitle?.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
    });

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'APPROVED': return { bg: 'bg-emerald-500', text: 'text-white', label: 'Đã nhận', borderColor: 'border-emerald-400' };
            case 'REJECTED': return { bg: 'bg-rose-500', text: 'text-white', label: 'Từ chối', borderColor: 'border-rose-400' };
            case 'NEW':
            case 'PENDING': return { bg: 'bg-amber-400', text: 'text-white', label: 'Chờ duyệt', borderColor: 'border-amber-300' };
            case 'CHECKED_IN': return { bg: 'bg-blue-500', text: 'text-white', label: 'Đang làm', borderColor: 'border-blue-400' };
            case 'WORK_FINISHED': return { bg: 'bg-indigo-500', text: 'text-white', label: 'Chờ TT', borderColor: 'border-indigo-400' };
            case 'COMPLETED': return { bg: 'bg-slate-400', text: 'text-white', label: 'Hoàn thành', borderColor: 'border-slate-300' };
            case 'CASH_CONFIRMATION': return { bg: 'bg-teal-500', text: 'text-white', label: 'Chờ xác nhận', borderColor: 'border-teal-400' };
            case 'CANCELLED': return { bg: 'bg-slate-300', text: 'text-slate-600', label: 'Đã hủy', borderColor: 'border-slate-200' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-600', label: status, borderColor: 'border-slate-200' };
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
                    } catch {
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
        <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-14 pb-6">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate({ to: '/candidate/profile' })}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-white text-lg font-bold flex-1">Việc làm đã ứng tuyển</h1>
                    <div className="bg-white/20 text-white text-[12px] font-bold px-2.5 py-1 rounded-xl">
                        {applications.length} đơn
                    </div>
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
                    <Search className="w-4 h-4 text-white/60 shrink-0" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên công việc..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="bg-transparent text-white text-[14px] placeholder:text-white/50 flex-1 outline-none"
                    />
                </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white border-b border-slate-100 px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2 flex-shrink-0 ${
                            activeFilter === f.value
                                ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="p-4 max-w-lg mx-auto space-y-3">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm font-medium text-slate-500">Đang tải danh sách...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm mt-2">
                        <div className="w-16 h-16 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có đơn nào</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            {activeFilter === 'ALL' ? 'Bạn chưa ứng tuyển công việc nào.' : 'Không có đơn ở trạng thái này.'}
                        </p>
                        <Link to="/jobs" className="bg-[#1e3a5f] text-white font-bold px-6 py-2.5 rounded-xl shadow-md">
                            Tìm việc làm
                        </Link>
                    </div>
                ) : (
                    filteredApplications.map((app) => {
                        const theme = getStatusTheme(app.status);
                        const canCancel = app.status === 'NEW' || app.status === 'PENDING';

                        return (
                            <Link
                                key={app.id}
                                to="/candidate/applications/$applicationId"
                                params={{ applicationId: app.id }}
                                className="block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Status stripe on top */}
                                <div className={`${theme.bg} px-4 py-2 flex items-center justify-between`}>
                                    <span className={`text-[11px] font-black uppercase tracking-wider ${theme.text}`}>
                                        {theme.label}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-white/80 text-[11px]">
                                        <Calendar className="w-3 h-3" />
                                        {app.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'N/A'}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 pr-3">
                                            <h3 className="font-bold text-slate-900 text-[15px] mb-1 line-clamp-2">
                                                {app.jobTitle || 'Công việc đã ứng tuyển'}
                                            </h3>
                                            <div className="flex items-center gap-1 text-indigo-600 text-[12px] font-semibold">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Ca: {app.shiftTime || 'Chưa xác định'}</span>
                                            </div>
                                        </div>
                                        {canCancel && (
                                            <button
                                                onClick={(e) => handleCancelApplication(e, app.id)}
                                                className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-xl shrink-0"
                                            >
                                                <Trash2 className="w-3 h-3" /> Rút đơn
                                            </button>
                                        )}
                                    </div>

                                    {/* Action buttons for special statuses */}
                                    {app.status === 'CASH_CONFIRMATION' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                confirmPayment(app.id, {
                                                    onSuccess: () => toast.success('Xác nhận nhận tiền thành công!')
                                                });
                                            }}
                                            disabled={isConfirming}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-[13px] font-black active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                            XÁC NHẬN ĐÃ NHẬN TIỀN
                                        </button>
                                    )}
                                    {app.status === 'COMPLETED' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setReviewAppId(app.id);
                                                setReviewTargetId(app.employerId);
                                                setReviewTargetName('Nhà tuyển dụng');
                                                setReviewJobTitle(app.jobTitle || 'Công việc');
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 text-[13px] font-bold active:scale-[0.98] transition-colors"
                                        >
                                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                            Đánh giá nhà tuyển dụng
                                        </button>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 font-medium">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                            <span>Chi tiết đơn</span>
                                        </div>
                                        <div className="text-indigo-600 font-bold flex items-center gap-0.5">
                                            Xem <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <ReviewModalWrapper
                appId={reviewAppId}
                targetId={reviewTargetId}
                targetName={reviewTargetName}
                jobTitle={reviewJobTitle}
                onClose={() => setReviewAppId(null)}
            />
        </div>
    );
}

function ReviewModalWrapper({ 
    appId, targetId, targetName, jobTitle, onClose 
}: { 
    appId: string | null; targetId: string | null; targetName: string; jobTitle: string; onClose: () => void 
}) {
    const { user } = useAuth();
    if (!appId || !targetId || !user) return null;

    return (
        <ReviewModal
            isOpen={true}
            onClose={onClose}
            applicationId={appId}
            reviewerId={user.uid}
            revieweeId={targetId}
            revieweeName={targetName}
            jobTitle={jobTitle}
        />
    );
}

export default CandidateApplications;
