import { createFileRoute, Link } from '@tanstack/react-router';
import { CalendarDays, Clock, MapPin, MessageCircle, Timer } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useGeolocation } from '@/features/jobs/hooks/useGeolocation';
import { useCheckIn, useCheckOut } from '@/features/jobs/hooks/useCheckIn';

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

  const activeShifts = applications.filter((app) => app.status === 'CHECKED_IN');
  const upcoming = applications.filter((app) => app.status === 'APPROVED' || app.status === 'NEW' || app.status === 'PENDING');

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

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            Đang làm
          </h2>

          {activeShifts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-500">
              Bạn chưa check-in ca nào.
            </div>
          ) : (
            <div className="space-y-3">
              {activeShifts.map((shift) => (
                <div key={shift.id} className="bg-white rounded-2xl border-l-4 border-emerald-500 border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">Đơn #{shift.id.slice(0, 8)}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Trạng thái: {shift.status}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">ĐANG LÀM</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/candidate/chat"
                      search={{ applicationId: shift.id }}
                      className="px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-semibold inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Link>
                    <button
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                      onClick={() => checkOutMutation.mutate({ applicationId: shift.id, candidateId: userProfile?.uid || '' })}
                    >
                      {checkOutMutation.isPending ? 'Đang xử lý...' : 'CHECK-OUT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Sắp tới
          </h2>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-500">Đang tải ca làm...</div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-sm text-slate-500">
              Chưa có ca làm sắp tới.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((shift) => (
                <div key={shift.id} className="bg-white rounded-2xl border-l-4 border-primary-400 border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Đơn #{shift.id.slice(0, 8)}</h3>
                      <p className="text-xs text-slate-500">Ứng tuyển: {shift.createdAt?.toDate?.()?.toLocaleString?.() || 'N/A'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                      {shift.status === 'APPROVED' ? 'Đã nhận' : 'Chờ duyệt'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Shift: {shift.shiftId || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      GPS {geo.isDefault ? 'mặc định' : 'thật'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/candidate/chat"
                      search={{ applicationId: shift.id }}
                      className="px-3 py-2 rounded-xl border border-indigo-200 text-indigo-600 bg-indigo-50 text-sm font-semibold inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Link>
                    <button
                      disabled={shift.status !== 'APPROVED' || checkInMutation.isPending}
                      className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl disabled:bg-slate-100 disabled:text-slate-400"
                      onClick={() => checkInMutation.mutate({
                        applicationId: shift.id,
                        candidateId: userProfile?.uid || '',
                        latitude: geo.latitude,
                        longitude: geo.longitude,
                        accuracy: 30,
                      })}
                    >
                      {checkInMutation.isPending ? 'Đang check-in...' : 'CHECK-IN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
