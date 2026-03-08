import { useNavigate } from '@tanstack/react-router';
import { ChevronRight, Briefcase, Clock } from 'lucide-react';
import { Job } from '@jobnow/types';
import { getRelativeTimeString } from '@/utils/formatTime';

interface RecentPostedJobsProps {
  jobs: Job[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function RecentPostedJobs({ jobs, isLoading, onViewAll }: RecentPostedJobsProps) {
  const navigate = useNavigate();

  // Sort by createdAt descending (newest first), with fallback to updatedAt
  const sortedJobs = [...jobs].sort((a, b) => {
    const getTimestamp = (job: Job) => {
      // Try createdAt first
      if (job.createdAt) {
        const time = new Date(job.createdAt).getTime();
        if (!isNaN(time)) return time;
      }
      // Fall back to updatedAt
      if (job.updatedAt) {
        const time = new Date(job.updatedAt).getTime();
        if (!isNaN(time)) return time;
      }
      // No valid timestamp, use 0 (will sort to end)
      return 0;
    };

    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);
    return timeB - timeA; // Newest first
  });

  // Show only the latest 3-5 jobs
  const displayedJobs = sortedJobs.slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-b-0">
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayedJobs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6 text-slate-300" />
          </div>
          <p className="font-semibold text-slate-700 mb-1">Chưa có hoạt động mới</p>
          <p className="text-slate-500 text-xs text-balance">Hãy đăng tin tuyển dụng để bắt đầu tuyển dụng.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-slate-900 text-lg tracking-tight">Hoạt động gần đây</h2>
        {displayedJobs.length > 0 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center"
          >
            Xem tất cả <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {displayedJobs.map((job) => {
            const timeAgo = getRelativeTimeString(job.createdAt);
            return (
              <button
                key={job.id}
                onClick={() => navigate({ to: '/employer/job-detail', search: { jobId: job.id } as any })}
                className="w-full flex items-center gap-4 p-5 transition-all hover:bg-slate-50 active:bg-slate-100 group text-left"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    Đăng {timeAgo}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
