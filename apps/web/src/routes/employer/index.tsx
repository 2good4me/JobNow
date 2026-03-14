import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ChevronRight, Users, Clock, AlertCircle, Plus, FileText } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { RecentPostedJobs } from './-components/RecentPostedJobs';

export const Route = createFileRoute('/employer/')({
  component: EmployerDashboard,
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function EmployerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const employerId = userProfile?.uid;

  const { metrics, isLoading, isError, errorMessage } = useDashboardMetrics(employerId);
  const { data: employerJobs = [], isLoading: jobsLoading } = useGetEmployerJobs(employerId);
  const greeting = getGreeting();

  const companyName = userProfile?.company_name || userProfile?.full_name || 'Nhà tuyển dụng';
  const hasJobs = metrics.totalJobs > 0;

  /* ── Loading skeleton ──────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <div className="px-5 pt-8 pb-5 bg-white animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          </div>
        </div>
        <div className="px-5 mt-5 space-y-5 animate-pulse">
          <div className="flex gap-3">
            <div className="h-24 flex-1 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-24 flex-1 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-24 flex-1 bg-slate-100 rounded-xl border border-slate-200" />
          </div>
          <div className="h-16 bg-slate-100 rounded-xl border border-slate-200" />
          <div className="space-y-3 pt-3">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-20 bg-slate-100 rounded-xl border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────── */
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 max-w-sm mx-auto">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-rose-400" />
          <p className="font-bold text-slate-800 text-lg mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-slate-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ── 1. Header — Clean, flat, white ─────────── */}
      <header className="bg-white px-5 pt-8 pb-5">
        <p className="text-slate-500 text-sm font-medium">{greeting},</p>
        <h1 className="text-slate-900 text-xl font-bold tracking-tight mt-0.5 line-clamp-1">
          {companyName}
        </h1>
      </header>

      {/* ── 2. Quick Stats — Pastel flat cards ─────── */}
      {hasJobs && (
        <div className="flex gap-3 px-5 py-4">
          {/* Active Jobs */}
          <div className="flex flex-1 flex-col gap-1.5 rounded-xl p-4 bg-blue-50 border border-blue-100">
            <FileText className="w-5 h-5 text-blue-700" />
            <p className="text-blue-700 text-[11px] font-semibold uppercase tracking-wider">Tin đăng</p>
            <p className="text-blue-900 text-2xl font-bold leading-none">{metrics.activeJobs}</p>
          </div>

          {/* Pending Applicants */}
          <Link
            to="/employer/applicants"
            search={{ jobId: undefined }}
            className="flex flex-1 flex-col gap-1.5 rounded-xl p-4 bg-amber-50 border border-amber-100 transition-colors hover:bg-amber-100/60 active:scale-[0.98] cursor-pointer"
          >
            <Users className="w-5 h-5 text-amber-700" />
            <p className="text-amber-700 text-[11px] font-semibold uppercase tracking-wider">Ứng viên</p>
            <p className="text-amber-900 text-2xl font-bold leading-none">{metrics.pendingApps}</p>
          </Link>

          {/* Shifts Today */}
          <div className="flex flex-1 flex-col gap-1.5 rounded-xl p-4 bg-emerald-50 border border-emerald-100">
            <Clock className="w-5 h-5 text-emerald-700" />
            <p className="text-emerald-700 text-[11px] font-semibold uppercase tracking-wider">Ca làm</p>
            <p className="text-emerald-900 text-2xl font-bold leading-none">{metrics.shiftsToday}</p>
          </div>
        </div>
      )}

      {/* ── 3. Action Banner — Subtle notification ─── */}
      {metrics.pendingApps > 0 && (
        <div className="px-5 pb-5">
          <Link
            to="/employer/applicants"
            search={{ jobId: undefined }}
            className="flex items-center justify-between rounded-xl border border-sky-200/60 bg-sky-50/80 p-4 transition-colors hover:bg-sky-100/60 active:scale-[0.99] cursor-pointer group"
          >
            <div>
              <p className="text-slate-800 text-sm font-semibold">Cần phê duyệt</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Có {metrics.pendingApps} ứng viên mới đang chờ duyệt
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-white border border-sky-200/80 px-3 py-1.5 text-sky-700 text-sm font-semibold shadow-sm group-hover:bg-sky-50 transition-colors">
              Xem
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      )}

      {/* ── 4. Content — Empty state or Recent jobs ── */}
      <div className="px-5">
        {!hasJobs ? (
          /* Empty state */
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 mt-2">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg mb-2">Bắt đầu tuyển dụng</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              Đăng tin tuyển dụng đầu tiên để kết nối với hàng ngàn ứng viên tiềm năng.
            </p>
            <Link
              to="/employer/post-job"
              search={{} as any}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors hover:bg-slate-800 active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Tạo tin tuyển dụng đầu tiên
            </Link>
          </div>
        ) : (
          <RecentPostedJobs
            jobs={employerJobs}
            isLoading={jobsLoading}
            onViewAll={() => navigate({ to: '/employer/job-list' })}
          />
        )}
      </div>

      {hasJobs && (
        <button
          type="button"
          onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
          className="fixed bottom-24 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Tạo tin mới
        </button>
      )}
    </div>
  );
}
