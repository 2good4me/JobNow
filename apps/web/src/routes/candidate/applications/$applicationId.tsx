import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { 
    ArrowLeft, 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    ChevronRight,
    Building2,
    DollarSign,
    Info
} from 'lucide-react';
import { useJob } from '@/features/jobs/hooks/useJob';
import { useConfirmPayment } from '@/features/jobs/hooks/useManageApplicants';
import { useWithdrawApplication } from '@/features/jobs/hooks/useApplyJob';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/applications/$applicationId')({
    component: ApplicationDetailPage,
});

function ApplicationDetailPage() {
    const { applicationId } = useParams({ from: '/candidate/applications/$applicationId' });
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const { mutate: confirmPayment, isPending: isConfirming } = useConfirmPayment();
    const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawApplication();
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const { data: applications = [], isLoading } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
    });

    const application = applications.find(app => app.id === applicationId);
    const { data: job, isLoading: isJobLoading } = useJob(application?.jobId || '');

    if (isLoading || isJobLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy đơn ứng tuyển</h1>
                <button 
                    onClick={() => navigate({ to: '/candidate/applications' })}
                    className="text-blue-600 font-bold"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'APPROVED': return { label: 'Đã nhận', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 };
            case 'REJECTED': return { label: 'Từ chối', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle };
            case 'NEW':
            case 'PENDING': return { label: 'Chờ duyệt', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock };
            case 'CHECKED_IN': return { label: 'Đang làm', color: 'text-blue-600', bg: 'bg-blue-50', icon: Briefcase };
            case 'WORK_FINISHED': return { label: 'Chờ thanh toán', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: CheckCircle2 };
            case 'CASH_CONFIRMATION': return { label: 'Chờ bạn xác nhận tiền mặt', color: 'text-blue-700', bg: 'bg-blue-50', icon: DollarSign };
            case 'COMPLETED': return { label: 'Hoàn thành', color: 'text-slate-600', bg: 'bg-slate-50', icon: CheckCircle2 };
            case 'CANCELLED': return { label: 'Đã hủy', color: 'text-slate-500', bg: 'bg-slate-100', icon: XCircle };
            default: return { label: status, color: 'text-slate-600', bg: 'bg-slate-50', icon: Info };
        }
    };

    const statusInfo = getStatusInfo(application.status);

    // Mock timeline data based on current status
    const timeline = [
        { status: 'NEW', label: 'Đã gửi ứng tuyển', time: application.createdAt?.toDate?.()?.toLocaleString('vi-VN') || 'N/A', done: true },
        { status: 'PENDING', label: 'Nhà tuyển dụng đang xem xét', time: '', done: application.status !== 'NEW' && application.status !== 'CANCELLED' },
        { status: application.status, label: statusInfo.label, time: 'Hiện tại', done: true, isCurrent: true }
    ].filter(t => t.done);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4 flex items-center gap-3">
                <button onClick={() => navigate({ to: '/candidate/applications' })} className="p-2 -ml-2 rounded-full hover:bg-slate-50">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Chi tiết ứng tuyển</h1>
            </header>

            <div className="p-4 max-w-lg mx-auto space-y-4">
                {/* Status Card */}
                <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${statusInfo.bg} border-white/50`}>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng thái hiện tại</p>
                        <h2 className={`text-xl font-black ${statusInfo.color}`}>{statusInfo.label}</h2>
                    </div>
                    <statusInfo.icon className={`w-10 h-10 ${statusInfo.color} opacity-40`} />
                </div>

                {/* Job Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {job?.images?.[0] ? <img src={job.images[0]} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 truncate">{job?.title}</h3>
                            <p className="text-sm font-medium text-slate-500 truncate">{job?.employerName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Lương</p>
                                <p className="text-sm font-bold text-slate-800">{job?.salary?.toLocaleString()}đ</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Ca làm</p>
                                <p className="text-sm font-bold text-slate-800">{application.shiftTime || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate({ to: '/candidate/jobs/$jobId', params: { jobId: application.jobId } })}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-blue-600 font-bold text-sm transition-colors"
                    >
                        Xem chi tiết công việc <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Cash Confirmation Action */}
                {application.status === 'CASH_CONFIRMATION' && (
                    <div className="bg-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-200 text-white space-y-4 animate-in zoom-in duration-300">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Đã nhận được tiền mặt?</h3>
                                <p className="text-emerald-50 text-xs mt-1">Vui lòng xác nhận nếu bạn đã nhận đủ tiền công từ nhà tuyển dụng.</p>
                            </div>
                        </div>
                        <button 
                            disabled={isConfirming}
                            onClick={() => confirmPayment(application.id, {
                                onSuccess: () => {
                                    toast.success('Xác nhận thành công! Ca làm đã hoàn tất.');
                                }
                            })}
                            className="w-full py-4 bg-white text-emerald-700 font-black rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            XÁC NHẬN ĐÃ NHẬN TIỀN
                        </button>
                    </div>
                )}

                {/* Cancel Shift Action */}
                {['NEW', 'PENDING', 'APPROVED', 'CHECKED_IN'].includes(application.status) && (
                    <div className="mt-4 space-y-3">
                        {!showCancelConfirm ? (
                            <button 
                                disabled={isWithdrawing}
                                onClick={() => setShowCancelConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Hủy Ca Làm
                            </button>
                        ) : (
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-700 text-sm">Xác nhận hủy ca làm?</p>
                                        <p className="text-xs text-red-600/80 mt-1">Nếu đã được duyệt, nhà tuyển dụng sẽ nhận lại tiền và điểm uy tín của bạn có thể bị ảnh hưởng.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Không, giữ lại
                                    </button>
                                    <button
                                        disabled={isWithdrawing}
                                        onClick={() => {
                                            withdraw({ applicationId: application.id, candidateId: userProfile?.uid || '' }, {
                                                onSuccess: () => {
                                                    toast.success('Đã hủy ứng tuyển thành công.');
                                                    setShowCancelConfirm(false);
                                                },
                                                onError: (err: Error) => {
                                                    toast.error(err.message || 'Không thể hủy, vui lòng thử lại.');
                                                }
                                            });
                                        }}
                                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Xác nhận hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline Section */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-6">Lịch sử ứng tuyển</h3>
                    
                    <div className="relative pl-6 space-y-8">
                        {/* Vertical Line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100" />

                        {timeline.map((event, idx) => (
                            <div key={idx} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${event.isCurrent ? 'border-blue-500' : 'border-slate-300'}`}>
                                    {event.isCurrent && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
                                </div>
                                
                                <div className="space-y-1">
                                    <p className={`text-sm font-bold ${event.isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>
                                        {event.label}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-medium">{event.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Requirements / Info */}
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">Lưu ý cho bạn</p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Nhà tuyển dụng sẽ xem xét hồ sơ của bạn. Vui lòng giữ điện thoại luôn ở chế độ liên lạc được để nhận cuộc gọi hoặc thông báo phỏng vấn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
