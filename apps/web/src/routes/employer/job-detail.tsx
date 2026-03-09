import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Users, Calendar, DollarSign, AlertCircle, Trash2, Loader2, Pencil, Eye, CheckCircle, ChevronRight, Star } from 'lucide-react';
import { useJobDetail } from '@/features/jobs/hooks/useEmployerJobs';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useDeleteJob } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetApplicants } from '@/features/jobs/hooks/useManageApplicants';
import { useCandidateProfile } from '@/features/jobs/hooks/useCandidateProfile';
import { toast } from 'sonner';

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
    NEW: { label: 'Mới', color: 'bg-blue-50 text-blue-700' },
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700' },
    APPROVED: { label: 'Đã nhận', color: 'bg-emerald-50 text-emerald-700' },
    REVIEWED: { label: 'Đã duyệt', color: 'bg-emerald-50 text-emerald-700' },
    REJECTED: { label: 'Từ chối', color: 'bg-rose-50 text-rose-600' },
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
    <div className="w-[120px] shrink-0 rounded-2xl bg-white border border-slate-100 p-3 shadow-sm text-center hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full mx-auto mb-2 overflow-hidden border-2 border-white shadow-sm">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{initial}</span>
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
      <span className={`inline-block mt-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${sc.color}`}>{sc.label}</span>
      {score > 0 && (
        <div className="flex items-center justify-center gap-0.5 mt-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-semibold text-amber-600">{score}</span>
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
  const deleteJobMutation = useDeleteJob();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch applicants for this job (must be called unconditionally before early returns)
  const { data: applicants = [] } = useGetApplicants(jobId, userProfile?.uid);

  if (!jobId) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-[420px] mx-auto px-4 py-4">
          <button
            onClick={() => navigate({ to: '/employer' })}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
            <p className="text-slate-900 font-bold text-base">Không tìm thấy ID tin tuyển dụng</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-[420px] mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4 animate-pulse">
            <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="bg-white rounded-2xl p-4">
              <div className="h-7 w-3/4 bg-slate-200 rounded mb-3"></div>
              <div className="h-5 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="max-w-[420px] mx-auto px-4 py-4">
          <button
            onClick={() => navigate({ to: '/employer' })}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-rose-500" />
            <p className="text-slate-900 font-bold text-base mb-2">Không tìm thấy tin tuyển dụng</p>
            <p className="text-slate-500 text-sm">{error?.message || 'Tin này có thể đã bị xóa hoặc không tồn tại.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = userProfile?.uid === job.employerId;

  // Applicant counts
  const approvedCount = applicants.filter(a => a.status === 'APPROVED' || a.status === 'REVIEWED').length;
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
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-[420px] mx-auto px-4 py-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate({ to: '/employer' })}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: '/employer/post-job', search: { editJobId: jobId } })}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Chỉnh sửa"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Cover image */}
        {job.images && job.images.length > 0 && (
          <div className="w-full h-48 bg-slate-200 rounded-2xl overflow-hidden mb-4 shadow-sm">
            <img
              src={job.images[0]}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main info card - matching Step4Review layout */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
          {/* Title and category */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-slate-900">{job.title}</h1>
            <span className="text-xs text-slate-500">{job.categoryId}</span>
          </div>

          {/* Info grid - 2 columns */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {/* Salary */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">
                {job.salary?.toLocaleString('vi-VN')}đ / {job.salaryType === 'HOURLY' ? 'giờ' : job.salaryType === 'PER_SHIFT' ? 'ca' : 'ngày'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium truncate">{job.location?.address}</span>
            </div>

            {/* Workers */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">{job.vacancies || 0} người — Cả hai</span>
            </div>

            {/* Work date */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span className="font-medium">
                {job.startDate && !isNaN(new Date(job.startDate).getTime())
                  ? new Date(job.startDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                  : '(Chưa chọn)'}
              </span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600 font-medium mb-1">Mô tả</p>
              <p className="text-xs text-slate-500">{job.description}</p>
            </div>
          )}

          {/* Shifts */}
          {job.shifts && job.shifts.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600 font-medium mb-1.5">Ca làm việc ({job.shifts.length})</p>
              <div className="space-y-1">
                {job.shifts.map((shift, idx) => (
                  <div
                    key={shift.id || idx}
                    className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-slate-700 font-medium">{shift.name}</span>
                    <span className="text-slate-500">
                      {shift.startTime} — {shift.endTime} · {shift.quantity} người
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Budget */}
          <div className="pt-2 border-t border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 mt-3">
            <p className="text-xs text-slate-600 font-medium mb-1">Tổng ngân sách dự kiến</p>
            <p className="text-lg font-bold text-emerald-700">
              {((job.vacancies || 0) * (job.salary || 0)).toLocaleString('vi-VN')} VNĐ
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {job.vacancies || 0} người × {(job.salary || 0).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>

        {/* ── FUNNEL METRICS ── */}
        {isOwner && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
              <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-blue-700">—</p>
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Lượt xem</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-3 text-center border border-indigo-100">
              <Users className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-indigo-700">{totalApplicants}</p>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Ứng tuyển</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-emerald-700">{approvedCount}</p>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Đã nhận</p>
            </div>
          </div>
        )}

        {/* ── APPLICANT PREVIEW SECTION ── */}
        {isOwner && totalApplicants > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Ứng viên gần đây</h2>
              <button
                onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Xem tất cả ({totalApplicants})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
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
                  className="w-[120px] shrink-0 rounded-2xl border-2 border-dashed border-indigo-200 p-3 flex flex-col items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-lg font-bold">+{totalApplicants - 5}</span>
                  <span className="text-[10px] font-semibold">Xem thêm</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── EMPTY APPLICANT STATE ── */}
        {isOwner && totalApplicants === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">Chưa có ứng viên</p>
            <p className="text-xs text-slate-500">Chia sẻ tin để thu hút ứng viên tiềm năng!</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <h2 className="text-sm font-bold text-slate-900 mb-3">YÊU CẦU</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600 font-bold mt-0.5 text-base">✓</span>
                  <span className="flex-1">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-[360px] w-full shadow-2xl">
              <p className="text-lg font-bold text-slate-900 mb-3">Xóa tin tuyển dụng?</p>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Hành động này không thể hoàn tác. Toàn bộ thông tin liên quan sẽ bị xóa.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteJobMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {deleteJobMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FIXED BOTTOM CTA ── */}
        {isOwner && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 z-40">
            <div className="max-w-[420px] mx-auto">
              <button
                onClick={() => navigate({ to: '/employer/applicants', search: { jobId } })}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/25 transition-transform active:scale-[0.98]"
              >
                <Users className="w-5 h-5" />
                Xem tất cả {totalApplicants > 0 ? `${totalApplicants} ` : ''}ứng viên
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
