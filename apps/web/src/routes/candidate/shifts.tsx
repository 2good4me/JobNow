import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  CalendarDays, Clock, MapPin, CheckCircle2, Timer,
  ChevronRight, TrendingUp, Wallet
} from 'lucide-react';

export const Route = createFileRoute('/candidate/shifts')({
  component: CandidateShifts,
});

/* ── Mock shift data ──────────────────────────── */
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const TODAY_INDEX = new Date().getDay(); // 0=CN
const CURRENT_DAY_INDEX = TODAY_INDEX === 0 ? 6 : TODAY_INDEX - 1;

const MOCK_SHIFTS = {
  active: {
    id: 's1',
    employer: 'Quán Mộc Cafe',
    role: 'Phục vụ bàn',
    timeStart: '08:00',
    timeEnd: '12:00',
    remaining: '1h 25p',
    address: '123 Nguyễn Huệ, Q1',
    salary: '35,000đ/h',
  },
  upcoming: [
    {
      id: 's2',
      employer: 'Nhà hàng ABC',
      role: 'Chạy bàn',
      timeStart: '18:00',
      timeEnd: '22:00',
      address: '456 Lê Lợi, Q1',
      salary: '40,000đ/h',
      status: 'confirmed' as const,
    },
    {
      id: 's3',
      employer: 'EventPro VN',
      role: 'PG sự kiện',
      timeStart: '09:00',
      timeEnd: '17:00',
      date: 'Thứ 4, 16/03',
      address: '789 CMT8, Q3',
      salary: '80,000đ/h',
      status: 'pending' as const,
    },
  ],
};

function CandidateShifts() {
  const { userProfile } = useAuth();

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* ── Header ───────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 font-heading">Ca làm của tôi</h1>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button className="px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md shadow-sm">
                Tuần
              </button>
              <button className="px-3 py-1.5 text-slate-500 text-xs font-medium hover:text-slate-700">
                Tháng
              </button>
            </div>
          </div>

          {/* ── Week Calendar Strip ────────────────── */}
          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day, i) => {
              const isToday = i === CURRENT_DAY_INDEX;
              const hasShift = i === CURRENT_DAY_INDEX || i === CURRENT_DAY_INDEX + 1 || i === CURRENT_DAY_INDEX + 2;
              const dateNum = new Date().getDate() - CURRENT_DAY_INDEX + i;
              return (
                <button
                  key={day}
                  className={`
                                        flex flex-col items-center py-2 rounded-xl transition-all text-center
                                        ${isToday
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                      : 'hover:bg-slate-100'
                    }
                                    `}
                >
                  <span className={`text-[10px] font-medium ${isToday ? 'text-primary-100' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <span className={`text-sm font-bold mt-0.5 ${isToday ? 'text-white' : 'text-slate-700'}`}>
                    {dateNum > 0 ? dateNum : 30 + dateNum}
                  </span>
                  {hasShift && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? 'bg-white' : 'bg-primary-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* ── Active Shift Card ──────────────────── */}
        <div>
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang làm
          </h2>
          <div className="bg-white rounded-2xl border-l-4 border-emerald-500 border border-slate-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900">{MOCK_SHIFTS.active.employer}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{MOCK_SHIFTS.active.role}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full">
                ĐANG LÀM
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {MOCK_SHIFTS.active.timeStart} - {MOCK_SHIFTS.active.timeEnd}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {MOCK_SHIFTS.active.address}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-600">
                  Còn {MOCK_SHIFTS.active.remaining}
                </span>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                CHECK-OUT
              </button>
            </div>
          </div>
        </div>

        {/* ── Upcoming Shifts ─────────────────────── */}
        <div>
          <h2 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Sắp tới
          </h2>
          <div className="space-y-3">
            {MOCK_SHIFTS.upcoming.map((shift) => (
              <div
                key={shift.id}
                className="bg-white rounded-2xl border-l-4 border-primary-400 border border-slate-100 shadow-sm p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{shift.employer}</h3>
                    <p className="text-xs text-slate-500">{shift.role}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${shift.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                    {shift.status === 'confirmed' ? '✓ Đã xác nhận' : '⏳ Chờ duyệt'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {shift.timeStart} - {shift.timeEnd}
                  </span>
                  {shift.date && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {shift.date}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">{shift.salary}</span>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-semibold rounded-xl cursor-not-allowed"
                  >
                    CHECK-IN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Weekly Stats ────────────────────────── */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-4 shadow-lg text-white">
          <h3 className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Thống kê
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-[10px] text-primary-200 mt-0.5">ca tuần này</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12h</div>
              <div className="text-[10px] text-primary-200 mt-0.5">tổng giờ</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center gap-0.5">
                <Wallet className="w-4 h-4" /> 420k
              </div>
              <div className="text-[10px] text-primary-200 mt-0.5">thu nhập</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-primary-500/40 text-center">
            <span className="text-[11px] text-primary-200">
              Tháng này: 12 ca · 48 giờ · <span className="text-white font-bold">1,680,000đ</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
