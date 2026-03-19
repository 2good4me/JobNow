import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ChevronRight, Users, Clock, AlertCircle, Plus, FileText, BarChart2, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { RecentPostedJobs } from './-components/RecentPostedJobs';

export const Route = createFileRoute('/employer/')({ component: EmployerDashboard });

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Chào đêm khuya';
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
      <div className="min-h-screen bg-[#F5F7FF] pb-24">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-14 pb-10 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-white/20 rounded-full" />
              <div className="h-6 w-40 bg-white/20 rounded-lg" />
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-full" />
          </div>
        </div>
        <div className="px-5 -mt-5 space-y-4 animate-pulse">
          <div className="flex gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 flex-1 bg-slate-100 rounded-2xl" />)}
          </div>
          <div className="h-20 bg-slate-100 rounded-2xl" />
          {[1, 2].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────── */
  if (isError) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 max-w-sm mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-rose-400" />
          <p className="font-bold text-slate-800 text-lg mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-slate-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF] pb-28">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#3b82f6] px-5 pt-14 pb-10">
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-200 text-[13px] font-medium">{greeting},</p>
              <h1 className="text-white text-xl font-bold tracking-tight mt-0.5 line-clamp-1">{companyName}</h1>
            </div>
          </div>

          {/* Hero Stats - inside header */}
          {hasJobs && (
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 flex flex-col gap-2">
                <FileText className="w-4 h-4 text-blue-200" />
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Tin đăng</p>
                <p className="text-white text-2xl font-black leading-none">{metrics.activeJobs}</p>
              </div>
              <Link
                to="/employer/applicants"
                search={{ jobId: undefined }}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 flex flex-col gap-2 active:scale-95 transition-transform"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Ứng viên</p>
                <p className="text-white text-2xl font-black leading-none">{metrics.pendingApps}</p>
              </Link>
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 flex flex-col gap-2">
                <Clock className="w-4 h-4 text-emerald-300" />
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Ca hôm nay</p>
                <p className="text-white text-2xl font-black leading-none">{metrics.shiftsToday}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* ── Pending Applicants Alert ── */}
        {metrics.pendingApps > 0 && (
          <Link
            to="/employer/applicants"
            search={{ jobId: undefined }}
            className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-800 text-[14px] font-bold">Cần phê duyệt ngay</p>
                <p className="text-slate-500 text-[12px]">
                  {metrics.pendingApps} ứng viên đang chờ duyệt
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-xl">
              Xem <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
            className="flex items-center gap-3 bg-[#1e3a5f] rounded-2xl p-4 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-[13px]">Đăng tin mới</p>
              <p className="text-blue-200 text-[11px]">Tuyển dụng ngay</p>
            </div>
          </button>

          <Link
            to="/employer/job-list"
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="text-slate-800 font-bold text-[13px]">Quản lý tin</p>
              <p className="text-slate-400 text-[11px]">{metrics.totalJobs} tin đăng</p>
            </div>
          </Link>
        </div>

        {/* ── Content: Empty or Recent Jobs ── */}
        {!hasJobs ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
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
              className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] text-white font-bold py-3.5 px-6 rounded-xl transition-colors hover:bg-[#163159] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Tạo tin tuyển dụng đầu tiên
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-slate-900 text-[17px]">Tin đăng gần đây</h2>
              <Link
                to="/employer/job-list"
                className="text-[13px] font-bold text-indigo-600 flex items-center gap-0.5 bg-indigo-50 px-3 py-1.5 rounded-xl"
              >
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <RecentPostedJobs
              jobs={employerJobs}
              isLoading={jobsLoading}
              onViewAll={() => navigate({ to: '/employer/job-list' })}
            />
          </div>
        )}

        {/* ── Analytics Teaser ── */}
        {hasJobs && (
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5 shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-[14px]">Hiệu suất tuyển dụng</p>
                <p className="text-indigo-100 text-[12px]">Theo dõi tỉ lệ chuyển đổi ứng viên</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
