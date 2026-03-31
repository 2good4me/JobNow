import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, BriefcaseBusiness, Search, Users, Share2, Sparkles, Download } from 'lucide-react';
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
    <div className="animate-pulse bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-8 rounded-lg bg-slate-50" />)}
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
    <div className="space-y-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

/* ── Premium Empty State ── */
function EmptyApplicants({ isFiltered, onShare }: { isFiltered?: boolean; onShare: () => void }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm mt-2">
      <div className="w-16 h-16 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {isFiltered ? 'Không tìm thấy ứng viên' : 'Chưa có ai ứng tuyển'}
      </h3>
      <p className="text-sm text-slate-500 mb-6 font-medium max-w-xs mx-auto">
        {isFiltered
          ? 'Thử đổi bộ lọc hoặc từ khóa để xem thêm ứng viên.'
          : 'Chia sẻ ngay tin đăng này để thu hút ứng viên tiềm năng nhé!'}
      </p>
      {!isFiltered && (
        <button
          type="button"
          onClick={onShare}
          className="bg-[#1e3a5f] text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 mx-auto"
        >
          <Share2 className="w-4 h-4" /> Chia sẻ tin tuyển dụng
        </button>
      )}
    </div>
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

  const filters: { label: string; value: ApplicantTab; count: number }[] = [
    { label: 'Tất cả', value: 'all', count: stats.all },
    { label: 'Chờ duyệt', value: 'pending', count: stats.pending },
    { label: 'Đã nhận', value: 'approved', count: stats.approved },
    { label: 'Từ chối', value: 'rejected', count: stats.rejected },
    { label: 'Xong', value: 'completed', count: stats.completed },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FF] pb-24 font-sans text-slate-800">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1e40af] px-5 pt-10 md:pt-14 pb-8 lg:rounded-b-[3rem] shadow-md relative z-10 transition-all">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: '/employer' })}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg font-bold truncate">{pageTitle}</h1>
            <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1.5 font-medium">
              <BriefcaseBusiness className="h-3 w-3" />
              Tổng cộng {stats.all} ứng viên
            </p>
          </div>
          {/* Action Header Menu */}
          <button 
            onClick={handleExportCSV}
            className="bg-white/10 p-2.5 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 mb-2">
          <Search className="w-4 h-4 text-white/60 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên ứng viên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-[14px] placeholder:text-white/50 flex-1 outline-none"
          />
        </div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto w-full flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveTab(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2 flex-shrink-0 flex items-center gap-1.5 ${
              activeTab === f.value
                ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <span>{f.label}</span>
            <span className={`px-1.5 rounded-full ${activeTab === f.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {f.count}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      {stats.all > 0 && (
        <div className="flex justify-between items-center px-4 pt-4 pb-1 max-w-4xl mx-auto w-full">
          <div className="text-sm font-bold text-slate-800">
            {filteredApplicants.length} ứng viên {activeTab !== 'all' && `(${filters.find(f => f.value === activeTab)?.label})`}
          </div>
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds(new Set());
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelectMode ? 'bg-[#1e3a5f]/10 text-[#1e3a5f]' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {isSelectMode ? 'Hủy duyệt nhiều' : 'Duyệt nhiều người'}
          </button>
        </div>
      )}

      {/* ── Applicant List ── */}
      <div className="p-4 max-w-4xl mx-auto w-full space-y-4">
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
            {activeTab === 'pending' && stats.pending > 0 && !isSelectMode && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 font-medium mb-3">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
                {stats.pending} ứng viên đang chờ duyệt. Bấm <strong>Duyệt</strong> để nhận ngay!
              </div>
            )}

            {isSelectMode && (
              <div className="flex justify-between items-center bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 p-3 rounded-xl mb-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#1e3a5f]/30 text-[#1e3a5f] focus:ring-[#1e3a5f] cursor-pointer"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredApplicants.length}
                    onChange={handleSelectAll}
                  />
                  <span className="text-sm font-bold text-[#1e3a5f]">Chọn tất cả ({selectedIds.size})</span>
                </div>
                {activeTab === 'pending' && selectedIds.size > 0 && (
                  <button
                    onClick={handleBatchApprove}
                    disabled={isBatchApproving}
                    className="px-4 py-1.5 bg-[#1e3a5f] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isBatchApproving ? 'Đang xử lý...' : `Duyệt (${selectedIds.size})`}
                  </button>
                )}
              </div>
            )}

            {filteredApplicants.map((applicant) => (
              <div key={applicant.id} className="relative">
                {isSelectMode && (
                  <div 
                    className="absolute inset-0 z-20 cursor-pointer rounded-2xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 transition-colors flex items-start justify-end p-4 border border-transparent"
                    onClick={(e) => { e.preventDefault(); handleToggleSelect(applicant.id); }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(applicant.id)}
                      readOnly
                      className="w-5 h-5 rounded border-[#1e3a5f]/30 shadow-sm text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      style={{ pointerEvents: 'none' }}
                    />
                  </div>
                )}
                <div className={selectedIds.has(applicant.id) ? 'ring-2 ring-[#006399] rounded-2xl scale-[0.98] transition-transform' : 'transition-transform'}>
                  {/* The ApplicantCard is a custom UI component, it takes care of its own internal rendering */}
                  <ApplicantCard
                    applicationId={applicant.id}
                    candidateId={applicant.candidateId}
                    status={applicant.status}
                    paymentStatus={applicant.paymentStatus}
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
          </>
        )}
      </div>
    </div>
  );
}

