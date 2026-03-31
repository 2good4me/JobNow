import { CalendarClock, Check, DollarSign, ImagePlus, MapPin, Sparkles, Trash2, UsersRound, Clock } from 'lucide-react';
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
    <div className="w-full shrink-0 px-4 space-y-4">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Kiểm tra lại lần cuối</h2>
        <p className="mt-1 mb-5 text-[13px] text-slate-500">Đảm bảo mọi thông tin đều chính xác trước khi đăng tuyển.</p>

        {/* Image upload */}
        <label
          htmlFor={fileInputId}
          className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 transition-colors hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"
        >
          {form.coverImage ? (
            <div className="flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-[13px] font-bold text-slate-700">{form.coverImage.name}</span>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setForm(p => ({ ...p, coverImage: null }));
                }}
                className="text-slate-400 hover:text-rose-500 cursor-pointer bg-white rounded-full p-1 border border-slate-200 shadow-sm transition-colors"
                aria-label="Xóa ảnh"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
                <ImagePlus className="w-6 h-6" />
              </div>
              <span className="text-[13px] font-bold text-slate-600">Thêm ảnh bìa công việc</span>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">Định dạng JPG, PNG (tối đa 5MB)</span>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[#1e3a5f] leading-snug">{form.title || '(Chưa có tiêu đề)'}</h3>
            <span className="inline-block mt-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">{form.category || '(Chưa chọn)'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="font-bold">{formatSalary(form.salary)}đ / {form.payType.replace('Theo ', '')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="font-semibold truncate">{form.address || '(Chưa có)'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                <UsersRound className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="font-semibold">{form.vacancies} người — {form.gender}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
                <CalendarClock className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <span className="font-semibold">{form.startDate || '(Chưa chọn)'}</span>
            </div>
          </div>

          {form.description && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">Mô tả công việc</p>
              <p className="text-[13px] text-slate-700 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">{form.description}</p>
            </div>
          )}

          {form.shifts && form.shifts.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[12px] text-slate-500 font-bold mb-2 uppercase tracking-wider">Ca làm ({form.shifts.length})</p>
              <div className="space-y-1.5">
                {form.shifts.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-[13px] bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100"
                  >
                    <span className="text-[#1e3a5f] font-bold">{s.name || 'Ca'}</span>
                    <span className="text-slate-500 font-medium">
                      {s.startTime} — {s.endTime} <span className="text-slate-300 mx-1">|</span> <span className="font-bold text-slate-700">{s.quantity} người</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Budget Display with Breakdown */}
          <div className="pt-3 mt-1 border-t-2 border-slate-100">
            <div className="bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e40af]/10 rounded-xl p-4 border border-[#1e3a5f]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1e3a5f]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between relative z-10">
                <p className="text-[13px] text-slate-600 font-bold">Tổng ngân sách dự kiến</p>
                <span className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-md">{form.payType}</span>
              </div>
              <p className="text-2xl font-black text-[#1e3a5f] mt-1 relative z-10">{formatSalary(String(budgetResult.totalBudget))} VNĐ</p>
              <p className="text-[11px] font-medium text-slate-600 mt-1 relative z-10">{budgetResult.summaryLine}</p>

              {/* Working hours (for HOURLY) */}
              {budgetResult.workingHours && (
                <div className="mt-3 pt-3 border-t border-[#1e3a5f]/10 relative z-10">
                  <p className="text-[12px] font-bold text-[#006399] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Tổng thời gian: {budgetResult.workingHours.toFixed(1)} giờ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Premium upsell */}
      <section
        onClick={() => setForm(p => ({ ...p, isPremium: !p.isPremium }))}
        className={`cursor-pointer rounded-2xl p-5 shadow-sm transition-all duration-200 relative overflow-hidden ${
          form.isPremium
            ? 'border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
            : 'border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
        }`}
      >
        {form.isPremium && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Tuyển dụng nhanh gấp 3 lần</h3>
            <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
              Tin đăng sẽ được ưu tiên hiển thị nổi bật ở vị trí đầu tiên.
            </p>
          </div>
        </div>
      </section>

      {/* Terms */}
      <p className="text-center text-[12px] font-medium text-slate-400 pt-2 pb-6 px-4">
        Bằng cách đăng tin, bạn đồng ý với{' '}
        <span className="text-[#1e3a5f] font-bold cursor-pointer hover:underline">Điều khoản dịch vụ</span> và{' '}
        <span className="text-[#1e3a5f] font-bold cursor-pointer hover:underline">Chính sách bảo mật</span>.
      </p>
    </div>
  );
}
