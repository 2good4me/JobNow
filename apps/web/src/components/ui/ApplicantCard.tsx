import { Check, Clock3, Shield, UserRoundCheck, X, Briefcase, Loader2, Phone, MessageCircle, Star, Timer, AlertCircle } from 'lucide-react';
import type { Application } from '@jobnow/types';
import { useUpdateApplicationStatus, useCompleteApplication, useForceCheckOut, useSimulateWorkTime } from '@/features/jobs/hooks/useManageApplicants';
import { useCandidateProfile } from '@/features/jobs/hooks/useCandidateProfile';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ReviewModal } from '@/features/jobs/components/ReviewModal';
import { useAuth } from '@/features/auth/context/AuthContext';

type ApplicantCardProps = {
  applicationId: string;
  candidateId: string;
  status: Application['status'];
  jobTitle?: string;
  shiftTime?: string;
  appliedAt?: Date;
  onApproved?: () => void;
  // ─── Denormalized candidate snapshot (preferred, skip fetch) ───
  candidateName?: string;
  candidateAvatar?: string;
  candidateSkills?: string[];
  candidateRating?: number;
  candidateVerified?: boolean;
  checkInTime?: any;
  isLate?: boolean;
};

/* ── Micro confetti burst ── */
function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-confetti-burst block w-2 h-2 rounded-full"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${20 + Math.random() * 30}%`,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
            animationDelay: `${i * 40}ms`,
            animationDuration: `${600 + Math.random() * 400}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Work Timer Component ── */
function WorkTimer({ startTime }: { startTime: any }) {
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    if (!startTime) return;

    const start = startTime.toDate?.() || new Date(startTime);
    
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - start.getTime());
      
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor(diff / (1000 * 60 * 60));

      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-indigo-600 font-bold">{duration}</span>;
}

export function ApplicantCard({
  applicationId,
  candidateId,
  status,
  jobTitle,
  shiftTime,
  appliedAt,
  onApproved,
  candidateName: dnName,
  candidateAvatar: dnAvatar,
  candidateSkills: dnSkills,
  candidateRating: dnRating,
  candidateVerified: dnVerified,
  checkInTime,
  isLate,
}: ApplicantCardProps) {
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();
  // Only fetch candidate profile if denormalized data is missing (backward compat)
  const hasDenormalized = !!dnName;
  const { data: candidate, isLoading: isCandLoading } = useCandidateProfile(
    hasDenormalized ? undefined : candidateId
  );
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const { mutate: completeWithPayment, isPending: isPaying } = useCompleteApplication();
  const { mutate: forceCheckOut, isPending: isForcing } = useForceCheckOut();
  const { mutate: simulateWorkTime, isPending: isSimulating } = useSimulateWorkTime();
  const [showPayOptions, setShowPayOptions] = useState(false);

  // Prefer denormalized data, fallback to fetched profile
  const fullName = dnName || candidate?.fullName || 'Ứng viên';
  const avatarUrl = dnAvatar || candidate?.avatarUrl;
  const skills = dnSkills || candidate?.skills || [];
  const score = dnRating ?? candidate?.reputationScore ?? 0;
  const hasEkyc = dnVerified ?? (candidate?.verificationStatus === 'VERIFIED');
  const initial = (fullName[0] || 'U').toUpperCase();

  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    NEW: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Mới' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Chờ duyệt' },
    REVIEWED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Đã duyệt' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Đã duyệt' },
    CHECK_IN: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Đang làm' },
    WORK_FINISHED: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Chờ thanh toán' },
    CASH_CONFIRMATION: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Chờ xác nhận TM' },
    COMPLETED: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', label: 'Hoàn thành' },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Từ chối' },
    CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Đã hủy' },
  };
  const sc = statusConfig[status] || statusConfig.NEW;

  const timeAgo = appliedAt
    ? new Intl.RelativeTimeFormat('vi', { numeric: 'auto' }).format(
      -Math.round((Date.now() - appliedAt.getTime()) / (1000 * 60 * 60)),
      'hour'
    )
    : 'Hôm nay';

  const handleApprove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfetti(true);
    updateStatus(
      { id: applicationId, status: 'APPROVED' },
      {
        onSuccess: () => {
          onApproved?.();
          setTimeout(() => setShowConfetti(false), 1200);
        },
        onError: (err) => {
          setShowConfetti(false);
          alert(`Không thể duyệt: ${err.message}`);
        }
      }
    );
  }, [applicationId, updateStatus, onApproved]);

  const handleReject = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateStatus(
      { id: applicationId, status: 'REJECTED' },
      {
        onError: (err) => alert(`Không thể từ chối: ${err.message}`)
      }
    );
  }, [applicationId, updateStatus]);

  const handleChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({
      to: '/employer/chat',
      search: { applicationId }
    } as any);
  }, [navigate, applicationId]);

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = (candidate as any)?.phone_number || (candidate as any)?.phoneNumber;
    if (phone) window.open(`tel:${phone}`, '_self');
  }, [candidate]);

  const { user } = useAuth();
  const [reviewOpen, setReviewOpen] = useState(false);

  const canApprove = !['REVIEWED', 'APPROVED', 'CHECKED_IN', 'WORK_FINISHED', 'CASH_CONFIRMATION', 'COMPLETED', 'CANCELLED'].includes(status);
  const canReject = !['REJECTED', 'WORK_FINISHED', 'CASH_CONFIRMATION', 'COMPLETED', 'CANCELLED'].includes(status);
  const canPay = status === 'WORK_FINISHED';
  const canReview = status === 'COMPLETED';
  const canForceEnd = status === 'CHECKED_IN';

  const handlePay = (method: 'APP' | 'CASH') => {
    if (!user?.uid) {
      alert('Không tìm thấy thông tin nhà tuyển dụng. Vui lòng thử lại.');
      return;
    }

    completeWithPayment(
      { id: applicationId, paymentMethod: method, employerId: user.uid },
      {
        onSuccess: () => {
          setShowPayOptions(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        },
        onError: (err) => alert(`Thanh toán thất bại: ${err.message}`)
      }
    );
  };

  return (
    <article className="group relative rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
      {showConfetti && <ConfettiBurst />}

      <div 
        className="flex items-start gap-3 p-4 pb-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => navigate({ to: `/employer/candidate/${candidateId}` } as any)}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white shadow-sm">
            {isCandLoading ? (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : avatarUrl ? (
              <img alt={fullName} className="h-full w-full object-cover" src={avatarUrl} loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-600">
                <span className="text-lg font-bold text-white">{initial}</span>
              </div>
            )}
          </div>
          {hasEkyc && (
            <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-emerald-500 p-0.5">
              <UserRoundCheck className="h-2.5 w-2.5 text-white" />
            </div>
          )}
          {(status === 'NEW') && (
            <div className="absolute -top-0.5 -left-0.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{fullName}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.text}`}>
              {sc.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {score}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 className="h-3 w-3" /> {timeAgo}
            </span>
            {hasEkyc && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                <Shield className="h-3 w-3" /> Xác minh
              </span>
            )}
          </div>
          {jobTitle && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 truncate">
              <Briefcase className="h-3 w-3 shrink-0" /> {jobTitle} {shiftTime && `• Ca: ${shiftTime}`}
            </p>
          )}

          {/* Monitoring Info (Check-in time & Timer) */}
          {status === 'CHECKED_IN' && checkInTime && (
            <div className="mt-2 flex flex-col gap-1 rounded-xl bg-indigo-50/50 p-2 border border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-500 uppercase">Đang làm việc</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      simulateWorkTime({ applicationId, hoursAgo: 8 });
                    }}
                    disabled={isSimulating}
                    className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-[9px] font-bold text-indigo-700 hover:bg-indigo-200 transition-colors"
                    title="Giả lập đã làm được 8 tiếng để test tính lương"
                  >
                    {isSimulating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : 'TEST: +8h'}
                  </button>
                  {isLate && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-[9px] font-black text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> MUỘN
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock3 className="w-3 h-3 text-indigo-400" />
                  <span>Vào lúc: <b>{checkInTime.toDate?.().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) || new Date(checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</b></span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Timer className="w-3 h-3 text-indigo-400" />
                  <WorkTimer startTime={checkInTime} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-100">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400 border border-slate-100">+{skills.length - 3}</span>
          )}
        </div>
      )}

      {/* ── Action Bar (thumb-friendly) ── */}
      <div className="flex items-stretch border-t border-slate-50">
        {/* Quick actions: Chat + Call */}
        <button
          type="button"
          onClick={handleChat}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50/50 active:bg-indigo-100 border-r border-slate-50"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Chat
        </button>
        <button
          type="button"
          onClick={handleCall}
          disabled={!candidate}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 border-r border-slate-50"
        >
          <Phone className="h-3.5 w-3.5" /> Gọi
        </button>

        {/* Reject */}
        {canReject && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleReject}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50/50 active:bg-rose-100 disabled:opacity-50 border-r border-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Từ chối
          </button>
        )}

        {/* Approve */}
        {canApprove && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleApprove}
            className="flex flex-[1.3] items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-50/50 active:bg-emerald-100 disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Duyệt
          </button>
        )}

        {/* Force End Shift */}
        {canForceEnd && (
          <button
            type="button"
            disabled={isForcing}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Bạn có chắc chắn muốn kết thúc sớm ca làm của ứng viên này? (Hành động này không thể hoàn tác)')) {
                forceCheckOut({ applicationId, employerId: user?.uid || '' });
              }
            }}
            className="flex flex-[1.5] items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50/30 transition-colors hover:bg-rose-100 active:bg-rose-200 disabled:opacity-50"
          >
            {isForcing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Kết thúc ca
          </button>
        )}

        {/* Pay & Complete */}
        {canPay && (
          <div className="relative flex-[1.5] flex">
            {!showPayOptions ? (
              <button
                type="button"
                disabled={isPaying}
                onClick={() => setShowPayOptions(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-indigo-600 transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Briefcase className="h-4 w-4" />} 
                Trả lương
              </button>
            ) : (
              <div className="flex w-full animate-in slide-in-from-right-2 duration-200">
                <button
                  onClick={() => handlePay('APP')}
                  className="flex-1 bg-indigo-500 text-[10px] font-black text-white px-1 py-2 hover:bg-indigo-600 border-r border-white/20"
                >
                  QUA APP
                </button>
                <button
                  onClick={() => handlePay('CASH')}
                  className="flex-1 bg-emerald-500 text-[10px] font-black text-white px-1 py-2 hover:bg-emerald-600 border-r border-white/20"
                >
                  TIỀN MẶT
                </button>
                <button
                  onClick={() => setShowPayOptions(false)}
                  className="bg-slate-800 text-white p-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Review (Employer rates Candidate) */}
        {canReview && (
          <button
            type="button"
            onClick={() => setReviewOpen(true)}
            className="flex flex-[1.5] items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-amber-600 bg-amber-50/50 transition-colors hover:bg-amber-100 active:bg-amber-200"
          >
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Đánh giá
          </button>
        )}
      </div>

      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        applicationId={applicationId}
        reviewerId={user?.uid || ''}
        revieweeId={candidateId}
        revieweeName={fullName}
        jobTitle={jobTitle || 'Công việc'}
      />
    </article>
  );
}
