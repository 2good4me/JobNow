import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';

export const Route = createFileRoute('/candidate/applications')({
    component: CandidateApplications,
});

function CandidateApplications() {
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    // Fetch user applications
    const { data: applications = [], isLoading } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
        limit: 100, // Fetch up to 100 recent applications
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
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status, icon: Clock };
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center gap-3">
                <button
                    onClick={() => navigate({ to: '/candidate/profile' })}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Việc làm đã ứng tuyển</h1>
            </div>

            {/* List */}
            <div className="p-4 max-w-lg mx-auto space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-medium text-slate-500">Đang tải danh sách...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có ứng tuyển nào</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Bạn chưa ứng tuyển công việc nào. Hãy tìm và ứng tuyển ngay!</p>
                        <Link
                            to="/jobs"
                            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all"
                        >
                            Tìm việc làm
                        </Link>
                    </div>
                ) : (
                    applications.map((app) => {
                        const theme = getStatusTheme(app.status);
                        const StatusIcon = theme.icon;

                        return (
                            <Link
                                key={app.id}
                                to="/candidate/jobs/$jobId"
                                params={{ jobId: app.jobId }}
                                className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="pr-4">
                                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">Ca làm: {app.shiftId}</h3>
                                        <p className="text-sm text-slate-500 font-medium">Nhà tuyển dụng: {app.employerId}</p>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-bold tracking-wide uppercase">{theme.label}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Click để xem chi tiết</span>
                                    </div>
                                    <span className="text-slate-300">•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Ngày ƯT: {app.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'N/A'}</span>
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
