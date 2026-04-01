import { Clock, Minus, Plus, X, AlertCircle, DollarSign, CheckCircle2 } from 'lucide-react';
import { type JobFormState, type Shift, formatSalary } from '../../post-job-types';
import type { PayType } from '../../-schemas/jobFormSchema';
import { calculateBudget } from '../../-utils/budgetCalculations';

interface Step3ShiftsProps {
  form: JobFormState;
  addShift: () => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
  errors: Partial<Record<keyof JobFormState, string>>;
}

export default function Step3Shifts({
  form,
  addShift,
  updateShift,
  removeShift,
  errors,
}: Step3ShiftsProps) {
  // Calculate time validation for a shift (for real-time UX feedback)
  const getTimeError = (shift: Shift): string | null => {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    if (endMins < startMins) {
      return 'Giờ kết thúc phải >= giờ bắt đầu';
    }
    return null;
  };

  // Calculate total budget using new utility
  const salary = Number(form.salary.replace(/\D/g, '')) || 0;
  const budgetResult = calculateBudget(form.payType as PayType, salary, form.vacancies, form.shifts);

  return (
    <div className="w-full shrink-0 px-4 space-y-4">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Chọn ca làm việc <span className="text-rose-500">*</span></h2>
          <p className="mt-1 text-[13px] text-slate-500">Thêm các ca làm việc cho công việc này.</p>
        </div>

        {errors.shifts && (
          <div className="mb-4 flex gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-rose-700">{errors.shifts}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {form.shifts.map((shift: Shift, idx: number) => {
            const timeError = getTimeError(shift);
            return (
              <div
                key={shift.id}
                className={`rounded-2xl border-2 p-4 relative group transition-colors ${
                  timeError
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => removeShift(shift.id)}
                  className="absolute -top-3 -right-3 w-7 h-7 bg-rose-50 border-2 border-white text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:bg-rose-100 hover:text-rose-600"
                  aria-label="Xóa ca"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="mb-3">
                  <input
                    value={shift.name}
                    onChange={e => updateShift(shift.id, { name: e.target.value })}
                    placeholder={`Ca ${idx + 1} (VD: Ca sáng)`}
                    className={`w-full rounded-xl border px-3 py-3 text-sm font-bold text-[#1e3a5f] focus:outline-none transition-colors ${
                      shift.name.trim() === ''
                        ? 'border-rose-300 bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 bg-white focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
                    }`}
                  />
                  {shift.name.trim() === '' && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">Tên ca không được để trống</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="block">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Bắt đầu</span>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={e => updateShift(shift.id, { startTime: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-2 text-sm text-slate-800 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-colors"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kết thúc</span>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={e => updateShift(shift.id, { endTime: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 pl-9 pr-2 text-sm text-slate-800 focus:outline-none transition-colors ${
                          timeError
                            ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-200 bg-white focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {timeError && (
                  <p className="mb-3 text-xs font-semibold text-rose-600">⏰ {timeError}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 mt-2">
                  <span className="text-[13px] font-bold text-slate-700">Số lượng cần</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateShift(shift.id, { quantity: Math.max(1, shift.quantity - 1) })}
                      className="w-8 h-8 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors active:scale-95"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-[#1e3a5f]">{shift.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateShift(shift.id, { quantity: shift.quantity + 1 })}
                      className="w-8 h-8 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors active:scale-95"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addShift}
          className="mt-4 w-full cursor-pointer rounded-xl border-2 border-dashed border-[#1e3a5f]/30 bg-[#1e3a5f]/5 py-3.5 text-sm font-bold text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm ca làm việc
        </button>
      </section>

      {/* Total Budget Display with Breakdown */}
      <section className="rounded-2xl border-2 border-[#1e3a5f]/20 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e40af]/10 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[#1e3a5f]" />
          </div>
          <h3 className="text-[15px] font-bold text-[#1e3a5f]">Ngân sách dự kiến</h3>
        </div>

        <p className="text-3xl font-black text-[#1e3a5f] tracking-tight mb-4 drop-shadow-sm">
          {formatSalary(String(budgetResult.totalBudget))} <span className="text-xl font-bold text-[#1e3a5f]/70">VNĐ</span>
        </p>

        {/* Breakdown Details */}
        <div className="space-y-2.5 mb-4 rounded-xl bg-white/60 backdrop-blur pb-3 px-3 pt-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Chi tiết tính toán</p>
          {budgetResult.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between text-[13px]">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="font-bold text-[#1e3a5f]">
                  {formatSalary(String(item.amount))} VNĐ
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation & Total Hours (if applicable) */}
        <div className="pt-3 border-t border-[#1e3a5f]/10">
          <p className="text-[12px] font-medium text-slate-600 mb-2 leading-relaxed">{budgetResult.explanation}</p>
          {budgetResult.workingHours && (
            <p className="text-[13px] font-bold text-[#006399]">
              ⏱️ Tổng thời gian: {budgetResult.workingHours.toFixed(1)} giờ
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
