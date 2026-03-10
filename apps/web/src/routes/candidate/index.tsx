import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Bell, Briefcase,
  ChevronRight, Clock, FileText,
  AlertCircle, Heart
} from 'lucide-react';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { JobCard } from '@/features/jobs/components/JobCard';

export const Route = createFileRoute('/candidate/')({
  component: CandidateDashboard,
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function CandidateDashboard() {
  const { userProfile } = useAuth();
  const { data: jobs = [], isLoading, isError } = useAllJobs();

  // Fetch real applications data
  const { data: applications = [] } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });

  const { data: wishlistJobs = [] } = useWishlistJobs(userProfile?.uid);

  const activeShiftsCount = applications.filter((app) => app.status === 'APPROVED' || app.status === 'CHECKED_IN').length;
  const totalAppliedCount = applications.length;
  const totalWishlistCount = wishlistJobs.length;

  const greeting = getGreeting();

  const displayName = userProfile?.full_name || 'Ứng viên';

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
          <div className="h-16 bg-white rounded-2xl border border-slate-100 shadow-sm" />
          <div className="flex gap-3">
            <div className="h-24 flex-1 bg-white rounded-xl border border-slate-100 shadow-sm" />
            <div className="h-24 flex-1 bg-white rounded-xl border border-slate-100 shadow-sm" />
          </div>
          <div className="space-y-3 pt-3">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────── */
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 max-w-sm mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-rose-400" />
          <p className="font-bold text-slate-800 text-lg mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-slate-500">Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* ── 1. Header ── */}
      <header className="bg-white px-5 pt-12 pb-5 flex items-center justify-between shadow-sm relative z-10">
        <div>
          <p className="text-slate-500 text-sm font-medium">{greeting},</p>
          <h1 className="text-indigo-950 text-xl font-bold tracking-tight mt-0.5 line-clamp-1">
            {displayName}
          </h1>
        </div>

      </header>

      {/* ── 3. Quick Stats ── */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4 mt-2">
        <Link
          to="/candidate/shifts"
          className="flex flex-col gap-1.5 rounded-xl p-3.5 bg-indigo-50 border border-indigo-100 transition-colors hover:bg-indigo-100/60 active:scale-[0.98]"
        >
          <Clock className="w-5 h-5 text-indigo-700" />
          <p className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider line-clamp-1">Lịch làm</p>
          <p className="text-indigo-900 text-xl font-extrabold leading-none">{activeShiftsCount}</p>
        </Link>

        <Link
          to="/candidate/applications"
          className="flex flex-col gap-1.5 rounded-xl p-3.5 bg-emerald-50 border border-emerald-100 transition-colors hover:bg-emerald-100/60 active:scale-[0.98]"
        >
          <FileText className="w-5 h-5 text-emerald-700" />
          <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider line-clamp-1">Ứng tuyển</p>
          <p className="text-emerald-900 text-xl font-extrabold leading-none">{totalAppliedCount}</p>
        </Link>

        <Link
          to="/candidate/wishlist"
          className="flex flex-col gap-1.5 rounded-xl p-3.5 bg-red-50 border border-red-100 transition-colors hover:bg-red-100/60 active:scale-[0.98]"
        >
          <Heart className="w-5 h-5 text-red-600" />
          <p className="text-red-700 text-[10px] font-bold uppercase tracking-wider line-clamp-1">Đã lưu</p>
          <p className="text-red-900 text-xl font-extrabold leading-none">{totalWishlistCount}</p>
        </Link>
      </div>

      {/* ── 4. Main Activity / Recommended Jobs ── */}
      <div className="px-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Việc làm gợi ý</h2>
          <Link to="/jobs" className="text-sm font-semibold text-indigo-600 flex items-center gap-0.5">
            Xem thêm
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm mt-2">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-50">
                <Briefcase className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Chưa có việc làm mới</h3>
              <p className="text-slate-500 text-sm">Hệ thống sẽ cập nhật việc làm mới sớm nhất cho bạn.</p>
            </div>
          ) : (
            jobs.slice(0, 10).map((job: any) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyName={job.employerName || 'Nhà tuyển dụng'}
                title={job.title}
                wage={job.salary ? `${job.salary.toLocaleString()}đ/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'tháng'}` : 'Thỏa thuận'}
                distance={job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc'}
                shift={job.employmentType === 'PART_TIME' ? 'Bán thời gian' : 'Toàn thời gian'}
                logoUrl={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.title}&backgroundColor=3b82f6`}
                hasVerifiedBadge={job.isPremium || false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
