import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
    ArrowLeft, 
    Share2, 
    MapPin, 
    Briefcase, 
    BadgeCheck, 
    ShieldCheck, 
    Star, 
    MessageCircle,
    CheckCircle2,
    Award,
    Clock,
    Loader2
} from 'lucide-react';
import { useCandidateProfile } from '@/features/jobs/hooks/useCandidateProfile';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Application } from '@jobnow/types';
import { mapApplicationDocToApplication } from '@/features/jobs/services/adapters';
import { startConversation } from '@/features/chat/services/chatService';
import { useState } from 'react';

export const Route = createFileRoute('/employer/candidate/$candidateId' as any)({
    component: CandidateDetailPage,
});

/** Fetch completed/work-finished applications for a specific candidate from this employer */
async function fetchCandidateWorkHistory(candidateId: string, employerId: string): Promise<Application[]> {
    const ref = collection(db, 'applications');
    // Try both snake_case and camelCase field naming
    const runQuery = async (candField: string, empField: string) => {
        const q = query(
            ref,
            where(candField, '==', candidateId),
            where(empField, '==', employerId),
            limit(30)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => mapApplicationDocToApplication(d.id, d.data() as any));
    };
    const [snake, camel] = await Promise.all([
        runQuery('candidate_id', 'employer_id'),
        runQuery('candidateId', 'employerId'),
    ]);
    // Dedupe and filter completed statuses
    const map = new Map<string, Application>();
    [...snake, ...camel].forEach(a => map.set(a.id, a));
    return Array.from(map.values())
        .filter(a => ['COMPLETED', 'WORK_FINISHED', 'CASH_CONFIRMATION'].includes(a.status))
        .sort((a, b) => {
            const ta = a.updatedAt?.toDate?.()?.getTime?.() ?? 0;
            const tb = b.updatedAt?.toDate?.()?.getTime?.() ?? 0;
            return tb - ta;
        });
}

function CandidateDetailPage() {
    const { candidateId } = Route.useParams() as { candidateId: string };
    const navigate = useNavigate();
    const { user } = useAuth();
    const employerId = user?.uid || '';
    const { data: candidate, isLoading } = useCandidateProfile(candidateId);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Fetch real work history from applications
    const { data: workHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['candidate-work-history', candidateId, employerId],
        queryFn: () => fetchCandidateWorkHistory(candidateId, employerId),
        enabled: !!candidateId && !!employerId,
    });

    const handleChat = async () => {
        setIsChatLoading(true);
        try {
            // Use the most recent application as context, if any
            const recentApp = workHistory[0];
            const result = await startConversation({
                applicationId: recentApp?.id,
                employerId,
            });
            navigate({
                to: '/employer/chat' as any,
                search: { applicationId: result.conversationId } as any,
            });
        } catch {
            // Fallback: open chat with just candidateId
            navigate({
                to: '/employer/chat' as any,
                search: { candidateId } as any,
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 mb-4">Không tìm thấy thông tin ứng viên.</p>
                <button 
                    onClick={() => navigate({ to: '/employer/applicants' as any })}
                    className="text-blue-600 font-bold"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const verificationBadge = candidate.verificationStatus === 'VERIFIED'
        ? { color: 'bg-emerald-500', text: 'Đã xác minh' }
        : candidate.verificationStatus === 'PENDING'
            ? { color: 'bg-amber-500', text: 'Đang xét duyệt' }
            : { color: 'bg-slate-400', text: 'Chưa xác minh' };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header App Bar */}
            <div className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
                <button
                    onClick={() => window.history.back()}
                    className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                </button>
                <h1 className="text-[17px] font-bold text-slate-900">Chi tiết ứng viên</h1>
                <button className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-800" />
                </button>
            </div>

            {/* Profile Header */}
            <div className="pt-20 pb-8 px-5 bg-gradient-to-b from-white to-slate-50">
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-[104px] h-[104px] rounded-full p-1 bg-white shadow-md">
                            {candidate.avatarUrl ? (
                                <img
                                    src={candidate.avatarUrl}
                                    alt={candidate.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-3xl font-bold">
                                    {candidate.fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 ${verificationBadge.color} text-white p-1.5 rounded-full border-4 border-white shadow-sm`}>
                            <BadgeCheck className="w-4 h-4" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-1">{candidate.fullName}</h2>
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${verificationBadge.color} text-white uppercase tracking-wider`}>
                            {verificationBadge.text}
                        </span>
                        <div className="flex items-center gap-1 text-[13px] font-medium text-slate-500">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>4.8 (12 đánh giá)</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <button 
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-full shadow-sm transition-colors"
                            onClick={handleChat}
                            disabled={isChatLoading}
                        >
                            {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="px-5 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uy tín</p>
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-2xl font-black">{candidate.reputationScore}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đã làm (bạn)</p>
                        <div className="flex items-center gap-1.5 text-blue-600">
                            <Briefcase className="w-5 h-5" />
                            <span className="text-2xl font-black">{workHistory.length}</span>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Giới thiệu</h3>
                        <p className="text-[15px] text-slate-600 leading-relaxed italic">
                            {candidate.bio || "Không có thông tin giới thiệu."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Địa chỉ</p>
                            <p className="text-[15px] font-medium text-slate-800">{candidate.addressText || "Chưa cập nhật địa chỉ"}</p>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Kỹ năng chuyên môn</h3>
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.length > 0 ? candidate.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
                                <Award className="w-4 h-4" />
                                {skill}
                            </span>
                        )) : (
                            <span className="text-slate-400 text-sm italic">Chưa cập nhật kỹ năng.</span>
                        )}
                    </div>
                </div>

                {/* Work History from Applications (Real Data) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lịch sử làm việc (với bạn)</h3>
                        {isHistoryLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                    </div>
                    <div className="space-y-3">
                        {!isHistoryLoading && workHistory.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">Ứng viên chưa hoàn thành ca nào với bạn.</p>
                        ) : (
                            workHistory.map((app) => {
                                const toDate = (ts: any): Date | null => ts?.toDate?.() ?? (ts ? new Date(ts) : null);
                                const checkInDate = toDate(app.checkInTime);
                                const checkOutDate = toDate((app as any).checkOutTime);
                                const completedDate = toDate(app.updatedAt);
                                let duration = '';
                                if (checkInDate && checkOutDate) {
                                    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
                                    const h = Math.floor(diffMs / 3600000);
                                    const m = Math.floor((diffMs % 3600000) / 60000);
                                    duration = `${h} giờ ${m} phút`;
                                }
                                return (
                                    <div key={app.id} className="flex gap-4 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-1 bg-emerald-100 rounded-full shrink-0 mt-1" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[15px] font-bold text-slate-800 truncate">{app.jobTitle || 'Công việc'}</p>
                                            {app.shiftTime && (
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" /> Ca: {app.shiftTime}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="font-semibold">{duration || 'Đã hoàn thành'}</span>
                                                </div>
                                                {completedDate && (
                                                    <span className="text-[11px] text-slate-400">
                                                        {completedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* User-entered Experience Section */}
                {candidate.experiences.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Kinh nghiệm tự khai</h3>
                        <div className="space-y-4">
                            {candidate.experiences.map((exp, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="w-1 bg-slate-100 rounded-full shrink-0" />
                                    <div className="flex-1 pb-1">
                                        <p className="text-[15px] font-bold text-slate-800">{exp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Badges */}
                <div className="py-6 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full shadow-sm font-bold text-[13px] mb-4">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Đã xác thực hồ sơ bởi JobNow
                    </div>
                    <p className="text-[11px] text-slate-400 text-center font-medium">Mọi thông tin đã được kiểm duyệt e-KYC.</p>
                </div>
            </div>
        </div>
    );
}
