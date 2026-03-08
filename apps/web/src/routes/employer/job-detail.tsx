import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Users, Calendar, DollarSign, AlertCircle, Trash2, Loader2, Pencil } from 'lucide-react';
import { useJobDetail } from '@/features/jobs/hooks/useEmployerJobs';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useDeleteJob } from '@/features/jobs/hooks/useEmployerJobs';
import { toast } from 'sonner';
import { getRelativeTimeString } from '@/utils/formatTime';

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
  const timeAgo = getRelativeTimeString(job.createdAt);

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
                {job.startDate
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
      </div>
    </div>
  );
}
