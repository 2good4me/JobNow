import { Clock, Minus, Plus, X } from 'lucide-react';
import { type JobFormState, type Shift } from '../../post-job';

interface Step3ShiftsProps {
  form: JobFormState;
  addShift: () => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
  removeShift: (id: string) => void;
}

export default function Step3Shifts({ form, addShift, updateShift, removeShift }: Step3ShiftsProps) {
  return (
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
        <h2 className="text-base font-bold text-slate-900">Chọn ca làm việc</h2>
        <p className="mt-1 mb-4 text-xs text-slate-500">Thêm các ca làm việc cho công việc này.</p>

        <div className="space-y-3">
          {form.shifts.map(shift => (
            <div key={shift.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 relative group">
              <button type="button" onClick={() => removeShift(shift.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                aria-label="Xóa ca"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-2">
                <input
                  value={shift.name}
                  onChange={e => updateShift(shift.id, { name: e.target.value })}
                  placeholder="Tên ca (VD: Ca sáng)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <label className="block">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bắt đầu</span>
                  <div className="relative mt-0.5">
                    <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input type="time" value={shift.startTime}
                      onChange={e => updateShift(shift.id, { startTime: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kết thúc</span>
                  <div className="relative mt-0.5">
                    <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input type="time" value={shift.endTime}
                      onChange={e => updateShift(shift.id, { endTime: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Số lượng cần</span>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => updateShift(shift.id, { quantity: Math.max(1, shift.quantity - 1) })}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                    aria-label="Giảm số lượng"
                  ><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800">{shift.quantity}</span>
                  <button type="button"
                    onClick={() => updateShift(shift.id, { quantity: shift.quantity + 1 })}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                    aria-label="Tăng số lượng"
                  ><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addShift}
          className="mt-3 w-full cursor-pointer rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm ca làm việc
        </button>
      </section>
    </div>
  );
}
