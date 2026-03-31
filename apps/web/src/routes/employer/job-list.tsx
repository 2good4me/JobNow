import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Search, MapPin, Eye, Users, MoreVertical, Briefcase, Plus, Share2, Edit2, ArchiveRestore, PowerOff, Flame, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchEmployerJobs, updateJob, getBoostPackages } from '@/features/jobs/services/jobService';
import { fetchEmployerApplications } from '@/features/jobs/services/applicationService';
import { toast } from 'sonner';
import { useCloseJobSafely, usePurchaseBoostPackage } from '@/features/jobs/hooks/useEmployerJobs';
import type { BoostPackage, Job } from '@jobnow/types';

export const Route = createFileRoute('/employer/job-list')({
  component: JobManagementRoute,
});

type TabValue = 'active' | 'pending' | 'closed';

function BoostPackageModal({
  job,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  job: Job;
  onClose: () => void;
  onConfirm: (packageCode: BoostPackage['code']) => void;
  isSubmitting: boolean;
}) {
  const packages = getBoostPackages();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Boost / VIP</p>
            <h3 className="text-lg font-bold text-slate-900">Chọn gói đẩy tin</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Tin <span className="font-semibold text-slate-800">{job.title}</span> sẽ được ưu tiên hiển thị trên danh sách việc làm.
        </p>

        <div className="space-y-3">
          {packages.map((pack) => (
            <button
              key={pack.code}
              type="button"
              disabled={isSubmitting}
              onClick={() => onConfirm(pack.code)}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-amber-300 hover:bg-amber-50/60 transition-colors disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900">{pack.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{pack.description}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                  {pack.price.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CloseJobModal({
  title,
  affectedCandidates,
  latePenaltyPossible,
  onCancel,
  onConfirm,
}: {
  title: string;
  affectedCandidates: number;
  latePenaltyPossible: boolean;
  onCancel: () => void;
  onConfirm: (notifyCandidates: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Đóng tin an toàn</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm text-slate-600">
          Bạn có <span className="font-bold">{affectedCandidates}</span> ứng viên đã duyệt. Đóng tin sẽ hủy các ca liên quan.
        </p>
        {latePenaltyPossible && (
          <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            Đang có ca sát giờ. Thao tác này có thể làm giảm điểm uy tín.
          </p>
        )}
        <div className="mt-5 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => onConfirm(true)}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
          >
            Đóng tin và gửi thông báo hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Đóng tin, không gửi thông báo
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Components ---

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-pulse mb-3">
      <div className="h-8 bg-slate-200 w-full" />
      <div className="p-4">
        <div className="h-5 w-3/4 bg-slate-200 rounded-full mb-3" />
        <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ activeTab }: { activeTab: TabValue }) {
  const navigate = useNavigate();
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm mt-2">
      <div className="w-16 h-16 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có tin đăng nào</h2>
      <p className="text-sm text-slate-500 mb-6 font-medium">
          {activeTab === 'active' ? 'Bạn chưa có tin đăng nào đang mở.' : 'Không có tin đăng ở trạng thái này.'}
      </p>
      <button
        onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
        className="bg-[#1e3a5f] text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 mx-auto"
      >
        <Plus className="w-4 h-4" /> Đăng tin ngay
      </button>
    </div>
  );
}

// --- Main Route ---

function JobManagementRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('active');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [boostTargetJob, setBoostTargetJob] = useState<Job | null>(null);
  const [closeModal, setCloseModal] = useState<{ jobId: string; title: string; affectedCandidates: number; latePenaltyPossible: boolean } | null>(null);
  const { mutateAsync: buyBoostPackage, isPending: isBoosting } = usePurchaseBoostPackage();
  const { mutateAsync: closeJobWithGuard } = useCloseJobSafely();

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
      const moderationStatus = job.moderationStatus || 'APPROVED';
      if (activeTab === 'active') return (status === 'OPEN' || status === 'ACTIVE' || status === 'FULL') && moderationStatus === 'APPROVED';
      if (activeTab === 'pending') return moderationStatus === 'PENDING_REVIEW' || moderationStatus === 'REJECTED' || status === 'DRAFT';
      if (activeTab === 'closed') return status === 'CLOSED';
      return true;
    });

    filtered.sort((a, b) => {
      if (a.isBoosted !== b.isBoosted) {
        return (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0);
      }
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

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => job.title.toLowerCase().includes(term));
    }

    return filtered;
  }, [jobs, activeTab, searchTerm]);

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
    if (currentStatus === 'CLOSED') {
      try {
        await updateJob(jobId, { status: 'OPEN' as any });
        toast.success('Đã mở lại tin thành công');
        refetch();
      } catch (e) {
        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
      }
      return;
    }

    try {
      const result = await closeJobWithGuard({ jobId, confirmed: false, notifyCandidates: true });
      if (result.requiresConfirmation) {
        const targetJob = jobs.find((item) => item.id === jobId);
        setCloseModal({
          jobId,
          title: targetJob?.title || 'Tin tuyển dụng',
          affectedCandidates: result.affectedCandidates,
          latePenaltyPossible: result.latePenaltyPossible,
        });
        return;
      }
      toast.success('Đã đóng tin thành công');
      refetch();
    } catch (e) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleEdit = (jobId: string) => {
    setOpenMenuId(null);
    navigate({ to: '/employer/post-job', search: { editJobId: jobId } });
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

  const confirmCloseJob = async (notifyCandidates: boolean) => {
    if (!closeModal) return;
    try {
      await closeJobWithGuard({
        jobId: closeModal.jobId,
        confirmed: true,
        notifyCandidates,
      });
      toast.success('Đã đóng tin thành công');
      setCloseModal(null);
      refetch();
    } catch (error) {
      toast.error('Không thể đóng tin tuyển dụng.');
    }
  };

  const handleBoost = async (packageCode: BoostPackage['code']) => {
    if (!boostTargetJob) return;
    try {
      const result = await buyBoostPackage({ jobId: boostTargetJob.id, packageCode });
      toast.success(`Đẩy top thành công đến ${new Date(result.expiresAt).toLocaleString('vi-VN')}`);
      setBoostTargetJob(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể mua gói đẩy tin.');
    }
  };

  const getStatusTheme = (job: any) => {
    const isClosed = job.status === 'CLOSED';
    const moderationStatus = job.moderationStatus || 'APPROVED';
    if (isClosed) return { bg: 'bg-slate-500', text: 'text-white', label: 'Đã đóng' };
    if (moderationStatus === 'REJECTED') return { bg: 'bg-rose-500', text: 'text-white', label: 'Bị từ chối' };
    if (moderationStatus === 'PENDING_REVIEW' || job.status === 'DRAFT') return { bg: 'bg-amber-400', text: 'text-white', label: 'Chờ duyệt' };
    return { bg: 'bg-emerald-500', text: 'text-white', label: 'Đang mở' };
  };

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-10 md:pt-14 pb-8 lg:rounded-b-[3rem] shadow-md relative z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
          <h1 className="text-white text-lg font-bold flex-1">Quản lý tin đăng</h1>
          <div className="bg-white/20 text-white text-[12px] font-bold px-2.5 py-1.5 rounded-xl shrink-0">
            {filteredJobs.length} tin
          </div>
        </div>

        {/* Search bar inside header */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên công việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-[14px] placeholder:text-white/50 flex-1 outline-none"
          />
        </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto w-full flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2 flex-shrink-0 ${
              activeTab === tab.value
                ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 max-w-4xl mx-auto w-full space-y-4">
        {isLoadingJobs ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : filteredJobs.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          filteredJobs.map((job) => {
            const appCount = getJobAppCount(job.id);
            const viewCount = (job as any).viewCount || 0;
            const theme = getStatusTheme(job);
            const isMenuOpen = openMenuId === job.id;
            const moderationStatus = job.moderationStatus || 'APPROVED';
            const status = job.status || 'OPEN';
            const isClosed = status === 'CLOSED';

            return (
              <div
                key={job.id}
                onClick={() => navigate({ to: '/employer/job-detail', search: { jobId: job.id } })}
                className="block bg-white border border-slate-100 rounded-2xl overflow-visible shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Status stripe on top */}
                <div className={`${theme.bg} rounded-t-2xl px-4 py-2.5 flex items-center justify-between`}>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${theme.text}`}>
                    {theme.label}
                  </span>
                  {job.isBoosted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      <Flame className="w-3 h-3 text-amber-300" /> Được đẩy top
                    </span>
                  )}
                </div>

                <div className="p-4 relative">
                  {/* Settings Menu Button */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : job.id); }}
                      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 active:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute top-10 right-0 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-30 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(job.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-4 h-4" /> Sửa tin
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigate({ to: '/employer/post-job', search: { duplicateJobId: job.id } as any }); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                          <Plus className="w-4 h-4" /> Nhân bản tin
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(job.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                          <Share2 className="w-4 h-4" /> Chia sẻ
                        </button>
                        {moderationStatus === 'APPROVED' && !isClosed && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setBoostTargetJob(job); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                          >
                            <Flame className="w-4 h-4" /> Đẩy top
                          </button>
                        )}
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

                  <h3 className="font-bold text-slate-900 text-[15px] mb-1.5 pr-8 leading-snug">
                    {job.title}
                  </h3>
                  
                  <p className="font-bold text-[#006399] text-[15px] mb-3">
                    {formatSalary(job.salary, (job as any).salary_type || job.salaryType)}
                  </p>

                  {job.location?.address && (
                    <div className="flex items-start gap-1.5 text-slate-500 text-[12px] font-medium leading-relaxed mb-3">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{job.location.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2 py-1 rounded-lg">
                      <Eye className="w-3 h-3" />
                      <span>{viewCount} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                      <Users className="w-3 h-3" />
                      <span>{appCount} ứng viên</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: '/employer/applicants', search: { jobId: job.id } }); }}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#1e3a5f]/10 bg-[#1e3a5f]/5 text-[#1e3a5f] text-[13px] font-bold active:scale-[0.98] transition-colors"
                  >
                    Xem danh sách ứng viên
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {jobs.length > 0 && (
        <button
          onClick={() => navigate({ to: '/employer/post-job', search: {} as any })}
          className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center shadow-lg shadow-[#1e3a5f]/30 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      {boostTargetJob && (
        <BoostPackageModal
          job={boostTargetJob}
          onClose={() => setBoostTargetJob(null)}
          onConfirm={handleBoost}
          isSubmitting={isBoosting}
        />
      )}

      {closeModal && (
        <CloseJobModal
          title={closeModal.title}
          affectedCandidates={closeModal.affectedCandidates}
          latePenaltyPossible={closeModal.latePenaltyPossible}
          onCancel={() => setCloseModal(null)}
          onConfirm={confirmCloseJob}
        />
      )}
    </div>
  );
}
