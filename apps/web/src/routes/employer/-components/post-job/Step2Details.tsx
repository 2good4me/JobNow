import { CalendarClock, LocateFixed, MapPin, Navigation } from 'lucide-react';
import { genderOptions, type JobFormState } from '../../post-job';

interface Step2DetailsProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
}

export default function Step2Details({ form, setForm }: Step2DetailsProps) {
  return (
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
        <h2 className="mb-4 text-base font-bold text-slate-900">Địa điểm làm việc</h2>
        <div className="relative mb-3 h-48 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-200">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.7),transparent_35%)]" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center text-rose-500">
            <MapPin className="h-10 w-10 drop-shadow" />
            <span className="text-[11px] font-semibold text-slate-700">Kéo ghim để chỉnh vị trí</span>
          </div>
          <div className="absolute bottom-3 right-3 rounded-xl border border-white/70 bg-white/80 p-2 backdrop-blur cursor-pointer hover:bg-white transition-colors">
            <LocateFixed className="h-4 w-4 text-slate-600" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Địa chỉ chi tiết <span className="text-rose-400">*</span></span>
            <div className="relative">
              <Navigation className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Ngày bắt đầu <span className="text-rose-400">*</span></span>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="date" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">Hạn nộp đơn</span>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400" />
              <input type="date" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
        <h2 className="mb-2 text-base font-bold text-slate-900">Ưu tiên ứng viên</h2>
        <div className="grid grid-cols-3 gap-2">
          {genderOptions.map(g => (
            <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gender: g }))}
              className={`cursor-pointer rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${form.gender === g
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-300'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
            >{g}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
