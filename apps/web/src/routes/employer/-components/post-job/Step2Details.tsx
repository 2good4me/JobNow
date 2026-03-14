import { CalendarClock, LocateFixed, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { genderOptions, type JobFormState } from '../../post-job';

interface Step2DetailsProps {
  form: JobFormState;
  setForm: React.Dispatch<React.SetStateAction<JobFormState>>;
  errors: Partial<Record<keyof JobFormState, string>>;
  locationGpsError: string | null;
}

export default function Step2Details({ form, setForm, errors, locationGpsError }: Step2DetailsProps) {
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setForm((p: Partial<JobFormState> & any) => ({
            ...p,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Không thể lấy vị trí GPS. Vui lòng kiểm tra quyền truy cập.');
        }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ Geolocation API.');
    }
  };

  return (
    <div className="w-full shrink-0 px-0.5 space-y-4">
      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-100">Địa điểm làm việc</h2>
        
        {/* GPS Location Alert */}
        {locationGpsError && (
          <div className="mb-4 flex gap-3 rounded-xl border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{locationGpsError}</p>
            </div>
          </div>
        )}

        {/* Map placeholder with GPS button */}
        <div className="relative mb-3 h-48 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-200 dark:from-blue-900/40 dark:via-cyan-900/40 dark:to-sky-900/40">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.7),transparent_35%)] dark:[background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_35%)]" />
          {form.latitude && form.longitude ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-10 w-10 drop-shadow" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Vị trí đã chọn
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1">
                {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </span>
            </div>
          ) : (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center text-rose-500 dark:text-rose-400">
              <MapPin className="h-10 w-10 drop-shadow" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Cần chọn vị trí GPS</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleGetLocation}
            className="absolute bottom-3 right-3 rounded-xl border border-white/70 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 p-2 backdrop-blur cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <LocateFixed className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Địa chỉ chi tiết <span className="text-rose-400 dark:text-rose-500">*</span></span>
            <div className="relative">
              <Navigation className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                value={form.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p: Partial<JobFormState> & any) => ({ ...p, address: e.target.value }))}
                placeholder="123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  errors.address
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
                }`}
              />
            </div>
            {errors.address && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.address}</p>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Ngày bắt đầu <span className="text-rose-400 dark:text-rose-500">*</span></span>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="date"
                value={form.startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p: Partial<JobFormState> & any) => ({ ...p, startDate: e.target.value }))}
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  errors.startDate
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
                }`}
              />
            </div>
            {errors.startDate && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.startDate}</p>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">Hạn nộp đơn</span>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400 dark:text-amber-500" />
              <input
                type="date"
                value={form.deadline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p: Partial<JobFormState> & any) => ({ ...p, deadline: e.target.value }))}
                className={`w-full rounded-xl border px-3 py-2.5 pl-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none transition-colors ${
                  errors.deadline
                    ? 'border-rose-400 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-900/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900/30'
                }`}
              />
            </div>
            {errors.deadline && <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">🔴 {errors.deadline}</p>}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 dark:border-slate-800 bg-white/70 dark:bg-[#1E293B] p-4 shadow-md backdrop-blur-md transition-colors duration-300">
        <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100">Ưu tiên ứng viên</h2>
        <div className="grid grid-cols-3 gap-2">
          {genderOptions.map((g: string) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((p: Partial<JobFormState> & any) => ({ ...p, gender: g }))}
              className={`cursor-pointer rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${form.gender === g
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-300 dark:shadow-violet-900/50'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f2937] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
