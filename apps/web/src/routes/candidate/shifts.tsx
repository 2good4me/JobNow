import { createFileRoute, Link } from '@tanstack/react-router';
import { CalendarDays, Clock, MessageCircle, Timer, CheckCircle2, History, Star, DollarSign, Loader2, AlertCircle, X, LogIn, LogOut, Clock3 } from 'lucide-react';
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

function WorkTimer({ checkInTime }: { checkInTime: any }) {
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

  return (
    <div className="flex items-center gap-1.5 text-emerald-600 font-mono font-bold text-sm">
      <Timer className="w-3.5 h-3.5 animate-pulse" />
      {duration || '00:00:00'}
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

  const activeShifts = applications.filter((app) => app.status === 'CHECKED_IN');
  const upcoming = applications.filter((app) => app.status === 'APPROVED' || app.status === 'NEW' || app.status === 'PENDING');
  const historyItems = applications.filter((app) => app.status === 'COMPLETED' || app.status === 'CASH_CONFIRMATION');

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
        {/* --- ĐANG LÀM --- */}
        <div>
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            Đang làm
          </h2>

          {activeShifts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-500 italic">
              Bạn chưa check-in ca nào.
            </div>
          ) : (
            <div className="space-y-3">
              {activeShifts.map((shift) => (
                <div key={shift.id} className="bg-white rounded-2xl border-l-4 border-emerald-500 border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-bold text-slate-900 truncate">{shift.jobTitle || 'Công việc không xác định'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {(shift as any).isLate || (shift as any).is_late ? (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded border border-rose-100">MUỘN</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full border border-emerald-100 block mb-1">ĐANG LÀM</span>
                      <WorkTimer checkInTime={(shift as any).check_in_time || (shift as any).checkInTime} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Link
                      to="/candidate/chat"
                      search={{ 
                        applicationId: shift.id,
                        jobId: shift.jobId,
                        employerId: shift.employerId
                      }}
                      className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Link>
                    <button
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/10 transition-all active:scale-95 flex-1"
                      onClick={() => {
                        checkOutMutation.mutate(
                          { 
                            applicationId: shift.id, 
                            candidateId: userProfile?.uid || '',
                            latitude: geo.latitude,
                            longitude: geo.longitude,
                            accuracy: geo.accuracy || 30
                          },
                          {
                            onSuccess: () => toast.success('Check-out thành công!'),
                            onError: (err: any) => {
                              console.error('Check-out error:', err);
                              toast.error(`Check-out lỗi: ${err.message}`);
                            }
                          }
                        );
                      }}
                    >
                      {checkOutMutation.isPending ? 'Đang xử lý...' : 'CHECK-OUT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- SẮP TỚI --- */}
        <div>
          <h2 className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Sắp tới
          </h2>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-400">Đang tải...</div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-400 italic">
              Chưa có ca làm sắp tới.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((shift) => (
                <div key={shift.id} className="bg-white rounded-2xl border-l-4 border-blue-400 border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{shift.jobTitle || 'Công việc'}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      shift.status === 'APPROVED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {shift.status === 'APPROVED' ? 'Đã nhận' : 'Đang duyệt'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Ca: {shift.shiftTime || shift.shiftId || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/candidate/chat"
                      search={{ 
                        applicationId: shift.id,
                        jobId: shift.jobId,
                        employerId: shift.employerId
                      }}
                      className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Link>
                    <button
                      disabled={shift.status !== 'APPROVED' || checkInMutation.isPending}
                      className="px-6 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl disabled:bg-slate-100 disabled:text-slate-300 shadow-lg shadow-blue-900/10 active:scale-95 transition-all flex-1"
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
                            }
                          }
                        );
                      }}
                    >
                      {checkInMutation.isPending ? 'Đang xử lý...' : 'CHECK-IN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- LỊCH SỬ --- */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Lịch sử đã làm
          </h2>

          {historyItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-400 italic">
              Bạn chưa hoàn thành ca làm nào.
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white rounded-2xl border-l-4 border-slate-300 border border-slate-100 shadow-sm p-4 opacity-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedShift(shift)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{shift.jobTitle || 'Công việc'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Xong</span>
                        {shift.updatedAt && (
                          <p className="text-[11px] text-slate-400">
                            {(shift.updatedAt.toDate?.() ?? new Date(shift.updatedAt)).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Xem chi tiết →</span>
                      <div className="bg-emerald-50 p-1.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-[14px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95 disabled:opacity-50"
                    >
                      {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                      XÁC NHẬN ĐÃ NHẬN TIỀN
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewModal(shift);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-[13px] font-bold hover:bg-amber-100 transition-colors active:scale-[0.98]"
                    >
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      Đánh giá nhà tuyển dụng
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
