import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Briefcase, ChevronRight, Users, AlertCircle, Plus, TrendingUp, Wallet, ShieldCheck, ShieldAlert, CalendarClock, BarChart2 } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useGetEmployerJobs, useRealtimeEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { useRealtimeEmployerApplications } from '@/features/jobs/hooks/useManageApplicants';
import { RecentPostedJobs } from './-components/RecentPostedJobs';

export const Route = createFileRoute('/employer/')({ component: EmployerDashboard });


function EmployerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const employerId = userProfile?.uid;

  const { metrics, isLoading, isError, errorMessage } = useDashboardMetrics(employerId);
  useRealtimeEmployerJobs(employerId);
  const { data: employerJobs = [], isLoading: jobsLoading } = useGetEmployerJobs(employerId);
  const { data: allApplications = [] } = useRealtimeEmployerApplications(employerId);

  const companyName = userProfile?.company_name || userProfile?.full_name || 'Nhà tuyển dụng';
  const hasJobs = metrics.totalJobs > 0;

  const totalViews = employerJobs.reduce((acc, job) => acc + (Number((job as any).viewCount || (job as any).view_count || 0)), 0);
  const totalApps = allApplications.length;
  const totalHired = allApplications.filter(a => ['APPROVED', 'REVIEWED', 'CHECKED_IN', 'WORK_FINISHED', 'CASH_CONFIRMATION', 'COMPLETED'].includes(a.status)).length;
  
  const safeTotalViews = Math.max(1, totalViews);
  const appPercent = Math.min(100, (totalApps / safeTotalViews) * 100);
  const hirePercent = totalApps > 0 ? Math.min(100, (totalHired / totalApps) * 100) : 0;
  const overallHirePercent = Math.min(100, (totalHired / safeTotalViews) * 100);

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Chào buổi sáng' : currentHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  /* ── Loading skeleton ──────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans">
        <header className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] pt-14 pb-6 px-6 rounded-b-[2.5rem] shadow-md animate-pulse">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/20 rounded-md" />
              <div className="h-6 w-40 bg-white/20 rounded-md" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-white/10 rounded-2xl h-24" />
            <div className="flex-1 flex flex-col gap-3">
               <div className="flex-1 bg-white/10 rounded-2xl h-10" />
               <div className="flex-1 bg-white/10 rounded-2xl h-10" />
            </div>
          </div>
        </header>
        <div className="px-6 mt-6 space-y-4 animate-pulse">
          <div className="h-24 bg-white rounded-2xl" />
          <div className="h-40 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────── */
  if (isError) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FF] p-6 flex flex-col items-center justify-center font-sans text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 bg-rose-50 rounded-full p-2" />
        <p className="text-[#45464D] font-medium mb-1">Không thể tải dữ liệu</p>
        <p className="text-sm text-[#76777D]">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F5F7FF] pb-28 font-sans">
      
      {/* ── Candidate Style Sticky Header ── */}
      <header className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] pt-10 md:pt-14 pb-12 px-5 lg:rounded-b-[3rem] shadow-md relative z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-blue-200/80 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight truncate">
              {companyName} 👋
            </h1>
          </div>
          <div className="relative shrink-0">
            <Link 
              to="/employer/profile"
              className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              {userProfile?.avatar_url ? (
                 <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <span className="text-white font-bold text-lg">{companyName.charAt(0).toUpperCase()}</span>
              )}
            </Link>
            
            {/* Verified Badge */}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1e3a5f] flex items-center justify-center shadow-sm ${userProfile?.verification_status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {userProfile?.verification_status === 'VERIFIED' ? (
                <ShieldCheck className="w-3 h-3 text-white" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Cards in Header */}
        <div className="flex gap-3 mt-4">
          <Link to="/employer/wallet" className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3 shadow-sm relative overflow-hidden active:scale-95 transition-transform">
           <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
           <Wallet className="w-5 h-5 text-emerald-100 mb-2" />
           <div className="text-xl sm:text-2xl font-black text-white leading-tight">
             {(userProfile?.balance || 0).toLocaleString()}đ
           </div>
           <div className="text-[10px] font-bold text-emerald-100 uppercase mt-0.5 tracking-wider">Số dư ví</div>
          </Link>
          <div className="flex-1 flex flex-col gap-3">
             <Link to="/employer/job-list" className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-inner border border-white/5 active:scale-95 transition-transform flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                   <Briefcase className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{metrics.activeJobs}</div>
                  <div className="text-[10px] text-blue-200 font-medium tracking-wide mt-0.5">Tin đang tuyển</div>
                </div>
             </Link>
             <Link to="/employer/applicants" search={{ jobId: undefined }} className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-inner border border-white/5 active:scale-95 transition-transform flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                 <Users className="w-4 h-4 text-amber-300" />
               </div>
               <div>
                 <div className="flex items-center gap-1">
                   <div className="text-lg font-bold text-white leading-none">{metrics.pendingApps}</div>
                   {metrics.pendingApps > 0 && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>}
                 </div>
                 <div className="text-[10px] text-blue-200 font-medium tracking-wide mt-0.5">ƯV chờ duyệt</div>
               </div>
             </Link>
          </div>
        </div>
        </div>
      </header>

      <main className="pb-4 max-w-4xl mx-auto w-full">
        {/* Pending Applicants Alert */}
        {metrics.pendingApps > 0 && (
          <div className="px-6 mt-6">
            <Link to="/employer/applicants" search={{ jobId: undefined }} className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <CalendarClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px]">ƯV cần phê duyệt ngay</h3>
                  <p className="text-amber-100 text-[12px] font-medium leading-tight mt-0.5 truncate max-w-[200px]">Bạn có {metrics.pendingApps} ứng viên đang chờ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </Link>
          </div>
        )}

        {/* Quick Actions (Create Job, Manage) */}
        <section className="px-6 pt-6 pb-2 space-y-4">
           <div className="flex gap-4">
              <button
                onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
                className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-5 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] active:scale-95 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#006399]/10 flex items-center justify-center mb-3">
                   <Plus className="w-6 h-6 text-[#006399]" />
                </div>
                <span className="text-sm font-bold text-[#191C1E]">Đăng việc mới</span>
              </button>
              <Link
                to="/employer/job-list"
                className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-5 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] active:scale-95 transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-14 h-14 rounded-[1.25rem] bg-[#006399]/10 flex items-center justify-center mb-3">
                   <BarChart2 className="w-6 h-6 text-[#006399]" />
                </div>
                <span className="text-sm font-bold text-[#191C1E]">Quản lý tin</span>
              </Link>
           </div>
        </section>

        {/* Content: Empty or Recent Jobs */}
        <section className="px-5 space-y-4 mt-2 mb-6">
          {!hasJobs ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-[#F5F7FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Briefcase className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="font-bold text-[#1e3a5f] text-base mb-1.5">Bắt đầu tuyển dụng</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                Đăng tin tuyển dụng đầu tiên để dễ dàng kết nối với hàng ngàn ứng viên tiềm năng.
              </p>
              <button
                onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
                className="inline-flex items-center justify-center gap-2 bg-[#1e3a5f] text-white font-bold py-3.5 px-6 rounded-2xl transition-colors hover:bg-[#1e40af] w-full shadow-md active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Tạo tin tuyển dụng
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-black text-[#1e3a5f] text-[15px]">Tin đăng gần đây</h2>
                <Link
                  to="/employer/job-list"
                  className="text-[13px] font-bold text-indigo-600 flex items-center hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full"
                >
                  Xem tất cả <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <RecentPostedJobs
                jobs={employerJobs}
                isLoading={jobsLoading}
                onViewAll={() => navigate({ to: '/employer/job-list' })}
              />
            </div>
          )}

          {/* Analytics: Funnel */}
          {hasJobs && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mt-4">
              <div className="flex items-center justify-between mb-6 px-1">
                <div>
                  <h3 className="text-[15px] font-black text-[#1e3a5f]">Phễu tuyển dụng</h3>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Hiệu quả quy trình</p>
                </div>
                <div className="bg-indigo-50 p-2.5 rounded-2xl border border-indigo-100/50">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
              
              <div className="relative space-y-4">
                {/* Step 1: Views */}
                <div className="group">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#1e3a5f]/30" />
                      <span className="text-[13px] font-bold text-slate-600">Lượt xem tin</span>
                    </div>
                    <span className="text-[14px] font-black text-[#1e3a5f]">{totalViews.toLocaleString()}</span>
                  </div>
                  <div className="relative h-2.5 w-full bg-[#F5F7FF] rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#1e3a5f]/30 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${totalViews > 0 ? 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                {/* Step 2: Applications */}
                <div className="group">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[13px] font-bold text-slate-600">Lượt ứng tuyển</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[14px] font-black text-[#1e3a5f]">{totalApps.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {appPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full bg-[#F5F7FF] rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#006399] transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${Math.max(totalApps > 0 ? 15 : 0, Math.min(100, appPercent))}%` }}
                    />
                  </div>
                </div>
                
                {/* Step 3: Hired */}
                <div className="group">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[13px] font-bold text-slate-600">Đã tuyển</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[14px] font-black text-[#1e3a5f]">{totalHired.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          {hirePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2.5 w-full bg-[#F5F7FF] rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${Math.max(totalHired > 0 ? 15 : 0, Math.min(100, overallHirePercent))}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-3">
                <div className="shrink-0 mt-0.5 bg-white p-1.5 rounded-xl shadow-sm">
                  <AlertCircle className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] text-[#1e3a5f] font-black">Phân tích nhanh</p>
                  <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                    Tỷ lệ chuyển đổi từ <strong className="text-[#1e3a5f]">Xem</strong> sang <strong className="text-[#1e3a5f]">Ứng tuyển</strong> đang ở mức {appPercent.toFixed(1)}%. {appPercent < 10 ? 'Bạn nên tối ưu mô tả công việc hoặc mức lương để thu hút thêm ứng viên.' : 'Hiệu quả tuyển dụng đang tốt!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
