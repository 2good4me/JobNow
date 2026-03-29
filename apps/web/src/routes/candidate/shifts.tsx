import { createFileRoute, Link } from '@tanstack/react-router';
import { Clock, MessageCircle, Timer, CheckCircle2, History, Star, DollarSign, Loader2, AlertCircle, X, LogIn, LogOut, Clock3, MapPin, QrCode } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useGeolocation } from '@/features/jobs/hooks/useGeolocation';
import { useCheckIn, useCheckOut } from '@/features/jobs/hooks/useCheckIn';
import { useConfirmPayment } from '@/features/jobs/hooks/useManageApplicants';
import { useState, useEffect } from 'react';
import { ReviewModal } from '@/features/jobs/components/ReviewModal';
import { toast } from 'sonner';
import type { Application } from '@jobnow/types';

/* ── Shift Detail Modal ───────────────────────── */
function ShiftDetailModal({ shift, onClose }: { shift: Application; onClose: () => void }) {
  const checkIn = shift.checkInTime;
  const checkOut = (shift as any).checkOutTime;

  const toDate = (ts: any): Date | null => {
    if (!ts) return null;
    if (ts?.toDate) return ts.toDate();
    return new Date(ts);
  };

  const checkInDate = toDate(checkIn);
  const checkOutDate = toDate(checkOut);

  const formatTime = (dt: Date | null) => {
    if (!dt) return '—';
    return dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dt: Date | null) => {
    if (!dt) return '';
    return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  let durationText = '—';
  if (checkInDate && checkOutDate) {
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    durationText = `${hours} giờ ${minutes} phút`;
  } else if (checkInDate && !checkOutDate) {
    durationText = 'Chưa check-out';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{shift.jobTitle || 'Chi tiết ca làm'}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Ca làm */}
          {shift.shiftTime && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3">
              <Clock3 className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Ca làm</p>
                <p className="font-bold text-slate-700 text-sm">{shift.shiftTime}</p>
              </div>
            </div>
          )}

          {/* Check-in */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-3">
            <LogIn className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[11px] text-emerald-600 font-medium uppercase tracking-wider">Thời gian Check-in</p>
              <p className="font-bold text-slate-800 text-sm">
                {checkInDate ? `${formatTime(checkInDate)}` : '—'}
              </p>
              {checkInDate && <p className="text-[11px] text-slate-400">{formatDate(checkInDate)}</p>}
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
            <LogOut className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-[11px] text-blue-600 font-medium uppercase tracking-wider">Thời gian Check-out</p>
              <p className="font-bold text-slate-800 text-sm">
                {checkOutDate ? `${formatTime(checkOutDate)}` : '—'}
              </p>
              {checkOutDate && <p className="text-[11px] text-slate-400">{formatDate(checkOutDate)}</p>}
            </div>
          </div>

          {/* Tổng giờ */}
          <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl px-4 py-3">
            <Timer className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[11px] text-indigo-600 font-medium uppercase tracking-wider">Tổng thời gian làm việc</p>
              <p className="font-bold text-indigo-700 text-base">{durationText}</p>
            </div>
          </div>

          {shift.isLate && (
            <div className="flex items-center gap-2 bg-rose-50 rounded-2xl px-4 py-3 border border-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-sm font-bold text-rose-600">
                Check-in muộn {shift.lateMinutes ? `${shift.lateMinutes} phút` : ''}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}


export const Route = createFileRoute('/candidate/shifts')({
  component: CandidateShifts,
});

function WorkTimer({ checkInTime, variant = 'inline' }: { checkInTime: any; variant?: 'inline' | 'hero' }) {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!checkInTime) return;
    
    // Handle Firestore Timestamp or Date
    const start = checkInTime.toDate?.() || new Date(checkInTime);
    
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - start.getTime());
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [checkInTime]);

  const timerText = duration || '00:00:00';

  if (variant === 'hero') {
    return (
      <div className="flex flex-col gap-1 text-white">
        <span className="text-[38px] sm:text-[44px] font-black tracking-tight leading-none">{timerText}</span>
        <span className="text-[11px] uppercase tracking-[0.4em] text-white/70">Đang tính giờ</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-emerald-600 font-mono font-bold text-sm">
      <Timer className="w-3.5 h-3.5 animate-pulse" />
      {timerText}
    </div>
  );
}

function CandidateShifts() {
  const { userProfile } = useAuth();
  const geo = useGeolocation();
  const { data: applications = [], isLoading } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const { mutate: confirmPayment, isPending: isConfirming } = useConfirmPayment();

  // State for Shift Detail Modal
  const [selectedShift, setSelectedShift] = useState<Application | null>(null);

  // State for Review Modal
  const [reviewData, setReviewData] = useState<{
    isOpen: boolean;
    applicationId: string;
    employerId: string;
    employerName: string;
    jobTitle: string;
  }>({
    isOpen: false,
    applicationId: '',
    employerId: '',
    employerName: '',
    jobTitle: '',
  });

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const parseTimes = (timeStr?: string) => {
    if (!timeStr) return null;
    const matches = timeStr.match(/(\d{2}:\d{2})/g);
    if (matches && matches.length >= 2) return { start: matches[0], end: matches[1] };
    return null;
  };

  const activeShifts = applications.filter((app) => app.status === 'CHECKED_IN');
  const upcoming = applications.filter((app) => app.status === 'APPROVED' || app.status === 'NEW' || app.status === 'PENDING');
  const historyItems = applications.filter((app) => app.status === 'COMPLETED' || app.status === 'CASH_CONFIRMATION');
  const primaryShift = activeShifts[0] ?? null;
  const locationLabel = geo.isDefault
    ? 'GPS chưa bật'
    : `Trong phạm vi ${Math.max(5, Math.round(geo.accuracy ?? 0))}m`;

  const openReviewModal = (app: any) => {
    setReviewData({
      isOpen: true,
      applicationId: app.id,
      employerId: app.employerId || app.employer_id, // Support both
      employerName: app.employerName || 'Nhà tuyển dụng',
      jobTitle: app.jobTitle || 'Công việc',
    });
  };

  return (
    <div className="pb-24 bg-[#F5F7FF] min-h-screen">
      {/* ── Gradient Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#3b82f6] px-5 pt-14 pb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-xl font-bold">Ca làm của tôi</h1>
              <p className={`text-[12px] mt-0.5 ${geo.isDefault ? 'text-amber-300 flex items-center gap-1' : 'text-blue-200'}`}>
                {geo.isDefault ? (
                  <><AlertCircle className="w-3 h-3 inline" /> Vị trí mặc định – GPS chưa bật</>
                ) : (
                  <>Vị trí: {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</>
                )}
              </p>
            </div>
            <span className="text-blue-200 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">Realtime</span>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-white text-lg font-black">{activeShifts.length}</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase">Đang làm</p>
            </div>
            <div className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-white text-lg font-black">{upcoming.length}</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase">Sắp tới</p>
            </div>
            <div className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-white text-lg font-black">{historyItems.length}</p>
              <p className="text-blue-200 text-[10px] font-bold uppercase">Lịch sử</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        <div className="flex bg-slate-200/60 p-1 rounded-xl w-full mb-2">
          <button 
            onClick={() => setViewMode('list')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Danh sách
          </button>
          <button 
            onClick={() => setViewMode('calendar')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Thời gian biểu
          </button>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6 overflow-x-auto">
            <p className="text-xs text-slate-500 mb-4 font-medium italic">* Tuyến thời gian các ca làm việc trong ngày</p>
            <div className="min-w-[300px] relative mt-2 border-l-2 border-slate-100 ml-12" style={{ height: `${(24 - 6) * 48}px` }}>
              {Array.from({ length: 24 - 6 + 1 }).map((_, i) => (
                <div key={i} className="absolute w-full border-t border-slate-100/50 flex items-center" style={{ top: `${i * 48}px` }}>
                  <span className="absolute -left-12 text-[10px] text-slate-400 font-bold px-1 bg-white -mt-2">{String(i + 6).padStart(2, '0')}:00</span>
                </div>
              ))}
              
              {[...activeShifts, ...upcoming, ...historyItems].map((shift) => {
                 const times = parseTimes(shift.shiftTime);
                 if (!times) return null;

                 const [startH, startM] = times.start.split(':').map(Number);
                 const [endH, endM] = times.end.split(':').map(Number);
                 
                 const startOffset = (Math.max(6, startH) - 6 + (startM || 0)/60) * 48;
                 const duration = (endH - startH + ((endM || 0) - (startM || 0))/60) * 48;
                 if (startOffset < 0 || duration <= 0) return null;

                 const isActive = shift.status === 'CHECKED_IN';
                 const isCompleted = shift.status === 'COMPLETED' || shift.status === 'CASH_CONFIRMATION';
                 const colorClass = isActive ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900' : 
                                  isCompleted ? 'bg-slate-100 border-slate-400 text-slate-700' : 
                                  'bg-blue-50/90 border-blue-500 text-blue-900';

                 return (
                   <div 
                     key={shift.id} 
                     onClick={() => setSelectedShift(shift)}
                     className={`absolute left-2 right-2 rounded-lg border-l-4 p-2 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${colorClass}`} 
                     style={{ top: `${startOffset}px`, height: `${Math.max(30, duration)}px` }}
                   >
                     <div className="flex justify-between items-start">
                       <p className="text-xs font-black line-clamp-1 flex-1 pr-2">{shift.jobTitle}</p>
                       <p className="text-[10px] font-bold bg-white/60 px-1 rounded shrink-0">{times.start} - {times.end}</p>
                     </div>
                     <span className="text-[9px] font-bold uppercase block mt-1 opacity-80">
                       {isActive ? 'Đang làm' : isCompleted ? 'Đã xong' : 'Sắp tới'}
                     </span>
                   </div>
                 );
              })}
            </div>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              {primaryShift ? (
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#1b61c9] to-[#0c84d9] px-5 py-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">Đang thực hiện</p>
                    <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-white">
                      Đang làm việc
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 max-w-[240px]">
                    <p className="text-[12px] uppercase tracking-[0.4em] text-white/60">Ca làm</p>
                    <h3 className="text-2xl font-black leading-tight">{primaryShift.jobTitle || 'Ca của bạn'}</h3>
                    <p className="text-sm text-white/80">{primaryShift.employerName || 'Nhà tuyển dụng'}</p>
                  </div>
                  <div className="mt-6">
                    <WorkTimer
                      checkInTime={(primaryShift as any).check_in_time || primaryShift.checkInTime}
                      variant="hero"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span>{locationLabel}</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a] shadow-lg shadow-black/20 transition-all active:scale-[0.98]"
                      onClick={() => {
                        checkOutMutation.mutate(
                          {
                            applicationId: primaryShift.id,
                            candidateId: userProfile?.uid || '',
                            latitude: geo.latitude,
                            longitude: geo.longitude,
                            accuracy: geo.accuracy || 30,
                          },
                          {
                            onSuccess: () => toast.success('Check-out thành công!'),
                            onError: (err: any) => {
                              console.error('Check-out error:', err);
                              toast.error(`Check-out lỗi: ${err.message}`);
                            },
                          }
                        );
                      }}
                    >
                      {checkOutMutation.isPending ? 'Đang xử lý...' : 'Kết thúc ca'}
                    </button>
                    <button
                      onClick={() => setSelectedShift(primaryShift)}
                      className="rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white/20 active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Mã QR
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-slate-100 bg-white shadow-sm px-5 py-6 text-center">
                  <p className="text-lg font-bold text-slate-900">Bạn chưa check-in ca nào</p>
                  <p className="text-sm text-slate-500 mt-1">Check-in ca làm để đồng hồ thời gian bắt đầu theo dõi.</p>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Tiếp theo</p>
                  <h2 className="text-lg font-bold text-slate-900">Ca kế tiếp của bạn</h2>
                </div>
                <button className="text-sm font-bold text-blue-600">Tất cả</button>
              </div>
              {isLoading ? (
                <div className="rounded-[28px] border border-slate-100 bg-white p-4 text-sm text-slate-400 text-center shadow-sm">
                  Đang tải các ca tiếp theo...
                </div>
              ) : upcoming.length === 0 ? (
                <div className="rounded-[28px] border border-slate-100 bg-white p-4 text-sm text-slate-400 text-center shadow-sm">
                  Chưa có ca làm sắp tới nào.
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((shift) => (
                    <li key={shift.id} className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Ca / Lịch</p>
                          <h3 className="text-[15px] font-bold text-slate-900 truncate">{shift.jobTitle || 'Ca làm việc'}</h3>
                          {shift.employerName && (
                            <p className="text-[12px] text-slate-500">{shift.employerName}</p>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${
                            shift.status === 'APPROVED'
                              ? 'border border-blue-100 bg-blue-50 text-blue-600'
                              : 'border border-amber-100 bg-amber-50 text-amber-600'
                          }`}
                        >
                          {shift.status === 'APPROVED' ? 'Đã nhận' : 'Đang duyệt'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {shift.shiftTime || shift.shiftId || 'Ca chưa xác định'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {locationLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to="/candidate/chat"
                          search={{
                            applicationId: shift.id,
                            jobId: shift.jobId,
                            employerId: shift.employerId,
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 active:scale-[0.97]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </Link>
                        <button
                          disabled={shift.status !== 'APPROVED' || checkInMutation.isPending}
                          className="flex-1 min-w-[150px] rounded-xl border border-blue-300 bg-[#1e3a5f] px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#162d54] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                          onClick={() => {
                            checkInMutation.mutate(
                              {
                                applicationId: shift.id,
                                candidateId: userProfile?.uid || '',
                                latitude: geo.latitude,
                                longitude: geo.longitude,
                                accuracy: 30,
                              },
                              {
                                onSuccess: () => toast.success('Check-in thành công!'),
                                onError: (err: any) => {
                                  console.error('Check-in error:', err);
                                  toast.error(`Check-in lỗi [${err.code || 'unknown'}]: ${err.message}`);
                                },
                              }
                            );
                          }}
                        >
                          {checkInMutation.isPending ? 'Đang xử lý...' : 'CHECK-IN'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Lịch sử đã làm
              </h2>

              {historyItems.length === 0 ? (
                <div className="rounded-[28px] border border-slate-100 bg-white p-4 text-sm text-slate-400 italic shadow-sm">
                  Bạn chưa hoàn thành ca làm nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((shift) => (
                    <div
                      key={shift.id}
                      className="rounded-[24px] border-l-4 border-slate-300 border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                      onClick={() => setSelectedShift(shift)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{shift.jobTitle || 'Công việc'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] rounded-full bg-slate-100 px-1.5 py-0.5 font-bold uppercase text-slate-500">Xong</span>
                            {shift.updatedAt && (
                              <p className="text-[11px] text-slate-400">
                                {(shift.updatedAt.toDate?.() ?? new Date(shift.updatedAt)).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">Xem chi tiết →</span>
                          <div className="rounded-full bg-emerald-50 p-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                        </div>
                      </div>

                      {shift.status === 'CASH_CONFIRMATION' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmPayment(shift.id, {
                              onSuccess: () => toast.success('Xác nhận nhận tiền thành công!')
                            });
                          }}
                          disabled={isConfirming}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-[14px] font-black text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-emerald-700 active:scale-[0.97] disabled:opacity-60"
                        >
                          {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                          XÁC NHẬN ĐÃ NHẬN TIỀN
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewModal(shift);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] font-bold text-amber-700 transition-colors hover:bg-amber-100 active:scale-[0.97]"
                        >
                          <Star className="h-4 w-4 text-amber-500" />
                          Đánh giá nhà tuyển dụng
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <ShiftDetailModal shift={selectedShift} onClose={() => setSelectedShift(null)} />
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewData.isOpen}
        onClose={() => setReviewData(prev => ({ ...prev, isOpen: false }))}
        applicationId={reviewData.applicationId}
        reviewerId={userProfile?.uid || ''}
        revieweeId={reviewData.employerId}
        revieweeName={reviewData.employerName}
        jobTitle={reviewData.jobTitle}
      />
    </div>
  );
}
