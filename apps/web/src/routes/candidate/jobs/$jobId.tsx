import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useJob } from '@/features/jobs/hooks/useJob';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useApplyJob, useWithdrawApplication } from '@/features/jobs/hooks/useApplyJob';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { useIsJobWishlisted, useToggleWishlist } from '@/features/jobs/hooks/useWishlistJobs';
import { useApprovedCount } from '@/features/jobs/hooks/useApprovedCount';
import { incrementJobView } from '@/features/jobs/services/jobService';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/jobs/$jobId')({
  component: JobDetailPage,
});

function ShiftItem({ shift, jobId, isSelected, onSelect }: { 
  shift: any, 
  jobId: string, 
  isSelected: boolean, 
  onSelect: (id: string) => void 
}) {
  const { data: approvedCount = 0 } = useApprovedCount(jobId, shift.id);
  const remainingSlots = Math.max(0, shift.quantity - approvedCount);
  const percentFilled = shift.quantity > 0 ? (approvedCount / shift.quantity) * 100 : 0;

  if (remainingSlots <= 0) {
    return (
      <div className="bg-surface-container-low opacity-60 border border-outline-variant/30 rounded-2xl p-4 grayscale pointer-events-none relative shadow-sm">
        <span className="absolute top-2 right-2 bg-error text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase transition-all">Hết chỗ</span>
        <p className="font-bold text-on-surface">{shift.name}</p>
        <p className="text-xs text-on-surface-variant mb-3">{shift.startTime} - {shift.endTime}</p>
        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant mb-1">
          <span>Đã đủ ứng viên</span>
        </div>
        <div className="w-full bg-outline-variant/50 h-1.5 rounded-full">
          <div className="bg-on-surface-variant h-full w-full rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(shift.id)}
      className={`rounded-2xl p-4 relative overflow-hidden transition-all duration-200 cursor-pointer shadow-sm ${
        isSelected 
          ? 'bg-secondary-container/10 border-2 border-secondary scale-[0.98]'
          : 'bg-white border-2 border-transparent hover:border-outline-variant/30'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 flex items-center justify-center bg-secondary text-white rounded-full w-5 h-5 z-10">
           <span className="material-symbols-outlined text-[14px]">check</span>
        </div>
      )}
      <p className={`font-bold ${isSelected ? 'text-secondary' : 'text-on-surface'}`}>{shift.name}</p>
      <p className="text-xs text-on-surface-variant mb-3">{shift.startTime} - {shift.endTime}</p>
      <div className="flex justify-between text-[10px] font-bold text-secondary mb-1">
        <span>Còn {remainingSlots}/{shift.quantity} chỗ</span>
      </div>
      <div className="w-full bg-secondary-container/30 h-1.5 rounded-full overflow-hidden">
        <div className="bg-secondary h-full rounded-full" style={{ width: `${percentFilled}%` }}></div>
      </div>
    </div>
  );
}

function JobDetailPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { user, userProfile } = useAuth();
  const applyMutation = useApplyJob();
  const { data: job, isLoading, isError, error, refetch } = useJob(jobId);

  // Fetch employer details for dynamic rating/reputation/verification
  const { data: employerProfile } = useUserProfile(job?.employerId);
  
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');

  // Find selected shift object to check его remaining slots
  const selectedShift = job?.shifts?.find(s => s.id === selectedShiftId);
  // We need the approved count for the selected shift too
  const { data: selectedShiftApprovedCount = 0 } = useApprovedCount(jobId, selectedShiftId);
  const selectedShiftRemaining = selectedShift ? Math.max(0, selectedShift.quantity - selectedShiftApprovedCount) : 0;

  // Increment job view count on open
  useEffect(() => {
    if (jobId) {
      // Fire and forget, don't block render
      incrementJobView(jobId).catch(console.error);
    }
  }, [jobId]);

  // Wishlist functionality
  const { data: isWishlisted } = useIsJobWishlisted(userProfile?.uid, jobId);
  const toggleWishlistMutation = useToggleWishlist();

  const handleToggleWishlist = async () => {
    if (!userProfile?.uid) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      navigate({ to: '/login' });
      return;
    }

    try {
      await toggleWishlistMutation.mutateAsync({
        userId: userProfile.uid,
        jobId,
        isCurrentlyWishlisted: !!isWishlisted
      });
      if (!isWishlisted) {
        toast.success('Đã lưu việc làm vào danh sách yêu thích');
      } else {
        toast.success('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: job?.title || 'Việc làm trên JobNow',
      text: `Ứng tuyển ngay: ${job?.title} tại ${job?.employerName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép liên kết vào bộ nhớ tạm');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Check if candidate has already applied to this shift
  const { data: existingApplication } = useQuery({
    queryKey: ['application', jobId, userProfile?.uid, selectedShiftId],
    queryFn: async () => {
      if (!userProfile?.uid || !selectedShiftId) return null;
      const q = query(
        collection(db, 'applications'),
        where('candidate_id', '==', userProfile.uid),
        where('job_id', '==', jobId),
        where('shift_id', '==', selectedShiftId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any : null;
    },
    enabled: !!userProfile?.uid && !!selectedShiftId,
  });

  const hasApplied = !!existingApplication;
  const existingStatus = existingApplication?.status;
  const canCancel = existingApplication && ['NEW', 'PENDING', 'APPROVED', 'CHECKED_IN'].includes(existingStatus);
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdrawApplication();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Initialize selectedShiftId when job data is loaded
  useEffect(() => {
    if (job?.shifts?.[0] && !selectedShiftId) {
      setSelectedShiftId(job.shifts[0].id);
    }
  }, [job, selectedShiftId]);

  const handleApply = async () => {
    if (!user || !userProfile) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      navigate({ to: '/login' });
      return;
    }

    if (userProfile.verification_status !== 'VERIFIED') {
      toast.error('Bạn cần xác thực CCCD để ứng tuyển công việc!');
      navigate({ to: '/candidate/verification' });
      return;
    }

    if (!selectedShiftId) {
      toast.error('Vui lòng chọn một ca làm việc');
      return;
    }

    if (selectedShiftRemaining <= 0) {
      toast.error('Ca làm việc này đã hết chỗ');
      return;
    }

    try {
      await applyMutation.mutateAsync({
        jobId,
        candidateId: userProfile.uid,
        shiftId: selectedShiftId,
      });
      toast.success('Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.');
      navigate({ to: '/candidate' });
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-medium">Đang tải thông tin việc làm...</p>
      </div>
    );
  }

  if (isError) {
    const message =
      typeof (error as any)?.message === 'string'
        ? (error as any).message
        : 'Không thể tải thông tin tin tuyển dụng.';

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px]">wifi_off</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Không thể tải tin tuyển dụng</h2>
        <p className="text-on-surface-variant mb-6">{message}</p>
        {import.meta.env.DEV && (
          <p className="mb-6 max-w-[320px] break-words text-[11px] font-mono text-on-surface-variant/80">
            jobId: {jobId}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate({ to: '/candidate' })}
            className="bg-surface-container-high text-on-surface px-6 py-2.5 rounded-xl font-bold"
          >
            Quay lại bản đồ
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Không tìm thấy việc làm</h2>
        <p className="text-on-surface-variant mb-6">Xin lỗi, tin tuyển dụng này có thể đã hết hạn hoặc bị xóa.</p>
        <button
          onClick={() => navigate({ to: '/candidate' })}
          className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold"
        >
          Quay lại bản đồ
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-[100dvh] pb-[140px]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button onClick={() => navigate({ to: '/candidate' })} className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-on-surface active:scale-95 duration-200 -ml-1">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back</span>
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-headline font-bold text-[15px] text-on-surface leading-tight">Chi tiết công việc</h1>
          </div>
          <div className="shrink-0 flex items-center -mr-1">
            <button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface active:scale-95 duration-200">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>share</span>
            </button>
            <button 
              onClick={handleToggleWishlist} 
              disabled={toggleWishlistMutation.isPending} 
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 duration-200 ${isWishlisted ? 'text-error' : 'text-on-surface'}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Hero Cover Area */}
        <div 
          className="relative h-[180px] w-full rounded-b-[32px] overflow-visible bg-gradient-to-br from-[#0F172A] to-[#0369A1] shadow-lg shadow-blue-900/10"
          style={job.images?.[0] ? { backgroundImage: `url(${job.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute -bottom-7 left-6 ring-[3px] ring-white rounded-[18px] overflow-hidden bg-white shadow-xl shadow-black/5">
            <img 
              alt="Employer Logo" 
              className="w-14 h-14 object-cover" 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName || 'Employer'}&backgroundColor=f59e0b`}
            />
          </div>
          
          {employerProfile?.verification_status === 'VERIFIED' && (
            <div className="absolute bottom-4 right-6 bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-900/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              ĐÃ XÁC THỰC
            </div>
          )}
        </div>

        {/* Job Header Information */}
        <section className="mt-11 px-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-poppins font-bold text-[20px] text-[#0F172A] leading-tight tracking-tight mt-1">{job.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-secondary font-bold text-[15px]">{job.employerName || 'Đối tác JobNow'}</span>
                <span className="text-outline-variant text-[12px]">•</span>
                <div className="flex items-center gap-1 text-tertiary">
                   <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                   <span className="text-[13px] font-bold">
                    {employerProfile?.average_rating && employerProfile.average_rating > 0 
                      ? employerProfile.average_rating.toFixed(1) 
                      : 'Mới'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-3 gap-2.5 mt-6">
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-secondary mb-1.5" style={{ fontSize: '22px' }}>payments</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 opacity-70">Mức lương</span>
              <span className="text-[12px] font-black text-on-surface truncate w-full">
                {job.salary ? (job.salary / 1000).toLocaleString() + 'K' : 'Thỏa thuận'}
                {job.salary ? `/${job.salaryType === 'PER_SHIFT' ? 'ca' : (job.salaryType === 'MONTHLY' ? 'tháng' : 'giờ')}` : ''}
              </span>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-tertiary mb-1.5" style={{ fontSize: '22px' }}>distance</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 opacity-70">Địa điểm</span>
              <span className="text-[12px] font-black text-on-surface truncate w-full" title={job.location?.address}>
                {job.location?.address?.split(',').pop()?.trim() || 'Khu vực'}
              </span>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[#0369A1] mb-1.5" style={{ fontSize: '22px' }}>calendar_today</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 opacity-70">Bắt đầu</span>
              <span className="text-[12px] font-black text-on-surface truncate w-full">
                {job.startDate || 'Thỏa thuận'}
              </span>
            </div>
          </div>
        </section>

        {/* Description & Requirements Section */}
        <section className="mt-10 px-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-[#0369A1] rounded-full"></div>
              <h3 className="font-headline font-black text-[#0F172A] text-[17px] uppercase tracking-wider">Mô tả công việc</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed text-[14px] whitespace-pre-wrap font-medium">
              {job.description}
            </p>
          </div>
          
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-secondary rounded-full"></div>
                <h3 className="font-headline font-black text-[#0F172A] text-[17px] uppercase tracking-wider">Yêu cầu ứng viên</h3>
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {job.requirements.map((req: string) => (
                  <li key={req} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-outline-variant/10 shadow-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="text-on-surface-variant text-[13px] font-bold">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Shift Picker: Interactive Area */}
        <section className="mt-10 px-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-tertiary rounded-full"></div>
                <h3 className="font-headline font-black text-[#0F172A] text-[17px] uppercase tracking-wider">Chọn ca làm việc</h3>
              </div>
              <p className="text-[12px] text-on-surface-variant font-medium italic translate-x-3">Hệ thống tự động lọc các ca còn chỗ</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {job.shifts?.map((shift: any) => (
              <ShiftItem
                key={shift.id}
                shift={shift}
                jobId={jobId}
                isSelected={selectedShiftId === shift.id}
                onSelect={setSelectedShiftId}
              />
            ))}
          </div>
        </section>

        {/* Employer Profile Card: Bento Style */}
        <section className="mt-10 px-6">
          <div 
            className="bg-white rounded-[32px] p-6 shadow-xl shadow-black/5 border border-outline-variant/10 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.99]"
            onClick={() => {
              navigate({ to: '/candidate/employer/$employerId', params: { employerId: job.employerId || '' } });
            }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <img 
                  alt="Employer Profile" 
                  className="w-16 h-16 rounded-[20px] object-cover ring-2 ring-outline-variant/5 shadow-md" 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName || 'Employer'}&backgroundColor=f59e0b`}
                />
                {employerProfile?.verification_status === 'VERIFIED' && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md border border-outline-variant/10">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline font-black text-[18px] text-[#0F172A] line-clamp-1">{job.employerName || 'Đối tác JobNow'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Tin cậy</div>
                  <span className="text-outline-variant opacity-30 text-xs mt-1">•</span>
                  <span className="text-[12px] text-on-surface-variant font-bold">Hoạt động tích cực</span>
                </div>
              </div>
              <div className="relative flex items-center justify-center size-14">
                <svg className="size-full transform -rotate-90">
                  <circle className="text-surface-container-high/30" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                  <circle 
                    className="text-emerald-500" 
                    cx="28" cy="28" 
                    fill="transparent" r="24" stroke="currentColor" 
                    strokeDasharray="150.8" 
                    strokeDashoffset={150.8 - (150.8 * (employerProfile?.reputation_score || 0) / 100)} 
                    strokeWidth="4"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[13px] font-black text-emerald-600 leading-none">{employerProfile?.reputation_score || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-outline-variant/10">
              <div className="text-center">
                <p className="text-xl font-poppins font-black text-[#0F172A] tracking-tight">{(employerProfile as any)?.total_jobs || 1}</p>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mt-1.5 opacity-60">Tin đã đăng</p>
              </div>
              <div className="text-center border-l border-outline-variant/10">
                <p className="text-xl font-poppins font-black text-[#0F172A] tracking-tight">{(employerProfile as any)?.total_hires || 0}</p>
                <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mt-1.5 opacity-60">Lượt thuê</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[55] bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe">
        <div className="flex items-center gap-2 max-w-lg mx-auto px-4 py-3">
          <button
            onClick={handleToggleWishlist}
            disabled={toggleWishlistMutation.isPending}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-95 ${
              isWishlisted
                ? 'bg-red-50 border-red-100 text-red-500'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </button>
          <button 
            onClick={() => navigate({ 
              to: '/candidate/chat', 
              search: { 
                jobId,
                applicationId: undefined,
                employerId: undefined
              } 
            })}
            className="w-11 h-11 bg-secondary-container/10 border border-secondary/20 rounded-xl flex items-center justify-center shrink-0 text-secondary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>chat_bubble</span>
          </button>
          {canCancel ? (
            <>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isWithdrawing}
                  className={`flex-1 h-11 rounded-xl font-poppins font-black text-[12px] uppercase tracking-wider transition-all active:scale-[0.98]
                    ${isWithdrawing 
                      ? 'bg-surface-container-high text-on-surface-variant/40 border border-outline-variant/10' 
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-sm'}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {isWithdrawing ? 'ĐANG XỬ LÝ...' : 'HỦY CA LÀM'}
                    {!isWithdrawing && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>}
                  </span>
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 h-11 rounded-xl font-poppins font-bold text-[11px] uppercase tracking-wider bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  >
                    KHÔNG
                  </button>
                  <button
                    disabled={isWithdrawing}
                    onClick={() => {
                      withdraw({ applicationId: existingApplication.id, candidateId: userProfile?.uid || '' }, {
                        onSuccess: () => {
                          toast.success('Đã hủy ứng tuyển thành công.');
                          setShowCancelConfirm(false);
                        },
                        onError: (err: Error) => {
                          toast.error(err.message || 'Không thể hủy, vui lòng thử lại.');
                        }
                      });
                    }}
                    className="flex-1 h-11 rounded-xl font-poppins font-black text-[11px] uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isWithdrawing && <span className="animate-spin">⏳</span>}
                    XÁC NHẬN HỦY
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleApply}
              disabled={applyMutation.isPending || hasApplied || selectedShiftRemaining <= 0}
              className={`flex-1 h-11 rounded-xl font-poppins font-black text-[12px] uppercase tracking-wider transition-all active:scale-[0.98]
                ${applyMutation.isPending || hasApplied || selectedShiftRemaining <= 0
                  ? 'bg-surface-container-high text-on-surface-variant/40 border border-outline-variant/10'
                  : 'bg-gradient-to-r from-[#0369A1] to-[#004F7B] text-white shadow-md shadow-[#0369A1]/20'
                }
              `}
            >
              <span className="flex items-center justify-center gap-1.5">
                {applyMutation.isPending ? 'ĐANG XỬ LÝ...' : hasApplied ? 'ĐÃ ỨNG TUYỂN' : selectedShiftRemaining <= 0 ? 'HẾT CHỖ' : 'ỨNG TUYỂN NGAY'}
                {!applyMutation.isPending && !hasApplied && selectedShiftRemaining > 0 && <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
