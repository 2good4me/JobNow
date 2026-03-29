import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ChevronRight, Users, Clock, AlertCircle, Plus, FileText, BarChart2, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useGetEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';
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
  const { data: allApplications = [] } = useGetEmployerApplications(employerId);
  const greeting = getGreeting();

  const companyName = userProfile?.company_name || userProfile?.full_name || 'Nhà tuyển dụng';
  const hasJobs = metrics.totalJobs > 0;

  const totalViews = employerJobs.reduce((acc, job) => acc + ((job as any).viewCount || (job as any).view_count || 0), 0);
  const totalApps = allApplications.length;
  const totalHired = allApplications.filter(a => ['APPROVED', 'REVIEWED', 'CHECKED_IN', 'WORK_FINISHED', 'CASH_CONFIRMATION', 'COMPLETED'].includes(a.status)).length;
  
  const appPercent = totalViews > 0 ? Math.min(100, (totalApps / totalViews) * 100) : 0;
  const hirePercent = totalApps > 0 ? Math.min(100, (totalHired / totalApps) * 100) : 0;
  const overallHirePercent = totalViews > 0 ? Math.min(100, (totalHired / totalViews) * 100) : 0;

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

        {/* ── Analytics Dashboard ── */}
        {/* ── Analytics: Funnel ── */}
        {hasJobs && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight">Phễu tuyển dụng</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hiệu quả quy trình</p>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            
            <div className="relative space-y-2">
              {/* Step 1: Views */}
              <div className="group">
                <div className="flex justify-between items-center mb-1.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[13px] font-bold text-slate-600">Lượt xem tin</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{totalViews.toLocaleString()}</span>
                </div>
                <div className="relative h-14 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/50">
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${totalViews > 0 ? 100 : 0}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Khởi đầu</span>
                  </div>
                </div>
              </div>

              {/* Arrow Down 1 */}
              <div className="flex justify-center -my-1 relative z-10">
                <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                  <ChevronRight className="w-4 h-4 text-slate-300 rotate-90" />
                </div>
              </div>
              
              {/* Step 2: Applications */}
              <div className="group">
                <div className="flex justify-between items-center mb-1.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[13px] font-bold text-slate-600">Lượt ứng tuyển</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{totalApps.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-indigo-500 ml-1.5 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {appPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-14 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/50">
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(totalApps > 0 ? 15 : 0, Math.min(100, appPercent))}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Tiềm năng</span>
                  </div>
                </div>
              </div>

              {/* Arrow Down 2 */}
              <div className="flex justify-center -my-1 relative z-10">
                <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                  <ChevronRight className="w-4 h-4 text-slate-300 rotate-90" />
                </div>
              </div>
              
              {/* Step 3: Hired */}
              <div className="group">
                <div className="flex justify-between items-center mb-1.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[13px] font-bold text-slate-600">Đã tuyển</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{totalHired.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-emerald-500 ml-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {hirePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-14 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/50">
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(totalHired > 0 ? 15 : 0, Math.min(100, overallHirePercent))}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Thành công</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
              <div className="shrink-0 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] text-slate-800 font-bold">Phân tích chuyên sâu</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Tỷ lệ chuyển đổi từ <strong>Xem</strong> sang <strong>Ứng tuyển</strong> đang ở mức {appPercent.toFixed(1)}%. {appPercent < 10 ? 'Khuyến nghị: tối ưu mô tả công việc và mức lương để tăng thêm lượng hồ sơ ấn tượng.' : 'Đây là tỷ lệ khá tốt, tiếp tục phát huy các mẫu CV/JD này nhé!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
