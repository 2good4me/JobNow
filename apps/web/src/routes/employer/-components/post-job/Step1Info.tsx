import { DollarSign, Tag, UsersRound, X } from 'lucide-react';
import { categories, payTypes, type JobFormState } from '../../post-job';

interface Step1InfoProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  requirementInput: string;
  setRequirementInput: (val: string) => void;
  addRequirement: () => void;
  removeRequirement: (tag: string) => void;
}

export default function Step1Info({
  form, setForm, requirementInput, setRequirementInput, addRequirement, removeRequirement
}: Step1InfoProps) {
  return (
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
        <h2 className="mb-4 text-base font-bold text-slate-900">Thông tin cơ bản</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Tiêu đề công việc <span className="text-rose-400">*</span></span>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="VD: Cần 2 bạn chạy bàn tiệc cưới"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-colors"
            />
          </label>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">Danh mục</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setForm(p => ({ ...p, category: cat }))}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${form.category === cat
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-300'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                >{cat}</button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Mô tả <span className="text-rose-400">*</span></span>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Mô tả chi tiết công việc..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-colors"
            />
          </label>

          {/* Requirements tag input */}
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-600">Yêu cầu ứng viên</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={requirementInput}
                  onChange={e => setRequirementInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                  placeholder="VD: Giao tiếp tốt"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button type="button" onClick={addRequirement}
                className="cursor-pointer rounded-xl bg-emerald-100 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition-colors"
              >Thêm</button>
            </div>
            {form.requirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.requirements.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {tag}
                    <button type="button" onClick={() => removeRequirement(tag)} className="cursor-pointer text-emerald-400 hover:text-rose-500" aria-label="Xóa">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
        <h2 className="mb-4 text-base font-bold text-slate-900">Lương và số lượng</h2>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600">Số lượng tuyển</span>
            <div className="relative">
              <UsersRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="number" value={form.vacancies} min={1}
                onChange={e => setForm(p => ({ ...p, vacancies: Math.max(1, Number(e.target.value || 1)) }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600">Mức lương (VNĐ)</span>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={form.salary}
                onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </label>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-slate-600">Hình thức trả</p>
          <div className="grid grid-cols-3 gap-2">
            {payTypes.map(pt => (
              <button key={pt} type="button" onClick={() => setForm(p => ({ ...p, payType: pt }))}
                className={`cursor-pointer rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${form.payType === pt
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-300'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
              >{pt}</button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
