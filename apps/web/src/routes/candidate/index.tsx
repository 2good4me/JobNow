import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Search, Bell, MapPin,
  BadgeCheck, Star, Briefcase,
  ChevronRight, Clock, FileText,
  AlertCircle
} from 'lucide-react';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';

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
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: jobs = [], isLoading, isError } = useAllJobs();
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
        <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 relative hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      {/* ── 2. Search Section ── */}
      <div className="px-5 mt-4">
        <div
          className="flex items-center gap-3 bg-white px-4 py-3.5 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-indigo-200 transition-all group"
          onClick={() => navigate({ to: '/jobs' })}
        >
          <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span className="text-slate-400 font-medium text-[15px]">Tìm kiếm việc làm ngay...</span>
        </div>
      </div>

      {/* ── 3. Quick Stats (Mock for Candidate) ── */}
      <div className="flex gap-3 px-5 py-4">
        <Link
          to="/candidate/shifts"
          className="flex flex-1 flex-col gap-1.5 rounded-xl p-4 bg-indigo-50 border border-indigo-100 transition-colors hover:bg-indigo-100/60 active:scale-[0.98]"
        >
          <Clock className="w-5 h-5 text-indigo-700" />
          <p className="text-indigo-700 text-[11px] font-bold uppercase tracking-wider">Lịch làm</p>
          <p className="text-indigo-900 text-2xl font-extrabold leading-none">0</p>
        </Link>

        <div className="flex flex-1 flex-col gap-1.5 rounded-xl p-4 bg-emerald-50 border border-emerald-100">
          <FileText className="w-5 h-5 text-emerald-700" />
          <p className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Đã ứng tuyển</p>
          <p className="text-emerald-900 text-2xl font-extrabold leading-none">12</p>
        </div>
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
              <Link
                key={job.id}
                to="/candidate/jobs/$jobId"
                params={{ jobId: job.id }}
                className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-50 bg-slate-50">
                    <img
                      src={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.title}`}
                      alt={job.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[15px] text-slate-900 line-clamp-1 mb-0.5">{job.title}</h3>
                      {job.isPremium && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-600 font-bold text-sm">
                        {job.salary?.toLocaleString()}đ<span className="text-[10px] opacity-70 font-medium">/{job.salaryType === 'PER_SHIFT' ? 'ca' : 'tháng'}</span>
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        4.5
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
