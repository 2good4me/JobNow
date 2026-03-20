import { DollarSign, Tag, UsersRound, X, ChevronDown, Info } from 'lucide-react';
import { payTypes, type JobFormState, type PayType } from '../../post-job';
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
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Thông tin cơ bản</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Tiêu đề công việc <span className="text-rose-400 dark:text-rose-500">*</span>
            </span>
            <input
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="VD: Cần 2 bạn chạy bàn tiệc cưới"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                errors.title
                  ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.title}</p>}
          </label>

          {/* Category with Bottom Sheet */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Danh mục <span className="text-rose-400 dark:text-rose-500">*</span>
            </p>
            <button
              type="button"
              onClick={onCategoryClick}
              className={`w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-all flex items-center justify-between ${
                errors.category
                  ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-900/20'
                  : form.category
                    ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{form.category || 'Chọn danh mục...'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {errors.category && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.category}</p>}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Mô tả <span className="text-rose-400 dark:text-rose-500">*</span>
            </span>
            <textarea
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              placeholder="Mô tả chi tiết công việc..."
              className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                errors.description
                  ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.description}</p>
            )}
          </label>

          {/* Requirements tag input */}
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Yêu cầu ứng viên</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] py-2.5 pl-10 pr-3 text-sm text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={addRequirement}
                className="cursor-pointer rounded-xl bg-emerald-100 dark:bg-emerald-900/30 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
              >
                Thêm
              </button>
            </div>
            {form.requirements && form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.requirements.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeRequirement(tag)}
                      className="cursor-pointer text-emerald-400 dark:text-emerald-500 hover:text-rose-500 dark:hover:text-rose-400"
                      aria-label="Xóa"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Lương và số lượng</h2>
        <div className="grid grid-cols-2 gap-3">
<<<<<<< HEAD
=======
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Số lượng tuyển <span className="text-rose-400 dark:text-rose-500">*</span>
            </span>
            <div className="relative">
              <UsersRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="number"
                value={form.vacancies || ''}
                min={1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((p) => ({ ...p, vacancies: Math.max(0, Number(e.target.value || 0)) }))
                }
                placeholder="VD: 2"
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 pr-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  errors.vacancies
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
                }`}
              />
              <div className="absolute right-2 top-1/2 flex h-8 w-6 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]">
                <button
                  type="button"
                  onClick={() => adjustVacancies(1)}
                  className="flex h-1/2 items-center justify-center border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Tăng số lượng"
                >
                  <span className="h-0 w-0 border-x-[3px] border-x-transparent border-b-[5px] border-b-slate-400 dark:border-b-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustVacancies(-1)}
                  className="flex h-1/2 items-center justify-center text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Giảm số lượng"
                >
                  <span className="h-0 w-0 border-x-[3px] border-x-transparent border-t-[5px] border-t-slate-400 dark:border-t-slate-500" />
                </button>
              </div>
            </div>
            {errors.vacancies && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.vacancies}</p>}
          </label>
>>>>>>> e623a9a17f54cd0d2fbbcf394a4341aece30ea7b

          {/* Dynamic Salary Label based on payment type */}
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              {getSalaryLabel(form.payType)} <span className="text-rose-400 dark:text-rose-500">*</span>
            </span>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                value={form.salary}
                onChange={handleSalaryChange}
                inputMode="numeric"
                placeholder="VD: 50.000"
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  errors.salary
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
                }`}
              />
            </div>
            {errors.salary && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.salary}</p>}
          </label>
        </div>

        {/* Payment Type Selection with dynamic explanation */}
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Hình thức trả <span className="text-rose-400 dark:text-rose-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {payTypes.map((pt: PayType) => (
              <button
                key={pt}
                type="button"
                onClick={() => setForm((p) => ({ ...p, payType: pt }))}
                className={`cursor-pointer rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  form.payType === pt
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-300 dark:shadow-emerald-900/50'
                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {pt}
              </button>
            ))}
          </div>

          {/* Explanation text for selected payment type */}
          <div className="mt-3 flex gap-2 rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 p-3">
            <Info className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              {getSalaryExplanation(form.payType)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
