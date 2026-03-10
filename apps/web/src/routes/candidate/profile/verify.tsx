import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSubmitCandidateVerification } from '@/features/candidate/verification/hooks/useVerification';
import {
  ArrowLeft, ShieldCheck, Infinity, TrendingUp, Clock,
  Image as ImageIcon, Zap, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/profile/verify')({
  component: CandidateVerificationPage,
});

type Step = 'OVERVIEW' | 'UPLOAD' | 'SUCCESS';

function CandidateVerificationPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('OVERVIEW');
  const [, setFile] = useState<File | null>(null);
  const submitVerification = useSubmitCandidateVerification();
  const isMutationActive = submitVerification.isPending;

  // If already verified or pending, adjust step automatically
  const verificationStatus = userProfile?.verification_status || 'UNVERIFIED';

  if (!userProfile) return null;

  // Chỉ tự động chuyển sang trang thông báo nếu KHÔNG trong quá trình upload
  if (verificationStatus === 'PENDING' && !isMutationActive && step !== 'SUCCESS') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
        <div className="px-5">
          <button onClick={() => navigate({ to: '/candidate/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <SuccessView status="PENDING" />
        </div>
      </div>
    );
  }

  if (verificationStatus === 'VERIFIED') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
        <div className="px-5">
          <button onClick={() => navigate({ to: '/candidate/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <SuccessView status="VERIFIED" />
        </div>
      </div>
    );
  }

  const handleUploadComplete = async (selectedFile: File) => {
    // Kiểm tra kích thước file (Tối đa 10MB cho đồng bộ với rule)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh quá lớn (tối đa 10MB). Vui lòng chọn ảnh khác.');
      return;
    }

    try {
      setFile(selectedFile);
      await submitVerification.mutateAsync(selectedFile);
      setStep('SUCCESS');
      toast.success('Gửi hồ sơ thành công!');
    } catch (e) {
      // Lỗi đã được xử lý trong hook bằng toast.error
      setFile(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-sans pb-10">
      {/* Top Bar */}
      {step !== 'SUCCESS' && (
        <div className="flex items-center p-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md">
          <button
            onClick={() => {
              if (step === 'UPLOAD') setStep('OVERVIEW');
              else navigate({ to: '/candidate/profile' });
            }}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-200/50 transition"
          >
            <ArrowLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 ml-2">
            {step === 'OVERVIEW' ? 'Xác thực định danh' : 'Tải lên Căn cước'}
          </h1>
        </div>
      )}

      {/* Content */}
      <div className={step === 'UPLOAD' ? 'h-[calc(100vh-70px)]' : 'px-5'}>
        {step === 'OVERVIEW' && <OverviewView onNext={() => setStep('UPLOAD')} />}
        {step === 'UPLOAD' && (
          <UploadView
            isUploading={submitVerification.isPending}
            onUpload={handleUploadComplete}
          />
        )}
        {step === 'SUCCESS' && (
          <div className="pt-20 px-5">
            <SuccessView status="PENDING" />
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewView({ onNext }: { onNext: () => void }) {
  return (
    <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
      </div>

      <div className="w-full bg-white rounded-[2rem] p-6 shadow-sm mb-6 border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
          Xác thực để nhận nhiều việc hơn
        </h2>
        <p className="text-[14px] text-slate-600 text-center mb-8">
          Ứng viên được xác thực có tỉ lệ được tuyển dụng cao hơn gấp 2 lần.
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ưu tiên hiển thị</h3>
              <p className="text-xs text-slate-500 mt-1">Hồ sơ của bạn sẽ đứng đầu khi nhà tuyển dụng tìm kiếm</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tăng điểm uy tín</h3>
              <p className="text-xs text-slate-500 mt-1">Nhận ngay +50 điểm Reputation ngay sau xác thực</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Infinity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mở khóa tính năng rút tiền</h3>
              <p className="text-xs text-slate-500 mt-1">Yêu cầu rút lương về ví điện tử hoặc ngân hàng</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
      >
        BẮT ĐẦU XÁC THỰC
      </button>

      <div className="flex items-center gap-2 mt-6 text-slate-400 text-[13px]">
        <Clock className="w-4 h-4" />
        <span>Quy trình tự động, chỉ mất 1 phút</span>
      </div>
    </div>
  );
}

function UploadView({ isUploading, onUpload }: { isUploading: boolean, onUpload: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center animate-in fade-in duration-300">
      <div className="w-full max-w-sm">
        <h3 className="text-[15px] font-bold text-slate-900 mb-4 px-1 text-center">
          Mặt trước Thẻ Căn cước / Chứng minh thư
        </h3>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full aspect-[1.58] rounded-3xl border-2 border-dashed 
            flex flex-col items-center justify-center gap-4 transition-all
            ${isUploading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 active:scale-[0.98]'}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-500">Đang tải lên...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-blue-600">Bấm để chọn ảnh</p>
                <p className="text-xs text-slate-400 mt-1">Hỗ trợ định dạng JPG, PNG</p>
              </div>
            </>
          )}
        </button>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Hãy đảm bảo ảnh chụp rõ nét, không bị lóa sáng và không bị mất góc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessView({ status }: { status: 'PENDING' | 'VERIFIED' }) {
  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className="w-full bg-white rounded-[2rem] p-8 shadow-sm flex flex-col items-center border border-slate-100">
        {status === 'VERIFIED' ? (
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-blue-500" />
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 text-center mb-3">
          {status === 'VERIFIED' ? 'Đã xác thực thành công!' : 'Hồ sơ đang được duyệt!'}
        </h2>

        <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
          {status === 'VERIFIED'
            ? 'Tài khoản của bạn đã được xác minh. Bạn có thể tự tin ứng tuyển mọi công việc.'
            : 'Chúng tôi đang kiểm tra hồ sơ của bạn. Kết quả sẽ có trong vòng 24 giờ tới.'}
        </p>

        <div className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8">
          <span className="text-sm font-semibold text-slate-600">Trạng thái:</span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {status === 'VERIFIED' ? 'ĐÃ XÁC THỰC' : 'CHỜ DUYỆT'}
          </span>
        </div>

        <Link
          to="/candidate/profile"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md text-center"
        >
          Về Hồ sơ
        </Link>
      </div>
    </div>
  );
}
