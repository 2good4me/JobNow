import { useNavigate } from '@tanstack/react-router';
import { ChevronRight, Briefcase, Clock, Users } from 'lucide-react';
import { Job } from '@jobnow/types';
import { getRelativeTimeString } from '@/utils/formatTime';

interface RecentPostedJobsProps {
  jobs: Job[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', label: 'Đang tuyển' },
  CLOSED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', label: 'Đã đóng' },
  DRAFT: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', label: 'Bản nháp' },
  EXPIRED: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600', label: 'Hết hạn' },
};

export function RecentPostedJobs({ jobs, isLoading, onViewAll }: RecentPostedJobsProps) {
  const navigate = useNavigate();

  const sortedJobs = [...jobs].sort((a, b) => {
    const getTs = (job: Job) => {
      const raw = job.createdAt ?? job.updatedAt;
      if (!raw) return 0;
      if (typeof raw === 'object' && 'toDate' in raw) return (raw as any).toDate().getTime();
      const t = new Date(raw as string).getTime();
      return isNaN(t) ? 0 : t;
    };
    return getTs(b) - getTs(a);
  });

  const displayedJobs = sortedJobs.slice(0, 5);

  /* ── Loading ──────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="space-y-0 divide-y divide-slate-100 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty ────────────────────────────────────── */
  if (displayedJobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
          <Briefcase className="w-5 h-5 text-slate-300" />
        </div>
        <p className="font-semibold text-slate-700 text-sm mb-1">Chưa có hoạt động</p>
        <p className="text-slate-500 text-xs">Đăng tin tuyển dụng để bắt đầu.</p>
      </div>
    );
  }

  /* ── Job list ─────────────────────────────────── */
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-900 text-base">Tin tuyển dụng gần đây</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-sky-700 hover:text-sky-800 transition-colors flex items-center gap-0.5"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {displayedJobs.map((job) => {
            const timeAgo = getRelativeTimeString(job.createdAt);
            const statusKey = (job.status || 'ACTIVE').toUpperCase();
            const style = STATUS_STYLES[statusKey] || STATUS_STYLES['ACTIVE'];

            return (
              <button
                key={job.id}
                onClick={() => navigate({ to: '/employer/job-detail', search: { jobId: job.id } as any })}
                className="w-full flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50 active:bg-slate-100 text-left group cursor-pointer"
              >
                {/* Top row: title + badge */}
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-sky-700 transition-colors">
                    {job.title}
                  </h3>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                {/* Bottom row: meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo}
                    </span>
                    {typeof (job as any).applicantCount === 'number' && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {(job as any).applicantCount} ứng viên
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
