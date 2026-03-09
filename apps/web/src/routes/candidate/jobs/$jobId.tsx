import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Share2, Bookmark, MapPin,
  UtensilsCrossed, Calendar, Clock, Users,
  Star, ShieldCheck, Heart, MessageSquare
} from 'lucide-react';
import { useJob } from '@/features/jobs/hooks/useJob';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useApplyJob } from '@/features/jobs/hooks/useApplyJob';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/jobs/$jobId')({
  component: JobDetailPage,
});

function JobDetailPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { user, userProfile } = useAuth();
  const applyMutation = useApplyJob();
  const { data: job, isLoading } = useJob(jobId);

  const [selectedShiftId, setSelectedShiftId] = useState<string>('');

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

    if (!selectedShiftId) {
      toast.error('Vui lòng chọn một ca làm việc');
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Đang tải thông tin việc làm...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy việc làm</h2>
        <p className="text-slate-500 mb-6">Xin lỗi, tin tuyển dụng này có thể đã hết hạn hoặc bị xóa.</p>
        <button
          onClick={() => navigate({ to: '/candidate' })}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold"
        >
          Quay lại bản đồ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24 font-sans text-slate-800">
      {/* Header / Cover Image Area */}
      <div className="relative h-64 bg-slate-200">
        <img
          src={job.images?.[0] || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000"}
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Top Actions */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={() => navigate({ to: '/candidate' })}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verified Badge Overlay */}
        <div className="absolute bottom-4 right-4 bg-emerald-500 text-white font-bold text-[12px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <ShieldCheck className="w-4 h-4" /> ĐÃ XÁC THỰC
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 -mt-4 relative z-20">
        {/* Title and Ratings Header */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight pr-4">{job.title}</h1>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-bold text-amber-600 text-[13px]">4.8</span>
            </div>
          </div>

          <p className="text-blue-600 font-semibold mb-3">{job.employerName || 'Đối tác JobNow'}</p>

          <div className="flex items-center gap-4 text-slate-500 text-[13px]">
            <div className="flex items-center gap-1.5 max-w-[200px] truncate">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              {job.location?.address || 'Khu vực tuyển dụng'}
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-blue-500" />
              {job.category || 'F&B'}
            </div>
          </div>
        </div>

        {/* Salary Highlight Card */}
        <div className="bg-emerald-500 rounded-[1.5rem] p-5 mb-6 relative overflow-hidden shadow-md shadow-emerald-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 right-10 w-24 h-24 bg-black/10 rounded-full -mb-10 blur-xl"></div>

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-emerald-50 text-[11px] font-bold uppercase tracking-wider mb-1 opacity-90">Mức lương</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white">{job.salary?.toLocaleString()}đ</span>
                <span className="text-emerald-100 font-medium">/{job.salaryType === 'PER_SHIFT' ? 'ca' : (job.salaryType === 'MONTHLY' ? 'tháng' : 'giờ')}</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[12px] font-bold px-3 py-1.5 rounded-full">
              {job.salaryType === 'PER_SHIFT' ? 'Theo ca' : (job.salaryType === 'MONTHLY' ? 'Theo tháng' : 'Theo giờ')}
            </div>
          </div>
        </div>

        {/* Detail Information Grid */}
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Thông tin chi tiết</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
            <Calendar className="w-5 h-5 text-blue-500 mb-2" />
            <span className="text-slate-500 text-[12px] mb-1">Ngày bắt đầu</span>
            <span className="text-slate-900 font-bold text-[14px]">{job.startDate || 'Thỏa thuận'}</span>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
            <Clock className="w-5 h-5 text-amber-500 mb-2" />
            <span className="text-slate-500 text-[12px] mb-1">Hình thức</span>
            <span className="text-slate-900 font-bold text-[14px]">{job.salaryType === 'MONTHLY' ? 'Toàn thời gian' : 'Bán thời gian'}</span>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
            <Users className="w-5 h-5 text-purple-500 mb-2" />
            <span className="text-slate-500 text-[12px] mb-1">Số lượng cần</span>
            <span className="text-slate-900 font-bold text-[14px]">{job.vacancies || 'Không giới hạn'}</span>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col justify-center">
            <UtensilsCrossed className="w-5 h-5 text-rose-500 mb-2" />
            <span className="text-slate-500 text-[12px] mb-1">Ngành nghề</span>
            <span className="text-slate-900 font-bold text-[14px]">{job.category || 'Lao động'}</span>
          </div>
        </div>

        {/* Shift Selection */}
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Các ca làm việc</h2>
        <div className="space-y-3 mb-8">
          {job.shifts.map((shift) => {
            const isSelected = selectedShiftId === shift.id;
            return (
              <div
                key={shift.id}
                onClick={() => setSelectedShiftId(shift.id)}
                className={`border-2 shadow-sm rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent hover:border-slate-200'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-bl-lg z-10">
                    Đã chọn
                  </div>
                )}
                <div className="flex items-center gap-4 relative z-0">
                  <div className={`w-10 h-10 shadow-sm rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-white text-blue-500' : 'bg-slate-50 text-slate-500'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-bold text-[15px] ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{shift.name}</h3>
                      <span className={`text-[13px] font-semibold ${isSelected ? 'text-blue-600' : 'text-emerald-600'}`}>Còn {shift.quantity} chỗ</span>
                    </div>
                    <p className={`text-[12px] mb-2 font-medium ${isSelected ? 'text-blue-700/70' : 'text-slate-500'}`}>{shift.startTime} - {shift.endTime}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Job Description */}
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Mô tả công việc</h2>
        <div className="text-slate-600 text-[14px] leading-relaxed mb-4 whitespace-pre-wrap">
          {job.description}
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <>
            <h2 className="text-[17px] font-bold text-slate-900 mb-3">Yêu cầu</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {job.requirements.map(req => (
                <span key={req} className="bg-white border border-slate-200 text-slate-600 py-1.5 px-3 rounded-full text-[12px] font-semibold shadow-sm">
                  {req}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Employer Summary Block */}
        <h2 className="text-[17px] font-bold text-slate-900 mb-4">Nhà tuyển dụng</h2>
        <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-4 flex items-center gap-4 mb-8 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate({ to: '/candidate/employer/$employerId', params: { employerId: job.employerId } })}>
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center shrink-0 border border-amber-100 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName}&backgroundColor=f59e0b`} alt="Logo" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-900 font-bold text-[15px]">{job.employerName || 'Đối tác JobNow'}</h3>
              <span className="bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Tin Cậy</span>
            </div>
            <p className="text-slate-500 text-[12px]">Hoạt động tích cực</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="text-emerald-600 font-bold text-[14px]">98</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-[72px] inset-x-0 bg-white border-t border-slate-200 p-4 pb-safe flex gap-3 z-[60]">
        <button className="w-[52px] h-[52px] bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 hover:bg-slate-100 transition-colors">
          <Heart className="w-6 h-6 text-slate-400" />
        </button>
        <button className="w-[52px] h-[52px] bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 hover:bg-blue-100 transition-colors">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </button>
        <button
          onClick={handleApply}
          disabled={applyMutation.isPending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {applyMutation.isPending ? 'ĐANG XỬ LÝ...' : 'ỨNG TUYỂN NGAY'}
        </button>
      </div>

      <style>{`
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom, 16px);
                }
            `}</style>
    </div>
  );
}
