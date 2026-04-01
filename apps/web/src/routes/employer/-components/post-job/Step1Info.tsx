import { DollarSign, Tag, X, ChevronDown, Info } from 'lucide-react';
import { payTypes, type JobFormState, type PayType } from '../../post-job-types';
import { getSalaryLabel, getSalaryExplanation } from '../../-utils/budgetCalculations';

interface Step1InfoProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  errors: Partial<Record<keyof JobFormState, string>>;
  requirementInput: string;
  setRequirementInput: (val: string) => void;
  addRequirement: () => void;
  removeRequirement: (tag: string) => void;
  onCategoryClick: () => void;
}

export default function Step1Info({
  form,
  setForm,
  errors,
  requirementInput,
  setRequirementInput,
  addRequirement,
  removeRequirement,
  onCategoryClick,
}: Step1InfoProps) {
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const formattedSalary = digitsOnly ? Number(digitsOnly).toLocaleString('vi-VN') : '';
    setForm((p) => ({ ...p, salary: formattedSalary }));
  };


  return (
    <div className="w-full shrink-0 px-4 space-y-4">
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-900">Thông tin cơ bản</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-slate-700">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </span>
            <input
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="VD: Cần 2 bạn chạy bàn tiệc cưới"
              className={`w-full rounded-xl border px-3 py-3 text-sm text-slate-800 focus:outline-none transition-colors ${
                errors.title
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-200 bg-slate-50 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.title}</p>}
          </label>

          {/* Category with Bottom Sheet */}
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-slate-700">
              Danh mục <span className="text-rose-500">*</span>
            </p>
            <button
              type="button"
              onClick={onCategoryClick}
              className={`w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-semibold transition-all flex items-center justify-between ${
                errors.category
                  ? 'border-rose-300 bg-rose-50 text-slate-600 hover:bg-rose-100'
                  : form.category
                    ? 'border-[#1e3a5f]/30 bg-[#1e3a5f]/5 text-[#1e3a5f]'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>{form.category || 'Chọn danh mục...'}</span>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </button>
            {errors.category && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.category}</p>}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-slate-700">
              Mô tả <span className="text-rose-500">*</span>
            </span>
            <textarea
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={4}
              placeholder="Mô tả chi tiết công việc..."
              className={`w-full resize-none rounded-xl border px-3 py-3 text-sm text-slate-800 focus:outline-none transition-colors leading-relaxed ${
                errors.description
                  ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-200 bg-slate-50 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.description}</p>
            )}
          </label>

          {/* Requirements tag input */}
          <div>
            <span className="mb-1.5 block text-[13px] font-bold text-slate-700">Yêu cầu ứng viên</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={requirementInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequirementInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                  placeholder="VD: Giao tiếp tốt"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="cursor-pointer rounded-xl bg-[#1e3a5f]/10 px-4 text-sm font-bold text-[#1e3a5f] hover:bg-[#1e3a5f]/20 transition-colors"
              >
                Thêm
              </button>
            </div>
            {form.requirements && form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.requirements.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 px-3 py-1.5 text-[13px] font-bold text-[#1e3a5f]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeRequirement(tag)}
                      className="cursor-pointer text-[#1e3a5f]/50 hover:text-rose-500 transition-colors"
                      aria-label="Xóa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-900">Lương và số lượng</h2>
        
        {/* Payment Type Selection */}
        <div className="mb-4">
          <p className="mb-2 text-[13px] font-bold text-slate-700">
            Hình thức trả <span className="text-rose-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {payTypes.map((pt: PayType) => (
              <button
                key={pt}
                type="button"
                onClick={() => setForm((p) => ({ ...p, payType: pt }))}
                className={`cursor-pointer rounded-xl px-2 py-3 text-[13px] font-bold transition-all duration-200 border-2 ${
                  form.payType === pt
                    ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white shadow-md'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pt}
              </button>
            ))}
          </div>

          {/* Explanation text for selected payment type */}
          <div className="mt-3 flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-500 mt-0.5" />
            <p className="text-[13px] font-medium text-blue-800 leading-relaxed">
              {getSalaryExplanation(form.payType)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Dynamic Salary Label based on payment type */}
          <label>
            <span className="mb-1.5 block text-[13px] font-bold text-slate-700">
              {getSalaryLabel(form.payType)} <span className="text-rose-500">*</span>
            </span>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={form.salary}
                onChange={handleSalaryChange}
                inputMode="numeric"
                placeholder="VD: 50.000"
                className={`w-full rounded-xl border px-3 py-3 pl-10 text-base font-bold text-[#006399] placeholder:font-normal focus:outline-none transition-colors ${
                  errors.salary
                    ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20'
                }`}
              />
            </div>
            {errors.salary && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.salary}</p>}
          </label>
        </div>
      </section>
    </div>
  );
}
