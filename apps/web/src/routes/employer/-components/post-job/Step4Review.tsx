import { CalendarClock, Check, DollarSign, ImagePlus, MapPin, Sparkles, Trash2, UsersRound, Clock, WalletCards, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { formatSalary, type JobFormState } from '../../post-job-types';
import type { PayType } from '../../-schemas/jobFormSchema';
import { type Shift } from '../../post-job-types';
import { calculateBudget } from '../../-utils/budgetCalculations';


interface Step4ReviewProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  fileInputId: string;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  balance: number;
}

export default function Step4Review({
  form,
  setForm,
  fileInputId,
  handleImageSelect,
  balance,
}: Step4ReviewProps) {
  const navigate = useNavigate();
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
                {form.shifts.map((s: Shift) => (
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

          {/* Payment Method Selection */}
          <div className="pt-4 mt-2 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-800 mb-3">Phương thức trả lương</h3>
             <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => setForm(p => ({ ...p, paymentMethod: 'WALLET' }))}
                 className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                   form.paymentMethod === 'WALLET' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-slate-100 bg-white hover:border-slate-300'
                 }`}
               >
                 <div className={`p-2 rounded-full ${form.paymentMethod === 'WALLET' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <WalletCards className="w-5 h-5" />
                 </div>
                 <span className={`text-[13px] font-bold ${form.paymentMethod === 'WALLET' ? 'text-[#1e3a5f]' : 'text-slate-500'}`}>Ví JobNow</span>
               </button>

               <button
                 type="button"
                 onClick={() => setForm(p => ({ ...p, paymentMethod: 'CASH' }))}
                 className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                   form.paymentMethod === 'CASH' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-slate-100 bg-white hover:border-slate-300'
                 }`}
               >
                 <div className={`p-2 rounded-full ${form.paymentMethod === 'CASH' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <DollarSign className="w-5 h-5" />
                 </div>
                 <span className={`text-[13px] font-bold ${form.paymentMethod === 'CASH' ? 'text-[#1e3a5f]' : 'text-slate-500'}`}>Tiền mặt</span>
               </button>
             </div>

             {form.paymentMethod === 'WALLET' && (
               <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[12px] text-slate-500 font-medium">Số dư hiện tại</span>
                   <span className="text-[14px] font-black text-slate-900">{balance.toLocaleString('vi-VN')}đ</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[12px] text-slate-500 font-medium">Ngân sách dự kiến</span>
                   <span className={`text-[14px] font-black ${balance < budgetResult.totalBudget ? 'text-rose-600' : 'text-[#1e3a5f]'}`}>
                     {budgetResult.totalBudget.toLocaleString('vi-VN')}đ
                   </span>
                 </div>
                 {balance < budgetResult.totalBudget && (
                   <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                      <p className="text-[11px] font-bold text-rose-500 flex-1 leading-tight">⚠️ Số dư không đủ để thanh toán qua ví. Hãy chọn tiền mặt hoặc nạp thêm.</p>
                      <button
                        type="button"
                        onClick={() => navigate({ to: '/employer/wallet' })}
                        className="px-3 py-2 bg-[#1e3a5f] text-white text-[11px] font-bold rounded-xl active:scale-95 transition-transform"
                      >
                        Nạp thêm
                      </button>
                   </div>
                 )}
               </div>
             )}

             {form.paymentMethod === 'CASH' && (
               <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-amber-900 font-bold leading-relaxed">
                   Lưu ý: Bạn chọn trả tiền mặt cho ứng viên sau ca làm. Ứng viên cần xác nhận đã nhận tiền để hệ thống đóng ca làm.
                 </p>
               </div>
             )}
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
