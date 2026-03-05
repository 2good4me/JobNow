import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, ArrowRight, CalendarClock, Check, Clock, DollarSign,
  ImagePlus, Loader2, LocateFixed, MapPin, Minus, Navigation, Plus,
  Sparkles, Trash2, UsersRound, X, Tag,
} from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCreateJob } from '@/features/jobs/hooks/useEmployerJobs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import type { Job, SalaryType, GenderPreference as GenderPref } from '@jobnow/types';

export const Route = createFileRoute('/employer/post-job')({
  component: EmployerPostJobRoute,
});

/* ── Types ───────────────────────────────────── */
type PayType = 'Theo giờ' | 'Theo ca' | 'Theo ngày';
type GenderPreference = 'Nam' | 'Nữ' | 'Cả hai';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  quantity: number;
}

interface JobFormState {
  title: string;
  category: string;
  description: string;
  vacancies: number;
  gender: GenderPreference;
  salary: string;
  payType: PayType;
  address: string;
  startDate: string;
  deadline: string;
  requirements: string[];
  shifts: Shift[];
  coverImage: File | null;
  isPremium: boolean;
}

/* ── Constants ───────────────────────────────── */
const categories = ['F&B Service', 'Retail', 'Delivery', 'Event Helper'];
const payTypes: PayType[] = ['Theo giờ', 'Theo ca', 'Theo ngày'];
const genderOptions: GenderPreference[] = ['Nam', 'Nữ', 'Cả hai'];

const STEP_LABELS = ['Thông tin', 'Chi tiết', 'Ca làm', 'Xem lại'] as const;

const DEFAULT_SHIFTS: Shift[] = [
  { id: 'default-1', name: 'Ca sáng', startTime: '06:00', endTime: '14:00', quantity: 1 },
  { id: 'default-2', name: 'Ca chiều', startTime: '14:00', endTime: '22:00', quantity: 1 },
];

/* ── Helpers ─────────────────────────────────── */
let _shiftId = 0;
function nextShiftId() {
  return `shift-${Date.now()}-${++_shiftId}`;
}

function formatSalary(val: string) {
  const num = Number(val.replace(/\D/g, ''));
  if (!num) return val;
  return num.toLocaleString('vi-VN');
}

/* ── Step Progress Bar ───────────────────────── */
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isActive = step === current;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200
              ${isCompleted
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-300 scale-110'
                  : 'bg-slate-200 text-slate-400'
              }
            `}>
              {isCompleted ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < total && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-colors duration-300 ${step < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ──────────────────────────── */
function EmployerPostJobRoute() {
  const [step, setStep] = useState(1);
  const [requirementInput, setRequirementInput] = useState('');
  const [form, setForm] = useState<JobFormState>({
    title: '',
    category: 'F&B Service',
    description: '',
    vacancies: 2,
    gender: 'Cả hai',
    salary: '50000',
    payType: 'Theo giờ',
    address: '',
    startDate: '',
    deadline: '',
    requirements: [],
    shifts: [...DEFAULT_SHIFTS],
    coverImage: null,
    isPremium: false,
  });

  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const fileInputId = useId();

  const canAdvance = useMemo(() => {
    if (step === 1) return form.title.trim().length > 0 && form.description.trim().length > 0;
    if (step === 2) return form.address.trim().length > 0 && form.startDate.length > 0;
    if (step === 3) return form.shifts.length > 0 && form.shifts.every(s => s.quantity > 0);
    return true;
  }, [step, form]);

  /* ── Shift helpers ── */
  const addShift = useCallback(() => {
    setForm(prev => ({
      ...prev,
      shifts: [...prev.shifts, { id: nextShiftId(), name: '', startTime: '08:00', endTime: '17:00', quantity: 1 }],
    }));
  }, []);

  const removeShift = useCallback((id: string) => {
    setForm(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== id) }));
  }, []);

  const updateShift = useCallback((id: string, patch: Partial<Shift>) => {
    setForm(prev => ({
      ...prev,
      shifts: prev.shifts.map(s => s.id === id ? { ...s, ...patch } : s),
    }));
  }, []);

  /* ── Image upload ── */
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setForm(prev => ({ ...prev, coverImage: file }));
    }
  }, []);

  /* ── Helpers ── */
  const addRequirement = useCallback(() => {
    const val = requirementInput.trim();
    if (val && !form.requirements.includes(val)) {
      setForm(prev => ({ ...prev, requirements: [...prev.requirements, val] }));
      setRequirementInput('');
    }
  }, [requirementInput, form.requirements]);

  const removeRequirement = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, requirements: prev.requirements.filter(r => r !== tag) }));
  }, []);

  const mapPayType = (pt: PayType): SalaryType => {
    if (pt === 'Theo giờ') return 'HOURLY';
    if (pt === 'Theo ca') return 'PER_SHIFT';
    return 'DAILY';
  };

  const mapGender = (g: GenderPreference): GenderPref => {
    if (g === 'Nam') return 'MALE';
    if (g === 'Nữ') return 'FEMALE';
    return 'ANY';
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!userProfile?.uid) return;
    try {
      // Upload cover image if selected
      let imageUrls: string[] = [];
      if (form.coverImage) {
        const storageRef = ref(storage, `job-images/${userProfile.uid}/${Date.now()}_${form.coverImage.name}`);
        await uploadBytes(storageRef, form.coverImage);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls = [downloadUrl];
      }

      const jobData: Partial<Job> = {
        employerId: userProfile.uid,
        categoryId: form.category,
        title: form.title,
        description: form.description,
        status: 'ACTIVE',
        salary: Number(form.salary.replace(/\D/g, '')),
        salaryType: mapPayType(form.payType),
        location: { address: form.address, latitude: 10.7769, longitude: 106.7009 },
        geohash: '',
        isGpsRequired: false,
        shifts: form.shifts.map(s => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          quantity: s.quantity,
        })),
        // New structured fields
        vacancies: form.vacancies,
        genderPreference: mapGender(form.gender),
        startDate: form.startDate,
        deadline: form.deadline || undefined,
        requirements: form.requirements.length > 0 ? form.requirements : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        isPremium: form.isPremium,
      };
      await createJob(jobData);
      navigate({ to: '/employer' });
    } catch (error) {
      console.error('Failed to post job', error);
      alert('Đã xảy ra lỗi khi đăng tin. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 pb-28">
      <div className="mx-auto w-full max-w-md px-4 pt-4">

        {/* ── Header ──────────────────────────── */}
        <header className="sticky top-2 z-20 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Job Wizard</p>
              <h1 className="text-xl font-bold text-slate-900">Đăng tin tuyển dụng</h1>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              Bước {step}/{STEP_LABELS.length}
            </span>
          </div>
          <StepBar current={step} total={STEP_LABELS.length} />
          <div className="mt-2 grid grid-cols-4 text-center">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-[10px] font-semibold ${i + 1 <= step ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
            ))}
          </div>
        </header>

        {/* ── Step Content ────────────────────── */}
        <div className="mt-4 overflow-hidden">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            {/* Step 1: Basic Info */}
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

            {/* Step 2: Location & Details */}
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

            {/* Step 3: Shifts */}
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

            {/* Step 4: Review & Submit */}
            <div className="w-full shrink-0 px-0.5 space-y-4">
              <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-md backdrop-blur-md">
                <h2 className="text-base font-bold text-slate-900">Kiểm tra lại lần cuối</h2>
                <p className="mt-1 mb-4 text-xs text-slate-500">Đảm bảo mọi thông tin đều chính xác trước khi đăng tuyển.</p>

                {/* Image upload */}
                <label htmlFor={fileInputId}
                  className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 py-6 transition-colors hover:border-emerald-400 hover:bg-emerald-50/30"
                >
                  {form.coverImage ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700">{form.coverImage.name}</span>
                      <button type="button" onClick={e => { e.preventDefault(); setForm(p => ({ ...p, coverImage: null })); }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer" aria-label="Xóa ảnh">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-600">Tải ảnh lên</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG tối đa 5MB</span>
                    </>
                  )}
                  <input id={fileInputId} type="file" accept="image/jpeg,image/png" onChange={handleImageSelect} className="hidden" />
                </label>

                {/* Summary card */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{form.title || '(Chưa có tiêu đề)'}</h3>
                    <span className="text-xs text-slate-500">{form.category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium">{formatSalary(form.salary)}đ / {form.payType.replace('Theo ', '')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-medium truncate">{form.address || '(Chưa có)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <UsersRound className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium">{form.vacancies} người — {form.gender}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CalendarClock className="w-3.5 h-3.5 text-violet-500" />
                      <span className="font-medium">{form.startDate || '(Chưa chọn)'}</span>
                    </div>
                  </div>

                  {form.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-600 font-medium mb-1">Mô tả</p>
                      <p className="text-xs text-slate-500 line-clamp-3">{form.description}</p>
                    </div>
                  )}

                  {form.shifts.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-600 font-medium mb-1.5">Ca làm việc ({form.shifts.length})</p>
                      <div className="space-y-1">
                        {form.shifts.map(s => (
                          <div key={s.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-1.5">
                            <span className="text-slate-700 font-medium">{s.name || 'Ca'}</span>
                            <span className="text-slate-500">{s.startTime} — {s.endTime} · {s.quantity} người</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Premium upsell */}
              <section
                onClick={() => setForm(p => ({ ...p, isPremium: !p.isPremium }))}
                className={`cursor-pointer rounded-2xl p-4 shadow-md transition-all duration-200 relative overflow-hidden ${form.isPremium
                  ? 'border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
                  : 'border border-white/70 bg-white/70 backdrop-blur-md'
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
                    <h3 className="text-sm font-bold text-slate-900">Tuyển dụng nhanh gấp 3 lần</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tin đăng sẽ được ưu tiên hiển thị ở vị trí đầu tiên.</p>
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
          </div>
        </div>

        {/* ── Navigation Footer ──────────────── */}
        <div className="sticky bottom-20 mt-4 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-lg backdrop-blur-md">
          <div className="flex gap-2">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            )}

            {step < STEP_LABELS.length ? (
              <button type="button" onClick={() => canAdvance && setStep(s => s + 1)}
                disabled={!canAdvance}
                className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/50 transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit}
                disabled={isCreating}
                className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-300/50 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isCreating ? 'Đang đăng...' : 'Đăng tin tuyển dụng'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
