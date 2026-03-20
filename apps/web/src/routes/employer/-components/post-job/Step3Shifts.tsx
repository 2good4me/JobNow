import { Clock, Minus, Plus, X, AlertCircle, DollarSign, CheckCircle2 } from 'lucide-react';
import { type JobFormState, type Shift, formatSalary } from '../../post-job';
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
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Chọn ca làm việc <span className="text-rose-400 dark:text-rose-500">*</span></h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Thêm các ca làm việc cho công việc này.</p>
        </div>

        {errors.shifts && (
          <div className="mb-4 flex gap-3 rounded-xl border border-rose-300 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-900/20 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-500 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{errors.shifts}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {form.shifts.map((shift, idx) => {
            const timeError = getTimeError(shift);
            return (
              <div
                key={shift.id}
                className={`rounded-xl border p-3 relative group transition-colors ${
                  timeError
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50/80 dark:bg-rose-900/10'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => removeShift(shift.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  aria-label="Xóa ca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="mb-2">
                  <input
                    value={shift.name}
                    onChange={e => updateShift(shift.id, { name: e.target.value })}
                    placeholder={`Ca ${idx + 1} (VD: Ca sáng)`}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                      shift.name.trim() === ''
                        ? 'border-rose-300 dark:border-rose-500/50 bg-white dark:bg-[#0f172a] focus:border-rose-500'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0f172a] focus:border-emerald-500'
                    }`}
                  />
                  {shift.name.trim() === '' && (
                    <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 Tên ca không được để trống</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="block">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bắt đầu</span>
                    <div className="relative mt-0.5">
                      <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={e => updateShift(shift.id, { startTime: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0f172a] py-2 pl-8 pr-2 text-sm text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kết thúc</span>
                    <div className="relative mt-0.5">
                      <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={e => updateShift(shift.id, { endTime: e.target.value })}
                        className={`w-full rounded-lg border py-2 pl-8 pr-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                          timeError
                            ? 'border-rose-400 dark:border-rose-500/50 bg-rose-100 dark:bg-rose-900/20 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0f172a] focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {timeError && (
                  <p className="mb-2 text-xs font-semibold text-rose-600 dark:text-rose-400">⏰ {timeError}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Số lượng cần</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateShift(shift.id, { quantity: Math.max(1, shift.quantity - 1) })}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0f172a] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-slate-200">{shift.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateShift(shift.id, { quantity: shift.quantity + 1 })}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0f172a] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
          className="mt-3 w-full cursor-pointer rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm ca làm việc
        </button>
      </section>

      {/* Total Budget Display with Breakdown */}
      <section className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/10 p-4 shadow-md transition-colors duration-300">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Tổng ngân sách dự kiến</h3>
        </div>

        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">
          {formatSalary(String(budgetResult.totalBudget))} VNĐ
        </p>

        {/* Breakdown Details */}
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-500 uppercase">Chi tiết tính toán</p>
          {budgetResult.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between text-xs">
                <span className="text-emerald-800 dark:text-emerald-200">{item.label}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatSalary(String(item.amount))} VNĐ
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Explanation & Total Hours (if applicable) */}
        <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-2">{budgetResult.explanation}</p>
          {budgetResult.workingHours && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ⏱️ <strong>Tổng số giờ:</strong> {budgetResult.workingHours.toFixed(1)} giờ
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
