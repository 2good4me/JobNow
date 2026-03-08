import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Bell, Briefcase, ChevronRight, Users, Clock, AlertCircle, Plus, Zap, Image as ImageIcon } from 'lucide-react';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useCandidateProfile } from '@/features/jobs/hooks/useCandidateProfile';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { RecentPostedJobs } from './-components/RecentPostedJobs';

function ActivityFeedItem({ app }: { app: any }) {
  const { data: candidateProfile } = useCandidateProfile(app.candidateId);

  const displayName = candidateProfile?.fullName || 'Ứng viên mới đăng ký';
  const avatarUrl = candidateProfile?.avatarUrl;

  const getRelativeTimeString = (dateStrOrObj: any) => {
    if (!dateStrOrObj) return '';
    let timestamp;
    if (typeof dateStrOrObj === 'object' && 'toDate' in dateStrOrObj) {
      timestamp = dateStrOrObj.toDate().getTime();
    } else {
      timestamp = new Date(dateStrOrObj).getTime();
    }

    const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
    const diffInMilliseconds = timestamp - Date.now();
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));

    if (diffInMinutes > -60) return rtf.format(diffInMinutes, 'minute');
    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours > -24) return rtf.format(diffInHours, 'hour');
    return rtf.format(Math.round(diffInHours / 24), 'day');
  };

  const timeAgo = getRelativeTimeString(app.createdAt || app.appliedAt);
  const statusColors: Record<string, string> = {
    'NEW': 'bg-blue-50 text-blue-700 border-blue-200',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
    'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'REJECTED': 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const statusLabels: Record<string, string> = {
    'NEW': 'Mới',
    'PENDING': 'Chờ duyệt',
    'APPROVED': 'Đã nhận',
    'REJECTED': 'Từ chối'
  };

  const statusClass = statusColors[app.status] || statusColors['NEW'];
  const statusLabel = statusLabels[app.status] || 'Mới';

  return (
    <div className="relative pl-6 pb-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200 last:before:hidden last:pb-0">
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:border-indigo-100 hover:shadow-md">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 font-bold uppercase">{displayName.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">
            {displayName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 truncate flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeAgo}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

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

  const { metrics, isLoading, isError, error, errorMessage } = useDashboardMetrics(employerId);
  const { data: employerJobs = [], isLoading: jobsLoading } = useGetEmployerJobs(employerId);
  const greeting = getGreeting();

  const companyName = userProfile?.company_name || userProfile?.full_name || 'Nhà tuyển dụng';
  const hasJobs = metrics.totalJobs > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="pt-12 pb-8 px-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-800 rounded-b-[40px] animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-white/20 rounded"></div>
              <div className="h-8 w-48 bg-white/20 rounded-lg"></div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20"></div>
          </div>
          <div className="mt-6 h-5 w-64 bg-white/20 rounded"></div>
        </div>
        <div className="px-5 mt-6 space-y-6 animate-pulse">
          <div className="flex gap-4 overflow-hidden">
            <div className="h-36 min-w-[160px] flex-1 bg-slate-200 rounded-3xl"></div>
            <div className="h-36 min-w-[160px] flex-1 bg-slate-200 rounded-3xl"></div>
          </div>
          <div className="h-28 bg-slate-200 rounded-3xl w-full"></div>
          <div className="space-y-4 pt-4">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Dashboard Data Load Error:', error);
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center text-rose-500">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-rose-100 max-w-sm mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <p className="font-bold text-lg text-slate-800 mb-2">Đã xảy ra lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-600 font-medium mb-1">{errorMessage}</p>
          <p className="text-xs text-slate-400">Vui lòng kiểm tra kết nối mạng hoặc báo cáo quản trị viên.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* 1. Premium Header Section */}
      <div className="relative pt-12 pb-14 px-5 bg-white shadow-[0_2px_20px_rgb(0,0,0,0.03)] border-b border-slate-100 rounded-b-[32px] overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-50"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1 tracking-wide">{greeting},</p>
            <h1 className="text-slate-900 text-2xl font-black font-heading tracking-tight line-clamp-1">
              {companyName} 👋
            </h1>
          </div>
          <Link to="/employer/notifications" className="relative p-2.5 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 transition-transform active:scale-95 hover:bg-slate-100 shadow-sm">
            <Bell className="w-5 h-5 text-slate-700" />
            {(metrics.pendingApps > 0 || metrics.recentAppsCount > 0) && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </Link>
        </div>

        {metrics.pendingApps > 0 ? (
          <div className="relative z-10 mt-5 inline-flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-sm">
              Bạn có {metrics.pendingApps} ứng viên đang chờ duyệt
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
          </div>
        ) : (
          <div className="relative z-10 mt-5">
            <span className="text-slate-500 font-medium text-sm">
              Hôm nay là một ngày tuyệt vời để tìm kiếm nhân tài.
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-8 mt-6">

        {/* 2. Quick Stats Row (Scrollable) */}
        {hasJobs && (
          <div className="px-5 w-full flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            {/* Card 1: Active Jobs */}
            <div className="snap-start shrink-0 w-44 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-5 shadow-lg shadow-blue-600/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-blue-100 font-medium text-sm mb-0.5">Tin đang hoạt động</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{metrics.activeJobs}</h3>
              </div>
            </div>

            {/* Card 2: New Applicants */}
            <Link to="/employer/applicants" search={{ jobId: undefined }} className="snap-start shrink-0 w-44 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-5 shadow-lg shadow-amber-500/20 flex flex-col justify-between relative overflow-hidden active:scale-[0.98] transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Users className="w-5 h-5 text-white" />
                </div>
                {metrics.recentAppsCount > 0 && (
                  <span className="flex items-center text-[10px] font-bold text-rose-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                    +{metrics.recentAppsCount} Gấp
                  </span>
                )}
              </div>
              <div className="relative z-10">
                <p className="text-amber-100 font-medium text-sm mb-0.5">Ứng viên chờ duyệt</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{metrics.pendingApps}</h3>
              </div>
            </Link>

            {/* Card 3: Shifts Today */}
            <div className="snap-start shrink-0 w-44 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-5 shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-emerald-100 font-medium text-sm mb-0.5">Ca làm hôm nay</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{metrics.shiftsToday}</h3>
              </div>
            </div>
          </div>
        )}

        {/* 3. Empty State or Recent Activity */}
        <div className="px-5">
          {!hasJobs ? (
            <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 mt-4 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative shadow-inner">
                  <div className="absolute inset-0 border-2 border-indigo-100 rounded-full animate-ping opacity-20"></div>
                  <ImageIcon className="w-12 h-12 text-indigo-300" />
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <h2 className="font-bold text-slate-800 text-xl mb-2 tracking-tight">Bắt đầu hành trình tuyển dụng</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">Đăng tin tuyển dụng đầu tiên của bạn để kết nối với hàng ngàn ứng viên tiềm năng trên nền tảng.</p>
                <Link to="/employer/post-job" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <Plus className="w-5 h-5" />
                  Tạo tin tuyển dụng đầu tiên
                </Link>
              </div>
            </div>
          ) : (
            <RecentPostedJobs 
              jobs={employerJobs} 
              isLoading={jobsLoading}
              onViewAll={() => {}}
            />
          )}
        </div>

      </div>

      {/* 4. Floating Quick Action Bar (Thumb Zone) */}
      <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 px-5 z-40 pointer-events-none flex justify-center">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.12)] rounded-[24px] p-2 flex items-center gap-2 pointer-events-auto max-w-sm w-full mx-auto">
          <Link to="/employer/post-job" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
            <Plus className="w-5 h-5" />
            Đăng tin mới
          </Link>
          <Link to="/employer/applicants" search={{ jobId: undefined }} className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-transform active:scale-95">
            <Zap className="w-5 h-5 text-amber-500" />
            Duyệt nhanh
          </Link>
        </div>
      </div>

      {/* Spacer to prevent content hiding behind fixed bar */}
      <div className="h-10"></div>
    </div>
  );
}

// Custom hide-scrollbar class should be added to global CSS, or inline:
// .hide-scrollbar::-webkit-scrollbar { display: none; }
// .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
