import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, BriefcaseBusiness, Search, Users, Share2, Sparkles } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { ApplicantCard } from '@/components/ui/ApplicantCard';
import { useGetApplicants, useGetEmployerApplications, useUpdateApplicationStatus } from '@/features/jobs/hooks/useManageApplicants';
import { useJobDetail } from '@/features/jobs/hooks/useEmployerJobs';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';

export const Route = createFileRoute('/employer/applicants')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      jobId: search.jobId as string | undefined,
    }
  },
  component: EmployerApplicantsRoute,
});

type ApplicantTab = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

/* ── Card Skeleton ── */
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-5 w-14 rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-0 border-t border-slate-50 pt-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-6 bg-slate-50" />)}
      </div>
    </div>
  );
}

function DelayedSkeleton({ delayMs = 500 }: { delayMs?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

/* ── Premium Empty State ── */
function EmptyApplicants({ isFiltered, onShare }: { isFiltered?: boolean; onShare: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-5 shadow-sm">
        <Users className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
        {isFiltered ? 'Không tìm thấy ứng viên' : 'Chưa có ai ứng tuyển'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[260px] mb-6">
        {isFiltered
          ? 'Thử đổi bộ lọc hoặc tìm kiếm khác để xem thêm ứng viên.'
          : 'Chia sẻ tin tuyển dụng để thu hút ứng viên tiềm năng nhé!'
        }
      </p>
      {!isFiltered && (
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Share2 className="h-4 w-4" /> Chia sẻ tin tuyển dụng
        </button>
      )}
    </div>
  );
}

/* ── Stats Pill ── */
function StatPill({ label, value, color, active, onClick }: {
  label: string; value: number; color: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2.5 text-center transition-all min-w-[72px] ${active
        ? `${color} shadow-sm border border-current/10`
        : 'bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
        }`}
    >
      <span className={`text-xl font-extrabold leading-none ${active ? '' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? '' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
    </button>
  );
}

/* ── Main Component ── */
function EmployerApplicantsRoute() {
  const { jobId } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const employerId = user?.uid;

  const [activeTab, setActiveTab] = useState<ApplicantTab>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchApproving, setIsBatchApproving] = useState(false);

  const { mutateAsync: updateStatus } = useUpdateApplicationStatus();
  const { data: jobApplicants = [], isLoading: isJobAppsLoading } = useGetApplicants(jobId || '', employerId);
  const { data: allApplications = [], isLoading: isAllAppsLoading } = useGetEmployerApplications(!jobId ? employerId : undefined);

  const applicants = jobId ? jobApplicants : allApplications;

  const { data: selectedJob } = useJobDetail(jobId);
  const pageTitle = selectedJob ? selectedJob.title : 'Tất cả ứng viên';

  // ── Optimization: Instant Empty State ──
  // If we know from the job document that there are 0 applicants, bypass the loading state.
  const isDefinitelyEmpty = jobId && selectedJob && (selectedJob as any).totalAppliedCount === 0;
  const isLoading = (jobId ? isJobAppsLoading : isAllAppsLoading) && !isDefinitelyEmpty;

  const stats = useMemo(() => {
    return applicants.reduce((acc, a) => {
      acc.all++;
      if (a.status === 'NEW' || a.status === 'PENDING') acc.pending++;
      else if (a.status === 'APPROVED' || a.status === 'REVIEWED' || a.status === 'CHECKED_IN') acc.approved++;
      else if (a.status === 'REJECTED') acc.rejected++;
      else if (a.status === 'COMPLETED' || a.status === 'WORK_FINISHED' || a.status === 'CASH_CONFIRMATION') acc.completed++;
      return acc;
    }, { all: 0, pending: 0, approved: 0, rejected: 0, completed: 0 });
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    let filtered = applicants;
    if (activeTab === 'pending') filtered = applicants.filter(a => a.status === 'NEW' || a.status === 'PENDING');
    else if (activeTab === 'approved') filtered = applicants.filter(a => a.status === 'APPROVED' || a.status === 'REVIEWED' || a.status === 'CHECKED_IN');
    else if (activeTab === 'rejected') filtered = applicants.filter(a => a.status === 'REJECTED');
    else if (activeTab === 'completed') filtered = applicants.filter(a => a.status === 'COMPLETED' || a.status === 'WORK_FINISHED' || a.status === 'CASH_CONFIRMATION');

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => (a.candidateName || a.candidateId || '').toLowerCase().includes(term));
    }
    return filtered;
  }, [activeTab, applicants, searchTerm]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pageTitle,
        text: `Ứng tuyển ngay: ${pageTitle}`,
        url: window.location.href,
      }).catch(() => { });
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredApplicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApplicants.map(a => a.id)));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setIsBatchApproving(true);
    let successCount = 0;
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          updateStatus({ id, status: 'APPROVED' })
            .then(() => successCount++)
            .catch(console.error)
        )
      );
      toast.success(`Đã duyệt thành công ${successCount} ứng viên!`);
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch (e) {
      toast.error('Có lỗi xảy ra khi duyệt hàng loạt');
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tên ứng viên', 'Trạng thái', 'Ca làm', 'Công việc', 'Ngày nộp'];
    const rows = filteredApplicants.map(a => [
      a.candidateName || 'N/A',
      a.status,
      a.shiftTime || 'N/A',
      selectedJob?.title || a.jobTitle || 'N/A',
      a.appliedAt ? new Date(a.appliedAt.toDate?.() || a.appliedAt).toLocaleDateString('vi-VN') : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ung-vien-${jobId || 'all'}-${new Date().getTime()}.csv`;
    link.click();
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto w-full relative shadow-sm">
      <div className="w-full">
=======
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 transition-colors duration-300">
      <div className="mx-auto w-full max-w-lg">
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b

        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] px-5 pt-12 pb-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-8 w-32 h-32 bg-cyan-400/15 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => navigate({ to: '/employer' })}
                className="rounded-full p-2 bg-white/10 text-white/80 hover:bg-white/20 transition-colors backdrop-blur-sm"
                type="button"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{pageTitle}</h1>
                <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-3 w-3" />
                  {stats.all} ứng viên tổng cộng
                </p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              <StatPill
                label="Tất cả"
                value={stats.all}
                color="bg-white text-slate-800"
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
              />
              <StatPill
                label="Mới"
                value={stats.pending}
                color="bg-blue-500 text-white"
                active={activeTab === 'pending'}
                onClick={() => setActiveTab('pending')}
              />
              <StatPill
                label="Đã duyệt"
                value={stats.approved}
                color="bg-emerald-500 text-white"
                active={activeTab === 'approved'}
                onClick={() => setActiveTab('approved')}
              />
              <StatPill
                label="Từ chối"
                value={stats.rejected}
                color="bg-rose-500 text-white"
                active={activeTab === 'rejected'}
                onClick={() => setActiveTab('rejected')}
              />
              <StatPill
                label="Hoàn thành"
                value={stats.completed}
                color="bg-sky-500 text-white"
                active={activeTab === 'completed'}
                onClick={() => setActiveTab('completed')}
              />
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="px-4 -mt-4 relative z-20">
          <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#1f2937] px-4 py-3 shadow-lg border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              className="w-full border-none bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              placeholder="Tìm theo tên ứng viên..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none">
                ×
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-3 px-1">
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedIds(new Set());
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelectMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              {isSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
            </button>
            
            <button
              onClick={handleExportCSV}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
            >
              Xuất CSV
            </button>
          </div>
        </div>

        {/* ── Applicant List ── */}
        <div className="px-4 pt-5 space-y-3">
          {isLoading ? (
            <DelayedSkeleton delayMs={500} />
          ) : filteredApplicants.length === 0 ? (
            <EmptyApplicants
              isFiltered={searchTerm.length > 0 || (activeTab !== 'all' && stats.all > 0)}
              onShare={handleShare}
            />
          ) : (
            <>
              {/* Funnel hint */}
<<<<<<< HEAD
              {activeTab === 'pending' && stats.pending > 0 && !isSelectMode && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 font-medium mb-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
=======
              {activeTab === 'pending' && stats.pending > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 px-3 py-2 text-xs text-blue-700 dark:text-blue-400 font-medium">
                  <Sparkles className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b
                  {stats.pending} ứng viên đang chờ bạn duyệt. Bấm <strong>Duyệt</strong> để nhận ngay!
                </div>
              )}

              {isSelectMode && (
                <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3 rounded-xl mb-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredApplicants.length}
                      onChange={handleSelectAll}
                    />
                    <span className="text-sm font-bold text-indigo-800">Chọn tất cả ({selectedIds.size})</span>
                  </div>
                  {activeTab === 'pending' && selectedIds.size > 0 && (
                    <button
                      onClick={handleBatchApprove}
                      disabled={isBatchApproving}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isBatchApproving ? 'Đang duyệt...' : `Duyệt (${selectedIds.size})`}
                    </button>
                  )}
                </div>
              )}

              {filteredApplicants.map((applicant) => (
                <div key={applicant.id} className="relative">
                  {isSelectMode && (
                    <div 
                      className="absolute inset-0 z-20 cursor-pointer rounded-2xl bg-slate-900/5 hover:bg-slate-900/10 transition-colors flex items-start justify-end p-4 border border-transparent"
                      onClick={(e) => { e.preventDefault(); handleToggleSelect(applicant.id); }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(applicant.id)}
                        readOnly
                        className="w-5 h-5 rounded border-slate-300 shadow-sm text-indigo-600 focus:ring-indigo-500"
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                  )}
                  <div className={selectedIds.has(applicant.id) ? 'ring-2 ring-indigo-500 rounded-2xl scale-[0.98] transition-transform' : 'transition-transform'}>
                    <ApplicantCard
                      applicationId={applicant.id}
                      candidateId={applicant.candidateId}
                      status={applicant.status}
                      jobTitle={selectedJob?.title || applicant.jobTitle}
                      shiftTime={applicant.shiftTime}
                      candidateName={applicant.candidateName}
                      candidateAvatar={applicant.candidateAvatar}
                      candidateSkills={applicant.candidateSkills}
                      candidateRating={applicant.candidateRating}
                      candidateVerified={applicant.candidateVerified}
                      checkInTime={applicant.checkInTime}
                      checkOutTime={(applicant as any).checkOutTime}
                      isLate={applicant.isLate}
                    />
                  </div>
                </div>
              ))}

              <p className="text-center text-[11px] text-slate-400 py-4 font-medium">
                Hiển thị {filteredApplicants.length} / {stats.all} ứng viên
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
