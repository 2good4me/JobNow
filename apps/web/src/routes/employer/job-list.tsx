import { createFileRoute } from '@tanstack/react-router';
import { Search, SlidersHorizontal, MapPin, Eye, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchEmployerJobs } from '@/features/jobs/services/jobService';
import { fetchEmployerApplications } from '@/features/jobs/services/applicationService';

export const Route = createFileRoute('/employer/job-list')({
  component: JobManagementRoute,
});

type TabValue = 'active' | 'pending' | 'closed';

function JobManagementRoute() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>('active');

  const tabs = [
    { value: 'active', label: 'Đang mở' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'closed', label: 'Đã đóng' },
  ] as const;

  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
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
    return jobs.filter(job => {
      const status = job.status || 'OPEN';
      if (activeTab === 'active') return status === 'OPEN' || status === 'ACTIVE';
      if (activeTab === 'pending') return status === 'DRAFT';
      if (activeTab === 'closed') return status === 'CLOSED';
      return true;
    });
  }, [jobs, activeTab]);

  const getJobAppCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId || (app as any).job_id === jobId).length;
  };

  const handleCloseJob = (jobId: string) => {
    // TODO: Connect to close job service
    alert(`Đang phát triển: Đóng tin ${jobId}`);
  };

  const formatSalary = (salary?: string | number, type?: string) => {
    if (!salary) return 'Thỏa thuận';
    const formatted = typeof salary === 'number' ? salary.toLocaleString('vi-VN') : salary;
    return `${formatted}đ${type === 'HOURLY' ? '/h' : '/tháng'}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center bg-white/80 backdrop-blur-md px-4 py-4 border-b border-slate-200 shadow-sm">
        <div className="flex-1" />
        <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 flex justify-center text-slate-900">
          Quản lý tin đăng
        </h1>
        <div className="flex flex-1 items-center justify-end gap-3 text-slate-500">
          <button className="flex items-center justify-center hover:text-primary-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center hover:text-primary-600 transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="px-4 py-4 sticky top-[60px] z-10 bg-slate-50/90 backdrop-blur-sm">
        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-200/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex h-full grow items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all duration-200
                ${activeTab === tab.value
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <main className="flex flex-col gap-4 px-4 overflow-x-hidden">
        {isLoadingJobs ? (
          <div className="flex justify-center p-8 text-slate-400">Đang tải...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-500 font-medium">Không có tin đăng nào</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => {
            const appCount = getJobAppCount(job.id);
            return (
              <div key={job.id} className="flex flex-col rounded-xl bg-white p-4 shadow-sm border border-slate-100 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1.5 pr-2">
                    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${activeTab === 'active' ? 'bg-emerald-100/80 text-emerald-700' :
                      activeTab === 'pending' ? 'bg-amber-100/80 text-amber-700' :
                        'bg-slate-100/80 text-slate-700'
                      }`}>
                      {activeTab === 'active' ? 'Đang mở' : activeTab === 'pending' ? 'Chờ duyệt' : 'Đã đóng'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {job.title}
                    </h3>
                  </div>
                  <p className="text-emerald-600 text-sm font-bold shrink-0 whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-md">
                    {formatSalary(job.salary, (job as any).salary_type || job.salaryType)}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 mb-5 mt-1">
                  {job.location?.address && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{job.location.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-5 text-slate-500 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{(job as any).viewCount || 0} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{appCount} ứng viên</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center h-10 rounded-lg bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors">
                    Xem ứng viên
                  </button>
                  {activeTab !== 'closed' && (
                    <button
                      onClick={() => handleCloseJob(job.id)}
                      className="flex-1 flex items-center justify-center h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                      Đóng tin
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
