import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search, SlidersHorizontal, MapPin, Eye, Users, MoreVertical, Briefcase, Plus, Share2, Edit2, ArchiveRestore, PowerOff } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchEmployerJobs, updateJob } from '@/features/jobs/services/jobService';
import { fetchEmployerApplications } from '@/features/jobs/services/applicationService';
import { toast } from 'sonner';

export const Route = createFileRoute('/employer/job-list')({
  component: JobManagementRoute,
});

type TabValue = 'active' | 'pending' | 'closed';

// --- Components ---

function JobCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[20px] bg-white p-5 shadow-sm border border-slate-100 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-2 w-2/3">
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
          <div className="h-6 w-full bg-slate-100 rounded-lg" />
        </div>
        <div className="h-6 w-24 bg-slate-100 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3 mb-5 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-100 rounded-full shrink-0" />
          <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded-full" />
            <div className="h-4 w-16 bg-slate-100 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded-full" />
            <div className="h-4 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-11 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-11 w-11 bg-slate-100 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center p-8 mt-4 text-center bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-50/50 rounded-full flex items-center justify-center mb-5 relative">
          <div className="absolute inset-0 border border-indigo-100 rounded-full animate-ping opacity-20" />
          <Briefcase className="w-10 h-10 text-indigo-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có tin đăng nào</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Hãy tạo tin đăng đầu tiên để bắt đầu tìm kiếm ứng viên tài năng.</p>
        <button
          onClick={() => navigate({ to: '/employer/post-job' })}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> Đăng tin ngay
        </button>
      </div>
    </div>
  );
}

// --- Main Route ---

function JobManagementRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('active');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const tabs = [
    { value: 'active', label: 'Đang mở' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'closed', label: 'Đã đóng' },
  ] as const;

  const { data: jobs = [], isLoading: isLoadingJobs, refetch } = useQuery({
    queryKey: ['employerJobs', user?.uid],
    queryFn: () => fetchEmployerJobs(user!.uid),
    enabled: !!user?.uid,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['employerApplications', user?.uid],
    queryFn: () => fetchEmployerApplications(user!.uid),
    enabled: !!user?.uid,
  });

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const status = job.status || 'OPEN';
      if (activeTab === 'active') return status === 'OPEN' || status === 'ACTIVE';
      if (activeTab === 'pending') return status === 'DRAFT';
      if (activeTab === 'closed') return status === 'CLOSED';
      return true;
    });

    filtered.sort((a, b) => {
      const getTimestamp = (job: typeof jobs[0]) => {
        if (job.createdAt) {
          const time = new Date(job.createdAt).getTime();
          return isNaN(time) ? 0 : time;
        }
        if (job.updatedAt) {
          const time = new Date(job.updatedAt).getTime();
          return isNaN(time) ? 0 : time;
        }
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });

    return filtered;
  }, [jobs, activeTab]);

  const getJobAppCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId || (app as any).job_id === jobId).length;
  };

  const handleShare = (jobId: string) => {
    setOpenMenuId(null);
    if (navigator.share) {
      navigator.share({
        title: 'Tuyển dụng',
        text: 'Xem tin tuyển dụng này trên JobNow',
        url: window.location.origin + '/jobs/' + jobId
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.origin + '/jobs/' + jobId);
      toast.success('Đã copy link tin đăng!');
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    setOpenMenuId(null);
    const newStatus = currentStatus === 'CLOSED' ? 'OPEN' : 'CLOSED';
    try {
      await updateJob(jobId, { status: newStatus as any });
      toast.success(newStatus === 'CLOSED' ? 'Đã đóng tin thành công' : 'Đã mở lại tin thành công');
      refetch();
    } catch (e) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleEdit = (jobId: string) => {
    setOpenMenuId(null);
    toast.info('Tính năng Sửa tin đang được phát triển');
  };

  const formatSalary = (salary?: string | number, type?: string) => {
    if (!salary) return 'Thỏa thuận';
    const formatted = typeof salary === 'number' ? salary.toLocaleString('vi-VN') : salary;
    return `${formatted}đ${type === 'HOURLY' ? '/h' : '/tháng'}`;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center bg-white/90 backdrop-blur-xl px-4 py-4 border-b border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="flex-1" />
        <h1 className="text-lg font-bold tracking-tight flex-1 flex justify-center text-slate-900">
          Quản lý tin đăng
        </h1>
        <div className="flex flex-1 items-center justify-end gap-2 text-slate-500">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition-all">
            <Search className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="sticky top-[60px] z-20 px-4 py-3 bg-[#F8FAFC]/90 backdrop-blur-md">
        <div className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-200/60 p-1 relative shadow-inner">
          {/* Active Tab Background Pill */}
          <div
            className="absolute h-10 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
            style={{
              width: 'calc(33.33% - 6px)',
              left: activeTab === 'active' ? '4px' : activeTab === 'pending' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 0px)'
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                relative z-10 flex h-full grow items-center justify-center rounded-xl px-2 text-[14px] font-bold transition-colors duration-200
                ${activeTab === tab.value
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <main className="flex flex-col gap-4 px-4 mt-2">
        {isLoadingJobs ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : filteredJobs.length === 0 ? (
          <EmptyState />
        ) : (
          filteredJobs.map((job, index) => {
            const appCount = getJobAppCount(job.id);
            const viewCount = (job as any).viewCount || 0;
            const status = job.status || 'OPEN';
            const isClosed = status === 'CLOSED';
            const isMenuOpen = openMenuId === job.id;

            return (
              <div
                key={job.id}
                className={`relative flex flex-col rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgb(0,0,0,0.03)] border transition-all duration-300
                  ${isClosed ? 'border-slate-100 opacity-80' : 'border-indigo-50/50 hover:border-indigo-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)]'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-col gap-2 flex-1 pr-8">
                    <span className={`inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide
                      ${isClosed ? 'bg-slate-100 text-slate-600' :
                        status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                      }`}>
                      {isClosed ? 'Đã đóng' : status === 'DRAFT' ? 'Chủ duyệt' : 'Đang mở'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug break-words">
                      {job.title}
                    </h3>
                  </div>
                </div>

                {/* Settings Menu Button - Absolute positioned to top right */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : job.id); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 active:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute top-10 right-0 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-30 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(job.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" /> Sửa tin
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleShare(job.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                        <Share2 className="w-4 h-4" /> Chia sẻ
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(job.id, status); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors
                          ${isClosed ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-rose-50 text-rose-600'}
                        `}
                      >
                        {isClosed ? <ArchiveRestore className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        {isClosed ? 'Mở lại tin' : 'Đóng tin'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Salary */}
                <div className="mb-4">
                  <p className={`text-[15px] font-bold ${isClosed ? 'text-slate-500' : 'text-emerald-600'}`}>
                    {formatSalary(job.salary, (job as any).salary_type || job.salaryType)}
                  </p>
                </div>

                {/* Metrics & Location */}
                <div className="flex flex-col gap-3 mb-5">
                  {job.location?.address && (
                    <div className="flex items-start gap-2 text-slate-500 text-[13px] font-medium leading-relaxed">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <span className="line-clamp-2">{job.location.address}</span>
                    </div>
                  )}

                  {/* Funnel Metrics Bar */}
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-around border border-slate-100">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Lượt xem</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{viewCount}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-indigo-500">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Ứng viên</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-700">{appCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate({ to: '/employer/applicants', search: { jobId: job.id } })}
                    className="flex-1 flex items-center justify-center h-12 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold hover:bg-indigo-100 active:scale-[0.98] transition-all"
                  >
                    Xem {appCount} ứng viên
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

