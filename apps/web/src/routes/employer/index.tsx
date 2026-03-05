import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Bell, Briefcase, ChevronRight, Users, Wallet, QrCode, TrendingUp, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';

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
  const employerId = userProfile?.uid;

  const { metrics, isLoading, isError } = useDashboardMetrics(employerId);
  const greeting = getGreeting();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 px-4 pt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-slate-200 rounded-3xl w-full"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
          </div>
          <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center text-rose-500">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <p className="font-medium">Đã xảy ra lỗi khi tải dữ liệu.</p>
          <p className="text-sm opacity-80">Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 1. Header Section - Glassmorphism & Gradient */}
      <div className="relative pt-12 pb-24 px-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900 rounded-b-[40px] overflow-hidden shadow-lg shadow-indigo-900/20">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 mix-blend-screen"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium mb-1 tracking-wide">{greeting},</p>
            <h1 className="text-white text-2xl font-bold font-heading tracking-tight drop-shadow-sm line-clamp-1">
              {userProfile?.company_name || userProfile?.full_name || 'Nhà tuyển dụng'}
            </h1>
          </div>
          <Link to="/employer/notifications" className="relative p-2.5 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md shrink-0 transition-transform active:scale-95 hover:bg-white/20">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
          </Link>
        </div>

        {metrics.shiftsToday > 0 && (
          <div className="relative z-10 mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-50 text-xs font-medium">Bạn có {metrics.shiftsToday} ca làm việc hôm nay</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="px-5 -mt-14 relative z-20 space-y-5">

        {/* 2. Key Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 mr-1" /> {metrics.conversionRate.toFixed(1)}% CR
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{metrics.activeJobs}</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Tin đang hoạt động</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              {metrics.recentAppsCount > 0 && (
                <span className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg animate-pulse">
                  {metrics.recentAppsCount} Gấp
                </span>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{metrics.pendingApps}</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Chờ duyệt</p>
            </div>
          </div>
        </div>

        {/* 3. Primary CTA: Post Job */}
        <Link to="/employer/post-job" className="block outline-none group">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/25 relative overflow-hidden transition-all duration-300 active:scale-[0.98] group-hover:shadow-xl group-hover:shadow-emerald-500/30">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl mb-1 tracking-tight">Tuyển thêm nhân sự?</h3>
                <p className="text-emerald-50 text-sm font-medium opacity-90">Tạo tin tuyển dụng chỉ trong 2 phút.</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold shadow-sm transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white text-white group-hover:text-emerald-600">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        {/* 4. Quick Actions Menus */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
          <h2 className="font-bold text-slate-800 text-lg mb-4 tracking-tight">Lối tắt vận hành</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/employer/wallet" className="flex flex-col items-center justify-center text-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shadow-sm border border-amber-100/50 group-hover:bg-amber-100 transition-colors">
                <Wallet className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">Ví thanh toán</span>
            </Link>
            <Link to="/employer/job-list" className="flex flex-col items-center justify-center text-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-sm border border-indigo-100/50 group-hover:bg-indigo-100 transition-colors">
                <Calendar className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">Quản lý tin</span>
            </Link>
            <Link to="/employer/shift-management" className="flex flex-col items-center justify-center text-center gap-2.5 p-3 rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center shadow-sm border border-cyan-100/50 group-hover:bg-cyan-100 transition-colors">
                <QrCode className="w-5 h-5 text-cyan-500" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600">Check-in QR</span>
            </Link>
          </div>
        </div>

        {/* 5. Activity Feed (Replacement for static jobs list) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-bold text-slate-800 text-lg tracking-tight">Hoạt động gần đây</h2>
            <Link to="/employer/applicants" search={{ jobId: undefined }} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.recentApplications.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-700 mb-1">Chưa có ứng viên mới</h3>
                <p className="text-slate-500 text-sm">Chia sẻ tin tuyển dụng hoặc mua gói đẩy tin để thu hút nhân sự.</p>
              </div>
            ) : (
              metrics.recentApplications.map((app, index) => (
                <div key={app.id || index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition-colors hover:border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                    {/* Placeholder for candidate avatar */}
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">
                      Ứng viên mới đăng ký
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Job ID: {app.jobId?.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">
                      Chờ duyệt
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


