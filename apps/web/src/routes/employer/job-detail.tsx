import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Users, Calendar, DollarSign, AlertCircle, Trash2, Loader2, Pencil, CheckCircle2, Eye, CheckCircle, ChevronRight, Star, Clock } from 'lucide-react';
import { useJobDetail, useRealtimeJob } from '@/features/jobs/hooks/useEmployerJobs';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useDeleteJob } from '@/features/jobs/hooks/useEmployerJobs';
import { useRealtimeJobApplications } from '@/features/jobs/hooks/useManageApplicants';
import { useCandidateProfile } from '@/features/jobs/hooks/useCandidateProfile';
import { toast } from 'sonner';
import { calculateBudget } from './-utils/budgetCalculations';
import type { PayType } from './-schemas/jobFormSchema';

/* ── Mini Applicant Avatar Card ── */
function MiniApplicantCard({ candidateId, status, candidateName: dnName, candidateAvatar: dnAvatar, candidateRating: dnRating }: {
  candidateId: string;
  status: string;
  candidateName?: string;
  candidateAvatar?: string;
  candidateRating?: number;
}) {
  const hasDenormalized = !!dnName;
  const { data: candidate, isLoading } = useCandidateProfile(hasDenormalized ? undefined : candidateId);
  const name = dnName || candidate?.fullName || 'Ứng viên';
  const avatar = dnAvatar || candidate?.avatarUrl;
  const initial = (name[0] || 'U').toUpperCase();
  const score = dnRating ?? candidate?.reputationScore ?? 0;

  const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: 'Mới', color: 'bg-blue-100/50 text-blue-700' },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100/50 text-amber-700' },
    APPROVED: { label: 'Đã nhận', color: 'bg-emerald-100/50 text-emerald-700' },
    REVIEWED: { label: 'Đã duyệt', color: 'bg-emerald-100/50 text-emerald-700' },
    REJECTED: { label: 'Từ chối', color: 'bg-rose-100/50 text-rose-600' },
  };
  const sc = statusMap[status] || statusMap.NEW;

  if (isLoading) {
    return (
      <div className="w-[120px] shrink-0 rounded-2xl bg-white border border-slate-100 p-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto mb-2" />
        <div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1" />
        <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-[120px] shrink-0 rounded-2xl bg-white border border-slate-100 p-3 shadow-sm text-center">
      <div className="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden border-2 border-slate-50 shadow-sm relative">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f]/80 to-[#1e40af]/80 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
        )}
      </div>
      <p className="text-[13px] font-bold text-[#1e3a5f] truncate mb-0.5">{name}</p>
      <span className={`inline-block text-[10px] font-bold rounded-md px-2 py-0.5 ${sc.color}`}>{sc.label}</span>
      {score > 0 && (
        <div className="flex items-center justify-center gap-0.5 mt-1.5 bg-amber-50 rounded-full py-0.5 px-2 w-max mx-auto">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-600">{score.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/employer/job-detail')({
  component: JobDetailPage,
  validateSearch: (search: Record<string, any>) => ({
    jobId: search.jobId as string,
  }),
});

function JobDetailPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useSearch();
  const { userProfile } = useAuth();
  const { data: job, isLoading, isError, error } = useJobDetail(jobId);
  useRealtimeJob(jobId);
  const deleteJobMutation = useDeleteJob();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch applicants for this job (must be called unconditionally before early returns)
  const { data: applicants = [] } = useRealtimeJobApplications(jobId, userProfile?.uid);

  if (!jobId || isError || (!isLoading && !job)) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate({ to: '/employer' })}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold text-[13px] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
            <AlertCircle className="w-14 h-14 mx-auto mb-4 text-rose-500" />
            <p className="text-slate-900 font-bold text-base mb-2">Không tìm thấy tin tuyển dụng</p>
            <p className="text-slate-500 text-[13px]">{error?.message || 'Tin này có thể đã bị xóa hoặc không còn tồn tại.'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-14 pb-8 sticky top-0 z-40 lg:rounded-b-[2.5rem] shadow-sm animate-pulse">
           <div className="max-w-4xl mx-auto">
             <div className="h-6 w-32 bg-white/20 rounded mb-4"></div>
             <div className="h-8 w-64 bg-white/20 rounded"></div>
           </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
          <div className="h-52 md:h-72 bg-slate-200 rounded-3xl animate-pulse ring-4 ring-white"></div>
          <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 animate-pulse">
            <div className="h-6 w-3/4 bg-slate-100 rounded mb-4"></div>
            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = userProfile?.uid === job.employerId;

  // Map database salary type to PayType
  const mapSalaryType = (type: string): PayType => {
    if (type === 'HOURLY') return 'Theo giờ';
    if (type === 'PER_SHIFT') return 'Theo ca';
    return 'Theo ngày';
  };

  // Calculate budget using new utility
  const payType = mapSalaryType(job.salaryType);
  const budgetResult = calculateBudget(
    payType,
    job.salary || 0,
    job.vacancies || 0,
    job.shifts || [],
  );

  // Applicant counts
  const approvedCount = applicants.filter(a => ['APPROVED', 'REVIEWED', 'CHECKED_IN', 'WORK_FINISHED', 'CASH_CONFIRMATION', 'COMPLETED'].includes(a.status)).length;
  const totalApplicants = applicants.length;

  const handleDelete = async () => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      toast.success('Xóa tin tuyển dụng thành công');
      navigate({ to: '/employer' });
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Không thể xóa tin tuyển dụng');
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800 relative">
      {/* ── Gradient Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-8 md:pt-12 pb-16 md:pb-20 lg:rounded-b-[3rem] shadow-md relative z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate({ to: '/employer' })}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1" />

            {isOwner ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: '/employer/post-job', search: { editJobId: jobId } })}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-sm backdrop-blur-sm"
                  title="Chỉnh sửa"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500/20 text-rose-100 hover:bg-rose-500/40 transition-colors shadow-sm backdrop-blur-sm"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-10" />
            )}
          </div>
          
          <div className="px-2 text-white pb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3 drop-shadow-sm line-clamp-2">{job.title}</h1>
            <span className="inline-block px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg border border-white/20 backdrop-blur-sm shadow-sm">
              {job.categoryId}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 md:px-6 -mt-16 md:-mt-20 relative z-40 space-y-6">

        {/* Cover image (if any) overlapping the header */}
        {job.images && job.images.length > 0 && (
          <div className="w-full h-52 md:h-80 bg-slate-200 rounded-3xl overflow-hidden shadow-xl ring-4 md:ring-[6px] ring-white">
            <img
              src={job.images[0]}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ── MINIMAL STATS ── */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => toast.info('Tính năng đang phát triển')}
              className="w-full bg-white rounded-2xl p-3 text-center border border-indigo-100 shadow-sm flex flex-col items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1.5 text-blue-500">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-lg font-black text-[#1e3a5f] leading-none mb-0.5">{(job as any).viewCount || (job as any).view_count || 0}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lượt xem</p>
            </button>
            <button 
              onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
              className="w-full bg-white rounded-2xl p-3 text-center border border-indigo-100 shadow-sm flex flex-col items-center justify-center relative hover:bg-slate-50 transition-colors active:scale-95"
            >
              {totalApplicants > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full animate-pulse border-2 border-white" />
              )}
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mb-1.5 text-indigo-500">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-lg font-black text-[#1e3a5f] leading-none mb-0.5">{totalApplicants}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ứng tuyển</p>
            </button>
            <button 
              onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
              className="w-full bg-white rounded-2xl p-3 text-center border border-indigo-100 shadow-sm flex flex-col items-center justify-center hover:bg-slate-50 transition-colors active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-1.5 text-emerald-500">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-lg font-black text-[#1e3a5f] leading-none mb-0.5">{approvedCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đã nhận</p>
            </button>
          </div>
        )}

        {/* ── CORE INFO CARD ── */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 md:p-8 shadow-sm">
          {/* Info grid - Responsive columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-[13px] mb-6">
            {/* Salary */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Mức lương</span>
                <span className="font-bold text-[#1e3a5f]">
                  {job.salary?.toLocaleString('vi-VN')}đ<span className="text-slate-500 text-xs font-medium">/{job.salaryType === 'HOURLY' ? 'giờ' : job.salaryType === 'PER_SHIFT' ? 'ca' : 'ngày'}</span>
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Địa điểm</span>
                <span className="font-bold text-[#1e3a5f] truncate pr-2">{job.location?.address}</span>
              </div>
            </div>

            {/* Workers */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Số lượng</span>
                 <span className="font-bold text-[#1e3a5f]">{job.vacancies || 0} người <span className="text-slate-400 font-medium">· {(job as any).genderPreference === 'MALE' ? 'Nam' : (job as any).genderPreference === 'FEMALE' ? 'Nữ' : 'Bất kỳ'}</span></span>
              </div>
            </div>

            {/* Work date */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Ngày bắt đầu</span>
                 <span className="font-bold text-[#1e3a5f]">
                  {job.startDate && !isNaN(new Date(job.startDate).getTime())
                    ? new Date(job.startDate).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    : '(Chưa chọn)'}
                 </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Mô tả công việc</p>
              <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Shifts */}
          {job.shifts && job.shifts.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <p className="text-[12px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Chi tiết các ca ({job.shifts.length})</p>
              <div className="space-y-2">
                {job.shifts.map((shift, idx) => (
                  <div
                    key={shift.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[13px] bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-[#1e3a5f] font-bold">{shift.name}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4 sm:pl-0">
                      <span className="text-[#1e3a5f] bg-white px-2 py-0.5 rounded border border-slate-200 font-bold shadow-sm text-xs">
                        {shift.startTime} - {shift.endTime}
                      </span>
                      <span className="text-slate-500 font-medium text-xs">
                        · {shift.quantity} người
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Breakdown Summary */}
          <div className="bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e40af]/10 rounded-2xl p-5 mt-6 border border-[#1e3a5f]/10 relative overflow-hidden">
             <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 text-[#1e3a5f]/5" />
             <div className="flex items-center justify-between relative z-10">
               <span className="text-[12px] font-bold text-[#1e3a5f]">Tổng chi phí dự kiến</span>
               <span className="text-[10px] font-bold text-white bg-[#1e40af] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">{payType}</span>
             </div>
             <p className="text-2xl font-black text-[#1e3a5f] mt-1 mb-0.5 relative z-10 border-b-2 border-[#1e3a5f]/10 pb-2">
               {budgetResult.totalBudget.toLocaleString('vi-VN')} <span className="text-[14px] font-bold text-[#1e40af]/70">VNĐ</span>
             </p>
             <div className="mt-2 space-y-1.5 relative z-10 text-[12px]">
               {budgetResult.breakdown.length > 0 && budgetResult.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[#1e3a5f]/80 font-medium">
                     <span>{item.label}</span>
                     <span className="font-bold">{item.amount.toLocaleString('vi-VN')}đ</span>
                  </div>
               ))}
               {budgetResult.workingHours && (
                 <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#1e3a5f]/10 font-bold text-[#006399]">
                   <Clock className="w-3.5 h-3.5" /> Tổng số giờ: {budgetResult.workingHours.toFixed(1)}h
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* ── APPLICANT PREVIEW SECTION ── */}
        {isOwner && totalApplicants > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-black text-slate-900">Danh sách ứng viên <span className="text-[#1e40af] ml-1 bg-[#1e40af]/10 px-2.5 py-0.5 rounded-full text-xs align-middle">{totalApplicants}</span></h2>
              {totalApplicants > 5 && (
                <button
                  onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
                  className="flex items-center gap-1 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full"
                >
                  Xem tất cả
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
              {applicants.slice(0, 5).map((app) => (
                <MiniApplicantCard
                  key={app.id}
                  candidateId={app.candidateId}
                  status={app.status}
                  candidateName={app.candidateName}
                  candidateAvatar={app.candidateAvatar}
                  candidateRating={app.candidateRating}
                />
              ))}
              {totalApplicants > 5 && (
                <button
                  onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
                  className="w-[120px] shrink-0 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-3 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg font-black mb-2 border border-indigo-100">+{totalApplicants - 5}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider">Xem thêm</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── EMPTY APPLICANT STATE ── */}
        {isOwner && totalApplicants === 0 && (
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full" />
             <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-sky-50 rounded-full" />
             
             <div className="relative z-10 w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-4 border border-indigo-100 rotate-3">
              <Users className="w-8 h-8 text-[#1e40af]" />
            </div>
            <p className="text-[15px] font-black text-[#1e3a5f] mb-1.5 relative z-10">Bạn đã sẵn sàng nhận đơn!</p>
            <p className="text-[13px] text-slate-500 relative z-10 max-w-xs mx-auto mb-4">Chia sẻ tin tuyển dụng này lên các nhóm việc làm để tìm được những ứng viên phù hợp nhất.</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-[12px] font-bold text-slate-500 mb-3 uppercase tracking-widest pl-1">Yêu cầu cụ thể</h2>
            <ul className="space-y-3">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-50/50 p-2.5 rounded-xl text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="flex-1 text-[13px] font-medium leading-tight">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] p-6 max-w-[340px] w-full shadow-2xl border border-white/20">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <p className="text-xl font-black text-center text-slate-900 mb-2">Xóa tin này?</p>
              <p className="text-[13px] text-center text-slate-500 mb-6 px-2">
                Tin tuyển dụng sẽ bị xóa vĩnh viễn và không thể khôi phục. Các ứng viên sẽ không thể xem hoặc ứng tuyển nữa.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors text-sm"
                >
                  Giữ lại
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteJobMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-rose-600/30"
                >
                  {deleteJobMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Đồng ý xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SPACING FOR BOTTOM CTA ── */}
        <div className="h-4 pointer-events-none" />
        
      </div>
      
      {/* ── FIXED BOTTOM CTA ── */}
      {isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 p-4 z-40 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button
              onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
              className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_8px_16px_rgba(30,58,95,0.2)] hover:bg-[#1e40af] transition-all active:scale-[0.98]"
            >
              <Users className="w-5 h-5" />
              Quản lý {totalApplicants > 0 ? `${totalApplicants} ` : ''}ứng viên
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
