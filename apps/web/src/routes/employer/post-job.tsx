import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, ArrowRight, Check,
  Loader2, Send, X,
} from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCreateJob } from '@/features/jobs/hooks/useEmployerJobs';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import type { Job, SalaryType, GenderPreference as GenderPref } from '@jobnow/types';

import Step1Info from './-components/post-job/Step1Info';
import Step2Details from './-components/post-job/Step2Details';
import Step3Shifts from './-components/post-job/Step3Shifts';
import Step4Review from './-components/post-job/Step4Review';
import { CategoryBottomSheet } from './-components/post-job/CategoryBottomSheet';
import {
  jobFormSchema,
  type JobFormState as JobFormSchemaState,
  type PayType,
  type GenderPreference,
  type Shift,
  calculateTotalBudget,
} from './-schemas/jobFormSchema';

export const Route = createFileRoute('/employer/post-job')({
  component: EmployerPostJobRoute,
});

// App form state keeps GPS fields nullable until user selects a location.
export type JobFormState = Omit<JobFormSchemaState, 'latitude' | 'longitude'> & {
  latitude: number | null;
  longitude: number | null;
};
// Re-export types for use in step components
export type { PayType, GenderPreference, Shift };

/* ── Constants ───────────────────────────────── */
export const categories = ['F&B Service', 'Retail', 'Delivery', 'Event Helper'];
export const payTypes: PayType[] = ['Theo giờ', 'Theo ca', 'Theo ngày'];
export const genderOptions: GenderPreference[] = ['Nam', 'Nữ', 'Cả hai'];

const STEP_LABELS = ['Thông tin', 'Chi tiết', 'Ca làm', 'Xem lại'] as const;

/* ── Helpers ─────────────────────────────────── */
let _shiftId = 0;
export function nextShiftId() {
  return `shift-${Date.now()}-${++_shiftId}`;
}

export function formatSalary(val: string) {
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
  const [showCategoryBottomSheet, setShowCategoryBottomSheet] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormState, string>>>({});
  const [locationGpsError, setLocationGpsError] = useState<string | null>(null);
  
  // Empty form state - no defaults
  const [form, setForm] = useState<JobFormState>({
    title: '',
    category: '',
    description: '',
    vacancies: 0,
    gender: 'Cả hai',
    salary: '',
    payType: 'Theo giờ',
    address: '',
    startDate: '',
    deadline: '',
    requirements: [],
    shifts: [],
    coverImage: null,
    isPremium: false,
    latitude: null,
    longitude: null,
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const fileInputId = useId();

  // Validation for current step
  const validateStep = useCallback((stepNum: number) => {
    const newErrors: Partial<Record<keyof JobFormState, string>> = {};

    if (stepNum === 1) {
      if (!form.title.trim()) newErrors.title = 'Tiêu đề công việc không được để trống';
      if (form.title.length < 5) newErrors.title = 'Tiêu đề phải >= 5 ký tự';
      if (!form.description.trim()) newErrors.description = 'Mô tả công việc không được để trống';
      if (form.description.length < 10) newErrors.description = 'Mô tả phải >= 10 ký tự';
      if (!form.category) newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (stepNum === 2) {
      if (!form.address.trim()) newErrors.address = 'Địa chỉ không được để trống';
      if (!form.startDate) newErrors.startDate = 'Ngày bắt đầu không được để trống';
      if (form.deadline && new Date(form.deadline) < new Date(form.startDate)) {
        newErrors.deadline = 'Hạn nộp đơn phải >= ngày bắt đầu';
      }
      // Location GPS guard
      if (form.latitude === null || form.longitude === null) {
        setLocationGpsError('⚠️ Vui lòng chọn vị trí GPS trước khi tiếp tục');
      } else {
        setLocationGpsError(null);
      }
    }

    if (stepNum === 3) {
      if (!form.salary.trim()) newErrors.salary = 'Mức lương không được để trống';
      if (Number(form.salary.replace(/\D/g, '')) <= 0) newErrors.salary = 'Mức lương phải > 0';
      if (!form.vacancies || form.vacancies < 1) newErrors.vacancies = 'Số lượng phải >= 1';
      if (form.shifts.length === 0) newErrors.shifts = 'Phải có ít nhất 1 ca làm';

      // Validate shifts
      const shiftErrors: string[] = [];
      form.shifts.forEach((shift, idx) => {
        if (!shift.name.trim()) shiftErrors.push(`Ca ${idx + 1}: Tên ca không được để trống`);
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        if (endMins < startMins) shiftErrors.push(`Ca ${idx + 1}: Giờ kết thúc phải >= giờ bắt đầu`);
        if (shift.quantity < 1) shiftErrors.push(`Ca ${idx + 1}: Số lượng phải >= 1`);
      });
      if (shiftErrors.length > 0) {
        newErrors.shifts = shiftErrors.join('; ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return (
        form.title.trim().length >= 5 &&
        form.description.trim().length >= 10 &&
        form.category.length > 0
      );
    }
    if (step === 2) {
      return (
        form.address.trim().length >= 5 &&
        form.startDate.length > 0 &&
        form.latitude !== null &&
        form.longitude !== null
      );
    }
    if (step === 3) {
      return (
        form.salary.trim().length > 0 &&
        Number(form.salary.replace(/\D/g, '')) > 0 &&
        form.vacancies >= 1 &&
        form.shifts.length > 0 &&
        form.shifts.every(s => s.name.trim() && s.quantity >= 1)
      );
    }
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
    } else if (file) {
      toast.error('Kích thước hình ảnh phải <= 5MB');
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

  const handleStepChange = (newStep: number) => {
    if (newStep > step) {
      // Moving forward - validate current step
      if (validateStep(step)) {
        setStep(newStep);
        setErrors({});
      }
    } else {
      // Moving backward - just go
      setStep(newStep);
      setErrors({});
    }
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error('Lỗi xác thực. Không tìm thấy ID nhà tuyển dụng.');
      return;
    }

    try {
      // Final validation with Zod
      const validationResult = jobFormSchema.safeParse(form);
      if (!validationResult.success) {
        const zodErrors = validationResult.error.flatten().fieldErrors;
        const errorMap: Partial<Record<keyof JobFormState, string>> = {};
        Object.entries(zodErrors).forEach(([key, msgs]) => {
          errorMap[key as keyof JobFormState] = msgs?.[0] || 'Invalid field';
        });
        setErrors(errorMap);
        toast.error('Vui lòng kiểm tra lại các trường bị lỗi');
        return;
      }

      // Upload cover image if selected
      let imageUrls: string[] = [];
      if (form.coverImage) {
        const storageRef = ref(storage, `job-images/${user.uid}/${Date.now()}_${form.coverImage.name}`);
        await uploadBytes(storageRef, form.coverImage);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls = [downloadUrl];
      }

      const jobData: Partial<Job> = {
        employerId: user.uid,
        categoryId: form.category,
        title: form.title,
        description: form.description,
        status: 'ACTIVE',
        salary: Number(form.salary.replace(/\D/g, '')),
        salaryType: mapPayType(form.payType),
        location: {
          address: form.address,
          latitude: form.latitude ?? 10.7769,
          longitude: form.longitude ?? 106.7009,
        },
        geohash: '',
        isGpsRequired: true,
        shifts: form.shifts.map(s => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          quantity: s.quantity,
        })),
        vacancies: form.vacancies,
        genderPreference: mapGender(form.gender),
        startDate: form.startDate,
        deadline: form.deadline || undefined,
        requirements: form.requirements.length > 0 ? form.requirements : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        isPremium: form.isPremium,
      };
      await createJob(jobData);
      toast.success('Đăng tin thành công!');
      navigate({ to: '/employer' });
    } catch (error) {
      console.error('Failed to post job', error);
      toast.error('Đã xảy ra lỗi khi đăng tin. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 pb-24">
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

        {/* ── Content Area ────────────────────────── */}
        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <Step1Info
              form={form}
              setForm={setForm}
              errors={errors}
              requirementInput={requirementInput}
              setRequirementInput={setRequirementInput}
              addRequirement={addRequirement}
              removeRequirement={removeRequirement}
              onCategoryClick={() => setShowCategoryBottomSheet(true)}
            />
          )}

          {step === 2 && (
            <Step2Details
              form={form}
              setForm={setForm}
              errors={errors}
              locationGpsError={locationGpsError}
            />
          )}

          {step === 3 && (
            <Step3Shifts
              form={form}
              addShift={addShift}
              updateShift={updateShift}
              removeShift={removeShift}
              errors={errors}
              calculateTotalBudget={calculateTotalBudget}
            />
          )}

          {step === 4 && (
            <Step4Review
              form={form}
              setForm={setForm}
              fileInputId={fileInputId}
              handleImageSelect={handleImageSelect}
              calculateTotalBudget={calculateTotalBudget}
            />
          )}
        </form>
      </div>

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        isOpen={showCategoryBottomSheet}
        onClose={() => setShowCategoryBottomSheet(false)}
        categories={categories}
        selectedCategory={form.category}
        onSelect={(cat) => setForm(prev => ({ ...prev, category: cat }))}
      />

      {/* ── Sticky Action Bar ─────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 bg-white/90 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">

          {/* ── Secondary: Cancel / Back (Ghost style, left-aligned) ── */}
          {step > 1 ? (
            <button
              type="button"
              onClick={() => handleStepChange(step - 1)}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate({ to: '/employer' })}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm font-semibold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          )}

          {/* ── Primary: Next / Submit (Bold, right-aligned for thumb zone) ── */}
          <button
            type="button"
            className={`min-h-[52px] flex-[2] rounded-xl px-5 py-3.5 text-[15px] font-bold tracking-tight transition-all flex items-center justify-center gap-2
              ${!canAdvance || isCreating
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : step === 4
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.97]'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.97]'
              }
            `}
            disabled={!canAdvance || isCreating}
            onClick={() => {
              if (step < STEP_LABELS.length) handleStepChange(step + 1);
              else handleSubmit();
            }}
          >
            {isCreating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Đang đăng...</>
            ) : step === 4 ? (
              <><Send className="w-4.5 h-4.5" /> Đăng tin ngay</>
            ) : (
              <>Tiếp tục <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
