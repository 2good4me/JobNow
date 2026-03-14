import { CalendarClock, Check, DollarSign, ImagePlus, MapPin, Sparkles, Trash2, UsersRound, CheckCircle2 } from 'lucide-react';
import { formatSalary, type JobFormState } from '../../post-job';
import type { PayType } from '../../-schemas/jobFormSchema';
import { calculateBudget } from '../../-utils/budgetCalculations';

interface Step4ReviewProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  fileInputId: string;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Step4Review({
  form,
  setForm,
  fileInputId,
  handleImageSelect,
}: Step4ReviewProps) {
  // Calculate budget using new utility
  const salary = Number(form.salary.replace(/\D/g, '')) || 0;
  const budgetResult = calculateBudget(form.payType as PayType, salary, form.vacancies, form.shifts);

  return (
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Kiểm tra lại lần cuối</h2>
        <p className="mt-1 mb-4 text-xs text-slate-500 dark:text-slate-400">Đảm bảo mọi thông tin đều chính xác trước khi đăng tuyển.</p>

        {/* Image upload */}
        <label
          htmlFor={fileInputId}
          className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 py-6 transition-colors hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
        >
          {form.coverImage ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{form.coverImage.name}</span>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setForm(p => ({ ...p, coverImage: null }));
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer"
                aria-label="Xóa ảnh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Tải ảnh lên</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">JPG, PNG tối đa 5MB</span>
            </>
          )}
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        {/* Summary card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f2937] p-4 space-y-3 transition-colors duration-300">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{form.title || '(Chưa có tiêu đề)'}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{form.category || '(Chưa chọn)'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="font-medium">{formatSalary(form.salary)}đ / {form.payType.replace('Theo ', '')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 dark:text-rose-500" />
              <span className="font-medium truncate">{form.address || '(Chưa có)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <UsersRound className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="font-medium">{form.vacancies} người — {form.gender}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <CalendarClock className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span className="font-medium">{form.startDate || '(Chưa chọn)'}</span>
            </div>
          </div>

          {form.description && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Mô tả</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-3">{form.description}</p>
            </div>
          )}

          {form.shifts && form.shifts.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1.5">Ca làm việc ({form.shifts.length})</p>
              <div className="space-y-1">
                {form.shifts.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#0f172a] rounded-lg px-3 py-1.5"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{s.name || 'Ca'}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {s.startTime} — {s.endTime} · {s.quantity} người
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Budget Display with Breakdown */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Tổng ngân sách dự kiến</p>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">{form.payType}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatSalary(String(budgetResult.totalBudget))} VNĐ</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-500">{budgetResult.summaryLine}</p>

            {/* Breakdown Details */}
            {budgetResult.breakdown.length > 0 && (
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/50 space-y-1">
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-500 uppercase">Tính toán</p>
                {budgetResult.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                    <span className="text-emerald-800 dark:text-emerald-200 flex-1">{item.label}</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatSalary(String(item.amount))} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Working hours (for HOURLY) */}
            {budgetResult.workingHours && (
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  ⏱️ <strong>Tổng số giờ:</strong> {budgetResult.workingHours.toFixed(1)} giờ
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium upsell */}
      <section
        onClick={() => setForm(p => ({ ...p, isPremium: !p.isPremium }))}
        className={`cursor-pointer rounded-2xl p-4 shadow-md transition-all duration-200 relative overflow-hidden ${
          form.isPremium
            ? 'border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
            : 'border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] backdrop-blur-md'
        }`}
      >
        {form.isPremium && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tuyển dụng nhanh gấp 3 lần</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tin đăng sẽ được ưu tiên hiển thị ở vị trí đầu tiên.
            </p>
          </div>
        </div>
      </section>

      {/* Terms */}
      <p className="text-center text-[11px] text-slate-400">
        Bằng cách đăng tin, bạn đồng ý với{' '}
        <span className="text-emerald-600 cursor-pointer hover:underline">Điều khoản dịch vụ</span> và{' '}
        <span className="text-emerald-600 cursor-pointer hover:underline">Chính sách bảo mật</span>.
      </p>
    </div>
  );
}
