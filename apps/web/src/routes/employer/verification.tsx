import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useEmployerVerification } from '@/features/auth/hooks/useEmployerVerification';

export const Route = createFileRoute('/employer/verification')({
  component: EmployerVerificationRoute,
});

type VerificationStep = 'overview' | 'upload' | 'success';

type UiStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

const STATUS_STYLES: Record<UiStatus, { label: string; badgeClass: string; textClass: string }> = {
  UNVERIFIED: {
    label: 'Chưa xác minh',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    textClass: 'text-slate-600',
  },
  PENDING: {
    label: 'Đang chờ duyệt',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    textClass: 'text-amber-700',
  },
  VERIFIED: {
    label: 'Đã xác minh',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  REJECTED: {
    label: 'Cần bổ sung hồ sơ',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    textClass: 'text-rose-700',
  },
};

function EmployerVerificationRoute() {
  const navigate = useNavigate();
  const {
    uiStatus,
    latestRequest,
    businessLicenseUrl,
    submitVerification,
    isSubmitting,
    submitError,
    resetSubmitError,
    isSubmissionLocked,
  } = useEmployerVerification();

  const [activeStep, setActiveStep] = useState<VerificationStep>('overview');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (uiStatus === 'PENDING' || uiStatus === 'VERIFIED') {
      setActiveStep('success');
    }
  }, [uiStatus]);

  const statusStyle = STATUS_STYLES[uiStatus];

  const estimatedReviewText = useMemo(() => {
    if (!latestRequest?.createdAt || typeof latestRequest.createdAt !== 'object' || !('toDate' in latestRequest.createdAt)) {
      return 'Thông thường mất từ 6-24 giờ làm việc.';
    }

    try {
      const createdDate = (latestRequest.createdAt as { toDate: () => Date }).toDate();
      const estimated = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
      return `Dự kiến hoàn tất trước ${estimated.toLocaleString('vi-VN')}.`;
    } catch {
      return 'Thông thường mất từ 6-24 giờ làm việc.';
    }
  }, [latestRequest]);

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    resetSubmitError();
    setFileError(null);

    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedFile(null);
      setFileError('Chỉ chấp nhận tệp ảnh (JPG, PNG, WEBP).');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmitVerification = async () => {
    if (!selectedFile) {
      setFileError('Vui lòng chọn ảnh giấy phép kinh doanh trước khi gửi.');
      return;
    }

    try {
      await submitVerification(selectedFile);
      setActiveStep('success');
      setSelectedFile(null);
    } catch {
      // Error is rendered via submitError
    }
  };

  const renderStepContent = () => {
    if (activeStep === 'overview') {
      return (
        <section className="space-y-4">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-slate-900 p-5 text-white shadow-xl shadow-indigo-900/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100/90">Verification Overview</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Trung tâm xác thực doanh nghiệp</h2>
            <p className="mt-2 text-sm text-indigo-100/90">
              Hoàn tất e-KYC để tăng độ tin cậy với ứng viên và mở khóa quyền lợi tuyển dụng nâng cao.
            </p>
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle.badgeClass}`}>
              <BadgeCheck className="h-3.5 w-3.5" />
              {statusStyle.label}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Quyền lợi khi được xác minh</h3>
            <div className="mt-3 space-y-2">
              {[
                'Hiển thị nhãn uy tín doanh nghiệp trên tin tuyển dụng.',
                'Tăng tỉ lệ ứng tuyển từ Candidate quanh khu vực GPS.',
                'Ưu tiên hiển thị trong danh sách tìm việc gần đây.',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <p className="text-sm text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveStep('upload')}
              disabled={isSubmissionLocked}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {uiStatus === 'PENDING' ? 'Đang xử lý hồ sơ' : uiStatus === 'VERIFIED' ? 'Doanh nghiệp đã xác minh' : 'Bắt đầu xác minh'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      );
    }

    if (activeStep === 'upload') {
      return (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Tải lên giấy phép kinh doanh</h3>
            <p className="mt-1 text-xs text-slate-500">Vui lòng dùng ảnh rõ nét, không lóa sáng, chụp đầy đủ 4 góc giấy tờ.</p>

            <label
              htmlFor="business-license-input"
              className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-5 text-center transition-colors hover:border-indigo-300"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Chạm để chọn ảnh giấy tờ</p>
              <p className="mt-1 text-xs text-slate-500">Định dạng JPG, PNG, WEBP - tối đa 12MB</p>

              <div className="mx-auto mt-4 max-w-[220px] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Khung hướng dẫn</p>
                <div className="mt-2 rounded-lg border border-dashed border-slate-300 p-2 text-[11px] text-slate-500">
                  Đảm bảo tài liệu nằm trọn trong khung, nội dung đọc rõ và không bị mờ.
                </div>
              </div>
            </label>

            <input
              id="business-license-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleSelectFile}
            />

            {selectedFile && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Tệp đã chọn:</p>
                <p className="truncate">{selectedFile.name}</p>
              </div>
            )}

            {(fileError || submitError) && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{fileError || submitError?.message}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitVerification}
              disabled={isSubmissionLocked || isSubmitting || !selectedFile}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi hồ sơ...
                </>
              ) : uiStatus === 'PENDING' ? (
                'Đang xử lý'
              ) : (
                'Gửi yêu cầu xác thực'
              )}
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 to-cyan-600 p-5 text-white shadow-xl shadow-emerald-900/15">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-xl font-bold">Hồ sơ xác thực đã được ghi nhận</h3>
          <p className="mt-1 text-sm text-emerald-50/90">
            {uiStatus === 'VERIFIED'
              ? 'Doanh nghiệp của bạn đã được xác minh thành công.'
              : 'Hệ thống đang xử lý hồ sơ. Bạn sẽ nhận thông báo ngay khi có kết quả.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <p className={`text-sm font-semibold ${statusStyle.textClass}`}>{statusStyle.label}</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">{estimatedReviewText}</p>

          {latestRequest?.status === 'REJECTED' && latestRequest.rejectionReason && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Lý do từ chối: {latestRequest.rejectionReason}
            </div>
          )}

          {(businessLicenseUrl || latestRequest?.documentUrl) && (
            <a
              href={latestRequest?.documentUrl || businessLicenseUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <ImagePlus className="h-4 w-4" />
              Xem tài liệu đã tải lên
            </a>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStep('overview')}
              className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Quay lại tổng quan
            </button>
            <Link
              to="/employer/profile"
              className="min-h-11 flex-1 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Về trang hồ sơ
            </Link>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto w-full max-w-md">
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: '/employer/profile' })}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h1 className="text-base font-bold text-slate-900">Employer Verification Center</h1>
              <p className="text-xs text-slate-500">E-KYC & Trust Building</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
          </div>
        </header>

        <main className="px-4 pt-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'upload', label: 'Tải giấy tờ' },
              { key: 'success', label: 'Hoàn tất' },
            ].map((step) => {
              const isActive = activeStep === step.key;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStep(step.key as VerificationStep)}
                  className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  } ${isSubmissionLocked && step.key === 'upload' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isSubmissionLocked && step.key === 'upload'}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          {renderStepContent()}
        </main>
      </div>
    </div>
  );
}
