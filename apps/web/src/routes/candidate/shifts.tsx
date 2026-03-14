import { createFileRoute, Link } from '@tanstack/react-router';
import { CalendarDays, Clock, MessageCircle, Timer, CheckCircle2, History, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useGeolocation } from '@/features/jobs/hooks/useGeolocation';
import { useCheckIn, useCheckOut } from '@/features/jobs/hooks/useCheckIn';
import { useState } from 'react';
import { ReviewModal } from '@/features/jobs/components/ReviewModal';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/shifts')({
  component: CandidateShifts,
});

function CandidateShifts() {
  const { userProfile } = useAuth();
  const geo = useGeolocation();
  const { data: applications = [], isLoading } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

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
  const completed = applications.filter((app) => app.status === 'COMPLETED');

  const openReviewModal = (app: any) => {
    setReviewData({
      isOpen: true,
      applicationId: app.id,
      employerId: app.employerId || app.employer_id, // Support both
      employerName: app.employerName || 'Nhà tuyển dụng',
      jobTitle: app.jobTitle || `Đơn ID: ...${app.id.slice(-6).toUpperCase()}`,
    });
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-slate-900 font-heading">Ca làm của tôi</h1>
            <span className="text-xs font-semibold text-slate-500">Realtime</span>
          </div>
          <p className="text-xs text-slate-500">Vị trí hiện tại: {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</p>
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
                    <div>
                      <h3 className="font-bold text-slate-900">{shift.jobTitle || 'Công việc không xác định'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Mã đơn: ...{shift.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">ĐANG LÀM</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Link
                      to="/candidate/chat"
                      search={{ applicationId: shift.id }}
                      className="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Link>
                    <button
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/10 transition-all active:scale-95 flex-1"
                      onClick={() => {
                        checkOutMutation.mutate(
                          { applicationId: shift.id, candidateId: userProfile?.uid || '' },
                          {
                            onSuccess: () => toast.success('Check-out thành công!'),
                            onError: (err: any) => {
                              console.error('Check-out error:', err);
                              toast.error(`Check-out lỗi [${err.code || 'unknown'}]: ${err.message}`);
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
                      <p className="text-[11px] text-slate-400 font-medium font-mono">Mã đơn: ...{shift.id.slice(-6).toUpperCase()}</p>
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
                      search={{ applicationId: shift.id }}
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

          {completed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-400 italic">
              Bạn chưa hoàn thành ca làm nào.
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((shift) => (
                <div key={shift.id} className="bg-white rounded-2xl border-l-4 border-slate-300 border border-slate-100 shadow-sm p-4 opacity-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{shift.jobTitle || 'Công việc'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Xong</span>
                        <p className="text-[11px] text-slate-400 font-mono text-xs">Mã: ...{shift.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>

                  <button
                    onClick={() => openReviewModal(shift)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-[13px] font-bold hover:bg-amber-100 transition-colors active:scale-[0.98]"
                  >
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Đánh giá nhà tuyển dụng
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
