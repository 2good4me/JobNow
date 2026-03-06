import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobValidationSchema, CreateJobFormData, JOB_CATEGORIES } from '../schemas/create-job.schema';
import { CategoryBottomSheet } from './CategoryBottomSheet';
import { LocationSelector } from './LocationSelector';
import { useCreateJob } from '../hooks/useCreateJob';

interface CreateJobFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const CreateJobForm: React.FC<CreateJobFormProps> = ({ onSuccess, onError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    trigger,
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobValidationSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      category: '',
      description: '',
      salary: undefined,
      quantity: undefined,
      startTime: '',
      endTime: '',
      location: {
        latitude: 0,
        longitude: 0,
      },
      address: '',
    },
  });

  // Watch form values for calculations
  const salary = watch('salary');
  const quantity = watch('quantity');
  const category = watch('category');
  const location = watch('location');

  // Calculate budget
  const budget = salary && quantity ? salary * quantity : 0;

  const createJobMutation = useCreateJob({
    onSuccess: () => {
      reset();
      setCurrentStep(1);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Create Job Error:', error);
      onError?.(error);
    },
  });

  const handleLocationSelect = (
    locationValue: { latitude: number; longitude: number },
    addressValue: string
  ) => {
    setValue('location', locationValue, { shouldValidate: true, shouldDirty: true });
    setValue('address', addressValue, { shouldValidate: true, shouldDirty: true });
  };

  const getSelectedCategory = () => {
    return JOB_CATEGORIES.find((cat) => cat.id === category);
  };

  const canGoToStep2 = () => {
    const { title, category } = getValues();
    return Boolean(title?.trim() && category);
  };

  const canGoToStep3 = () => {
    const { salary, quantity, startTime, endTime } = getValues();
    return Boolean(salary && quantity && startTime && endTime);
  };

  const hasLocation = Boolean(location?.latitude && location?.longitude);
  const canSubmit = isValid && hasLocation && !createJobMutation.isPending;

  const onSubmit = (data: CreateJobFormData) => {
    if (!hasLocation) {
      return;
    }
    createJobMutation.mutate(data);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const validStep1 = await trigger(['title', 'category', 'description']);
      if (validStep1 && canGoToStep2()) {
        setCurrentStep(2);
      }
      return;
    }

    if (currentStep === 2) {
      const validStep2 = await trigger(['salary', 'quantity', 'startTime', 'endTime']);
      if (validStep2 && canGoToStep3()) {
        setCurrentStep(3);
      }
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step === currentStep
                  ? 'bg-blue-500 text-white scale-110'
                  : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all ${
                  step < currentStep ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-xs font-medium text-slate-600 px-2">
        <span className={currentStep === 1 ? 'text-blue-600' : ''}>Thông tin</span>
        <span className={currentStep === 2 ? 'text-blue-600' : ''}>Chi tiết</span>
        <span className={currentStep === 3 ? 'text-blue-600' : ''}>Vị trí</span>
      </div>

      <hr className="my-6" />

      {/* STEP 1: Job Information */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900">Thông tin công việc</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phục vụ quán cà phê ca tối"
              {...register('title')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại công việc <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCategorySheet(true)}
              className={`w-full px-4 py-3 border-2 rounded-lg font-medium text-left flex items-center justify-between transition ${
                errors.category
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-blue-300 bg-white'
              }`}
            >
              <span className={category ? 'text-slate-900' : 'text-slate-400'}>
                {getSelectedCategory()?.label || 'Chọn loại công việc'}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả công việc
            </label>
            <textarea
              placeholder="Mô tả chi tiết công việc..."
              {...register('description')}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Job Details */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900">Chi tiết công việc</h2>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lương (đ/giờ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Ví dụ: 120000"
              {...register('salary', { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.salary
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.salary && (
              <p className="mt-1 text-sm text-red-500">{errors.salary.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Ví dụ: 3"
              {...register('quantity', { valueAsNumber: true })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.quantity
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Budget Preview */}
          {budget > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Dự tính ngân sách</p>
              <p className="text-2xl font-bold text-blue-700">
                {budget.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {salary?.toLocaleString('vi-VN')}đ × {quantity} người
              </p>
            </div>
          )}

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giờ bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              {...register('startTime')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.startTime
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giờ kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              {...register('endTime')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.endTime
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-500">{errors.endTime.message}</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900">Vị trí công việc</h2>
          <LocationSelector
            onLocationSelect={handleLocationSelect}
            currentLocation={location.latitude !== 0 ? location : undefined}
            currentAddress={watch('address')}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-500">{errors.location.message as string}</p>
          )}
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
          )}
          {!hasLocation && (
            <p className="mt-1 text-sm text-red-500">Vui lòng chọn vị trí GPS trước khi đăng tin.</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
          >
            Quay lại
          </button>
        )}
        {currentStep < 3 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === 1 ? !canGoToStep2() : !canGoToStep3()}
            className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-slate-400 transition"
          >
            Tiếp tục
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:bg-slate-400 transition flex items-center justify-center gap-2"
          >
            {createJobMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang đăng tin...
              </>
            ) : (
              '✓ Đăng tin'
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {createJobMutation.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            Lỗi: {createJobMutation.error?.message || 'Không thể đăng tin'}
          </p>
        </div>
      )}

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        isOpen={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
        selectedCategory={category}
        onSelect={(categoryId) => setValue('category', categoryId, { shouldValidate: true })}
      />
    </form>
  );
};
