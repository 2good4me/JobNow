import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, ArrowRight, Check,
  Loader2, Send, X,
} from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCreateJob, useUpdateJob, useJobDetail, useGetCategories } from '@/features/jobs/hooks/useEmployerJobs';
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
  type PayType,
  type GenderPreference,
  type Shift,
} from './-schemas/jobFormSchema';
import { type JobFormState } from './-types/job-post-types';
import { nextShiftId } from './-utils/postJobUtils';

export const Route = createFileRoute('/employer/post-job')({
  validateSearch: (search: Record<string, unknown>): { editJobId?: string; duplicateJobId?: string } => ({
    editJobId: search.editJobId as string | undefined,
    duplicateJobId: search.duplicateJobId as string | undefined,
  }),
  component: EmployerPostJobRoute,
});

// Re-export types for use in step components
export type { Shift, JobFormState };

/* ── Constants ───────────────────────────────── */
export const FALLBACK_CATEGORIES = ['F&B Service', 'Retail', 'Delivery', 'Event Helper'];

const STEP_LABELS = ['Thông tin', 'Chi tiết', 'Ca làm', 'Xem lại'] as const;

/* ── Helpers ─────────────────────────────────── */

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
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/50'
                : isActive
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-300 dark:shadow-emerald-900/50 scale-110'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }
            `}>
              {isCompleted ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < total && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-colors duration-300 ${step < current ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ──────────────────────────── */
export function EmployerPostJobRoute() {
  const { editJobId, duplicateJobId } = Route.useSearch();
  
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

  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && userProfile.role === 'EMPLOYER' && userProfile.verification_status !== 'VERIFIED') {
      toast.error('Vui lòng xác thực CCCD để đăng tin tuyển dụng!');
      navigate({ to: '/employer/verification' });
    }
  }, [userProfile, navigate]);

  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();
  const { data: existingJob, isLoading: isLoadingJob } = useJobDetail(editJobId || duplicateJobId);
  const { data: remoteCategories } = useGetCategories();
  
  const displayCategories = remoteCategories && remoteCategories.length > 0 ? remoteCategories : FALLBACK_CATEGORIES;
  const fileInputId = useId();
  const isSubmitting = isCreating || isUpdating;

  // Validation for current step
  const validateStep = useCallback((stepNum: number) => {
    const newErrors: Partial<Record<keyof JobFormState, string>> = {};

    if (stepNum === 1) {
      if (!form.title.trim()) newErrors.title = 'Tiêu đề công việc không được để trống';
      if (form.title.length < 5) newErrors.title = 'Tiêu đề phải >= 5 ký tự';
      if (!form.description.trim()) newErrors.description = 'Mô tả công việc không được để trống';
      if (!form.category) newErrors.category = 'Vui lòng chọn danh mục';
      if (!form.salary.trim()) newErrors.salary = 'Mức lương không được để trống';
      if (Number(form.salary.replace(/\D/g, '')) < 0) newErrors.salary = 'Mức lương phải >= 0';
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
        form.description.trim().length > 0 &&
        form.category.length > 0 &&
        form.salary.trim().length > 0 &&
        Number(form.salary.replace(/\D/g, '')) >= 0
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

  // Reverse mappers for editing
  const reverseMapPayType = (st: SalaryType): PayType => {
    if (st === 'HOURLY') return 'Theo giờ';
    if (st === 'PER_SHIFT') return 'Theo ca';
    return 'Theo ngày';
  };

  const reverseMapGender = (gp: GenderPref): GenderPreference => {
    if (gp === 'MALE') return 'Nam';
    if (gp === 'FEMALE') return 'Nữ';
    return 'Cả hai';
  };

  // Pre-populate form when editing or duplicating
  useEffect(() => {
    if (existingJob && (editJobId || duplicateJobId)) {
      setForm({
        title: existingJob.title,
        category: existingJob.categoryId,
        description: existingJob.description,
        vacancies: existingJob.vacancies || 0,
        gender: reverseMapGender(existingJob.genderPreference || 'ANY'),
        salary: existingJob.salary.toLocaleString('vi-VN'),
        payType: reverseMapPayType(existingJob.salaryType),
        address: existingJob.location.address || '',
        startDate: existingJob.startDate || '',
        deadline: existingJob.deadline || '',
        requirements: existingJob.requirements || [],
        shifts: existingJob.shifts.map(s => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          quantity: s.quantity,
        })),
        coverImage: null, // Can't pre-populate file input
        isPremium: existingJob.isPremium || false,
        latitude: existingJob.location.latitude,
        longitude: existingJob.location.longitude,
      });
    }
  }, [existingJob, editJobId, duplicateJobId]);

  // Load draft on mount
  useEffect(() => {
    if (!editJobId && !duplicateJobId) {
      const draft = localStorage.getItem('jobnow_draft_job');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setForm(prev => ({ ...prev, ...parsed, coverImage: null }));
          toast.info('Đã tải lại bản nháp chưa hoàn thành');
        } catch(e) {}
      }
    }
  }, [editJobId, duplicateJobId]);

  // Autosave when form changes
  useEffect(() => {
    if (!editJobId && !duplicateJobId && form.title) {
       const timer = setTimeout(() => {
          localStorage.setItem('jobnow_draft_job', JSON.stringify({ ...form, coverImage: null }));
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [form, editJobId, duplicateJobId]);

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
      let imageUploadWarning: string | null = null;
      if (form.coverImage) {
        const fileName = `${Date.now()}_${form.coverImage.name}`;
        const primaryRef = ref(storage, `job-images/${user.uid}/${fileName}`);

        try {
          await uploadBytes(primaryRef, form.coverImage);
          const downloadUrl = await getDownloadURL(primaryRef);
          imageUrls = [downloadUrl];
        } catch (primaryUploadError) {
          // Fallback to an owner-writable path so users can still submit when job-images rules are not synced yet.
          const fallbackRef = ref(storage, `company-logos/${user.uid}/job-cover_${fileName}`);
          try {
            await uploadBytes(fallbackRef, form.coverImage);
            const fallbackUrl = await getDownloadURL(fallbackRef);
            imageUrls = [fallbackUrl];
          } catch (fallbackUploadError) {
            console.error('Image upload failed on both primary and fallback paths', {
              primaryUploadError,
              fallbackUploadError,
            });
            imageUploadWarning = 'Không thể tải ảnh lên lúc này. Tin vẫn được đăng/cập nhật nhưng chưa có ảnh.';
          }
        }
      } else if (editJobId && existingJob?.images) {
        // Keep existing images when editing without new upload
        imageUrls = existingJob.images;
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
          latitude: form.latitude ?? 21.0180,
          longitude: form.longitude ?? 105.7657,
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
        vacancies: form.shifts.reduce((acc, s) => acc + s.quantity, 0),
        genderPreference: mapGender(form.gender),
        startDate: form.startDate,
        deadline: form.deadline || undefined,
        requirements: form.requirements.length > 0 ? form.requirements : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        isPremium: form.isPremium,
      };

      if (editJobId) {
        // Update existing job
        await updateJob({ jobId: editJobId, data: jobData });
        toast.success('Cập nhật tin thành công!');
      } else {
        // Create new job
        await createJob(jobData);
        toast.success(duplicateJobId ? 'Nhân bản tin thành công!' : 'Đăng tin thành công!');
        localStorage.removeItem('jobnow_draft_job');
      }

      if (imageUploadWarning) {
        toast.error(imageUploadWarning);
      }

      navigate({ to: '/employer' });
    } catch (error) {
      console.error('Failed to post job', error);
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : '';

      if (errorCode === 'storage/unauthorized') {
        toast.error('Không có quyền tải ảnh. Hệ thống đã thử lưu theo đường dẫn thay thế, vui lòng thử lại.');
        return;
      }

      toast.error('Đã xảy ra lỗi khi đăng/cập nhật tin. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-[#111827] dark:to-[#0f172a] pb-24 transition-colors duration-300">
      <div className="mx-auto w-full max-w-md px-4 pt-4">

        {/* Loading state when fetching job data for editing */}
        {editJobId && isLoadingJob && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-500" />
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Đang tải thông tin...</p>
            </div>
          </div>
        )}

        {/* Main content - hide while loading in edit mode */}
        {!(editJobId && isLoadingJob) && (
          <>
            {/* ── Header ──────────────────────────── */}
            <header className="sticky top-2 z-20 rounded-2xl border border-white/60 dark:border-slate-800 bg-white/80 dark:bg-[#1E293B]/80 p-4 shadow-lg backdrop-blur-md transition-colors duration-300">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Job Wizard</p>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{editJobId ? 'Chỉnh sửa tin' : 'Đăng tin'}</h1>
                </div>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Bước {step}/{STEP_LABELS.length}
                </span>
              </div>
          <StepBar current={step} total={STEP_LABELS.length} />
          <div className="mt-2 grid grid-cols-4 text-center">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-[10px] font-semibold ${i + 1 <= step ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
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
            />
          )}

          {step === 4 && (
            <Step4Review
              form={form}
              setForm={setForm}
              fileInputId={fileInputId}
              handleImageSelect={handleImageSelect}
            />
          )}
        </form>
          </>
        )}
      </div>

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        isOpen={showCategoryBottomSheet}
        onClose={() => setShowCategoryBottomSheet(false)}
        categories={displayCategories}
        selectedCategory={form.category}
        onSelect={(cat) => setForm(prev => ({ ...prev, category: cat }))}
      />

      {/* ── Sticky Action Bar ─────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-[#1E293B]/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-md mx-auto flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">

          {/* ── Secondary: Cancel / Back (Ghost style, left-aligned) ── */}
          {step > 1 ? (
            <button
              type="button"
              onClick={() => handleStepChange(step - 1)}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate({ to: editJobId ? `/employer/job-detail` : '/employer', search: editJobId ? { jobId: editJobId } : {} })}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-all hover:border-red-200 dark:hover:border-rose-800 hover:bg-red-50 dark:hover:bg-rose-900/40 hover:text-red-600 dark:hover:text-rose-400 active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          )}

          {/* ── Primary: Next / Submit (Bold, right-aligned for thumb zone) ── */}
          <button
            type="button"
            className={`min-h-[52px] flex-[2] rounded-xl px-5 py-3.5 text-[15px] font-bold tracking-tight transition-all flex items-center justify-center gap-2
              ${!canAdvance || isSubmitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : step === 4
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:brightness-110 active:scale-[0.97]'
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.97]'
              }
            `}
            disabled={!canAdvance || isSubmitting}
            onClick={() => {
              if (step < STEP_LABELS.length) handleStepChange(step + 1);
              else handleSubmit();
            }}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {editJobId ? 'Đang cập nhật...' : 'Đang đăng...'}</>
            ) : step === 4 ? (
              <><Send className="w-4.5 h-4.5" /> {editJobId ? 'Cập nhật tin' : 'Đăng tin ngay'}</>
            ) : (
              <>Tiếp tục <ArrowRight className="w-5 h-5" /></>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
