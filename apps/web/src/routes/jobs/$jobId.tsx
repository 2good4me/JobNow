import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useJob } from '@/features/jobs/hooks/useJob';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useApplyJob } from '@/features/jobs/hooks/useApplyJob';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { useIsJobWishlisted, useToggleWishlist } from '@/features/jobs/hooks/useWishlistJobs';
import { useApprovedCount } from '@/features/jobs/hooks/useApprovedCount';
import { incrementJobView } from '@/features/jobs/services/jobService';
import { toast } from 'sonner';

export const Route = createFileRoute('/jobs/$jobId')({
  component: PublicJobDetailPage,
});

function ShiftItem({ shift, jobId, isSelected, onSelect }: {
  shift: any;
  jobId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { data: approvedCount = 0 } = useApprovedCount(jobId, shift.id);
  const remainingSlots = Math.max(0, shift.quantity - approvedCount);
  const percentFilled = shift.quantity > 0 ? (approvedCount / shift.quantity) * 100 : 0;

  if (remainingSlots <= 0) {
    return (
      <div className="bg-surface-container-low opacity-60 border border-outline-variant/30 rounded-2xl p-4 grayscale pointer-events-none relative">
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
      className={`rounded-2xl p-4 relative overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-secondary-container/10 border-2 border-secondary scale-95'
          : 'bg-surface border-2 border-transparent hover:border-outline-variant/30'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 flex items-center justify-center bg-secondary text-white rounded-full w-5 h-5">
           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
           </svg>
        </div>
      )}
      <p className="font-bold text-on-surface">{shift.name}</p>
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

function PublicJobDetailPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { user, userProfile } = useAuth();
  const applyMutation = useApplyJob();
  const { data: job, isLoading } = useJob(jobId);
  const { data: employerProfile } = useUserProfile(user ? job?.employerId : undefined);
  const [selectedShiftId, setSelectedShiftId] = useState('');

  const selectedShift = job?.shifts?.find((s: any) => s.id === selectedShiftId);
  const { data: selectedShiftApprovedCount = 0 } = useApprovedCount(jobId, selectedShiftId);
  const selectedShiftRemaining = selectedShift ? Math.max(0, selectedShift.quantity - selectedShiftApprovedCount) : 0;

  useEffect(() => {
    if (jobId) {
      incrementJobView(jobId).catch(console.error);
    }
  }, [jobId]);

  // Redirect candidates to the candidate-specific route
  useEffect(() => {
    if (userProfile?.role === 'CANDIDATE') {
      navigate({ to: '/candidate/jobs/$jobId', params: { jobId } });
    }
  }, [userProfile?.role, jobId, navigate]);

  const { data: isWishlisted } = useIsJobWishlisted(userProfile?.uid, jobId);
  const toggleWishlistMutation = useToggleWishlist();

  const requireLogin = (message: string) => {
    toast.error(message);
    navigate({ to: '/login' });
  };

  const handleToggleWishlist = async () => {
    if (!userProfile?.uid) {
      requireLogin('Đăng nhập để lưu việc làm');
      return;
    }

    try {
      await toggleWishlistMutation.mutateAsync({
        userId: userProfile.uid,
        jobId,
        isCurrentlyWishlisted: !!isWishlisted,
      });
      toast.success(isWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã lưu việc làm');
    } catch {
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

  const { data: existingApplication } = useQuery({
    queryKey: ['application', jobId, userProfile?.uid, selectedShiftId],
    queryFn: async () => {
      if (!userProfile?.uid || !selectedShiftId) return null;
      const q = query(
        collection(db, 'applications'),
        where('candidate_id', '==', userProfile.uid),
        where('job_id', '==', jobId),
        where('shift_id', '==', selectedShiftId),
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty ? snapshot.docs[0].data() : null;
    },
    enabled: !!userProfile?.uid && !!selectedShiftId,
  });

  const hasApplied = !!existingApplication;

  useEffect(() => {
    if (job?.shifts?.[0] && !selectedShiftId) {
      setSelectedShiftId(job.shifts[0].id);
    }
  }, [job, selectedShiftId]);

  const handleApply = async () => {
    if (!user || !userProfile) {
      requireLogin('Đăng nhập để ứng tuyển công việc này');
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

  if (!job) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Không tìm thấy việc làm</h2>
        <p className="text-on-surface-variant mb-6">Xin lỗi, tin tuyển dụng này có thể đã hết hạn hoặc bị xóa.</p>
        <button
          onClick={() => navigate({ to: '/jobs' })}
          className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-[100dvh]">
      {/* Top Navigation Anchor */}
      <header className="w-full top-0 sticky z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 py-4 w-full flex-row">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate({ to: '/jobs' })} className="text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-[18px] text-on-surface m-0 leading-none">Chi tiết công việc</h1>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={handleShare} className="text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
            <button onClick={handleToggleWishlist} disabled={toggleWishlistMutation.isPending} className={`flex items-center justify-center ${isWishlisted ? 'text-error' : 'text-on-surface'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                bookmark
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-32">
        {/* Hero Cover Area */}
        <div 
          className="relative h-[200px] w-full rounded-b-3xl overflow-visible bg-gradient-to-br from-[#0F172A] to-[#0369A1]"
          style={job.images?.[0] ? { backgroundImage: `url(${job.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute -bottom-7 left-6 ring-4 ring-surface rounded-xl overflow-hidden bg-white">
            <img 
              alt="Employer Logo" 
              className="w-14 h-14 object-cover" 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName || 'Employer'}&backgroundColor=f59e0b`}
            />
          </div>
        </div>

        {/* Job Header Information */}
        <section className="mt-10 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins font-bold text-[22px] text-[#0F172A] leading-tight mt-2">{job.title}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-secondary font-bold text-[15px]">
                <span>{job.employerName || 'Đối tác JobNow'}</span>
                {employerProfile?.verification_status === 'VERIFIED' && (
                  <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                )}
              </div>
            </div>
          </div>

          {/* Alert for unauthenticated users */}
          {!user && (
            <div className="mt-6 rounded-3xl bg-primary-container/10 border border-primary-container/20 px-5 py-4 flex items-start gap-4">
              <div className="bg-primary-container/20 p-2 rounded-xl">
                <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
              </div>
              <div className="flex-1">
                <p className="font-headline font-bold text-on-surface text-[14px]">Đăng nhập để tiếp tục</p>
                <p className="text-on-surface-variant text-[12px] mt-0.5 leading-relaxed">Bạn cần đăng nhập để ứng tuyển, lưu việc làm và theo dõi nhà tuyển dụng này.</p>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/login' })}
                  className="mt-3 text-[13px] font-bold text-secondary flex items-center gap-1 hover:underline"
                >
                  Đi tới đăng nhập
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Stats Row: Tonal Layering */}
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-3 gap-2.5 mt-6">
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-rounded text-secondary mb-1.5 text-[24px]">payments</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Mức lương</span>
              <span className="text-[13px] font-bold text-on-surface truncate w-full">
                {job.salary ? (job.salary / 1000).toLocaleString() + 'K' : 'Thỏa thuận'}
                {job.salary ? `/${job.salaryType === 'PER_SHIFT' ? 'ca' : (job.salaryType === 'MONTHLY' ? 'tháng' : 'giờ')}` : ''}
              </span>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-rounded text-tertiary mb-1.5 text-[24px]">distance</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Địa điểm</span>
              <span className="text-[13px] font-bold text-on-surface truncate w-full" title={job.location?.address}>
                {job.location?.address?.split(',').pop()?.trim() || 'Khu vực'}
              </span>
            </div>
            <div className="bg-surface-container-low p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-rounded text-primary mb-1.5 text-[24px]">calendar_today</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Bắt đầu</span>
              <span className="text-[13px] font-bold text-on-surface truncate w-full">
                {job.startDate || 'Thỏa thuận'}
              </span>
            </div>
          </div>
        </section>

        {/* Description & Requirements Section */}
        <section className="mt-8 px-6 space-y-6">
          <div>
            <h3 className="font-headline font-bold text-on-surface mb-2">Mô tả công việc</h3>
            <p className="text-on-surface-variant leading-relaxed text-[14px] whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="font-headline font-bold text-on-surface mb-3">Yêu cầu</h3>
              <ul className="space-y-3">
                {job.requirements.map((req: string) => (
                  <li key={req} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="text-on-surface-variant text-[14px]">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Shift Picker: Interactive Area */}
        <section className="mt-8 px-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-headline font-bold text-on-surface">Chọn ca làm việc</h3>
              <p className="text-[12px] text-on-surface-variant italic">Tối đa đăng ký 1 ca</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
        <section className="mt-8 px-6">
          <div 
            className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm border border-outline-variant/10 cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99]"
            onClick={() => {
              if (!user) {
                requireLogin('Đăng nhập để xem đầy đủ hồ sơ nhà tuyển dụng và theo dõi họ');
                return;
              }
              navigate({ to: '/candidate/employer/$employerId', params: { employerId: job.employerId || '' } });
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img 
                  alt="Employer Profile" 
                  className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/20" 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName || 'Employer'}&backgroundColor=f59e0b`}
                />
                {employerProfile?.verification_status === 'VERIFIED' && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline font-bold text-[17px] text-on-surface line-clamp-1">{job.employerName || 'Đối tác JobNow'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 text-tertiary">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-[13px] font-bold">
                      {employerProfile?.average_rating && employerProfile.average_rating > 0
                        ? employerProfile.average_rating.toFixed(1)
                        : 'Mới'}
                    </span>
                  </div>
                  <span className="text-outline-variant">•</span>
                  <span className="text-[12px] text-on-surface-variant font-medium">Nhà tuyển dụng</span>
                </div>
              </div>
              <div className="relative flex items-center justify-center size-16">
                <svg className="size-full transform -rotate-90">
                  <circle className="text-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                  <circle 
                    className="text-secondary" 
                    cx="32" cy="32" 
                    fill="transparent" r="28" stroke="currentColor" 
                    strokeDasharray="175.9" 
                    strokeDashoffset={175.9 - (175.9 * (employerProfile?.reputation_score || 0) / 100)} 
                    strokeWidth="4"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[11px] font-black text-secondary leading-none">{employerProfile?.reputation_score || 0}</span>
                  <span className="text-[7px] font-bold text-on-surface-variant uppercase tracking-tighter">Uy tín</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-outline-variant/10">
              <div className="text-center">
                <p className="text-xl font-headline font-bold text-on-surface tracking-tight">{(employerProfile as any)?.total_jobs || 1}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Tin đã đăng</p>
              </div>
              <div className="text-center border-l border-outline-variant/10">
                <p className="text-xl font-headline font-bold text-on-surface tracking-tight">{(employerProfile as any)?.total_hires || 0}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Lượt thuê</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Sticky Bottom Area */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md flex flex-col justify-center items-center px-6 pb-4 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="w-full max-w-lg mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-loose">Lương {job.salaryType === 'PER_SHIFT' ? 'ca này' : 'công việc'}</span>
            <span className="font-poppins font-bold text-secondary text-lg">
              {job.salary ? (job.salary / 1000).toLocaleString() + 'K' : 'Thỏa thuận'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-error font-medium mb-1.5 opacity-80">
              <span className="material-symbols-outlined text-[10px]">warning</span>
              <span>Luôn đi làm đúng giờ</span>
            </div>
            <button 
              onClick={handleApply}
              disabled={applyMutation.isPending || hasApplied || selectedShiftRemaining <= 0}
              className={`flex flex-row items-center justify-center min-w-[160px] py-4 px-8 rounded-2xl font-poppins font-black text-[14px] uppercase tracking-wider transition-all
                ${applyMutation.isPending || hasApplied || selectedShiftRemaining <= 0
                  ? 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:brightness-110 active:scale-[0.98]'
                }
              `}
            >
              {applyMutation.isPending ? 'ĐANG XỬ LÝ...' : hasApplied ? 'ĐÃ ỨNG TUYỂN' : selectedShiftRemaining <= 0 ? 'HẾT CHỖ' : (!user && !hasApplied) ? 'ĐĂNG NHẬP' : 'ỨNG TUYỂN NGAY'}
              {user && !hasApplied && selectedShiftRemaining > 0 && <span className="material-symbols-outlined ml-2 text-[20px]">bolt</span>}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
