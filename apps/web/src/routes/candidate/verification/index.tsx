import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSubmitCandidateVerification } from '@/features/candidate/verification/hooks/useVerification';
import {
    ArrowLeft, ShieldCheck, Zap,
    Clock, Image as ImageIcon, CheckCircle2,
    Briefcase, Award
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/verification/')({
    component: CandidateVerificationPage,
});

type Step = 'OVERVIEW' | 'UPLOAD' | 'SUCCESS';

function CandidateVerificationPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('OVERVIEW');
    const [, setFile] = useState<File | null>(null);

    const submitVerification = useSubmitCandidateVerification();

    // If already verified or pending, adjust step automatically
    const verificationStatus = userProfile?.verification_status || 'UNVERIFIED';

    if (!userProfile) return null;

    if (verificationStatus === 'PENDING' && step !== 'SUCCESS') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
                <div className="px-5">
                    <button onClick={() => navigate({ to: '/candidate/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <SuccessView status="PENDING" profile={userProfile} />
                </div>
            </div>
        );
    }

    if (verificationStatus === 'VERIFIED' && step !== 'UPLOAD') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
                <div className="px-5">
                    <button onClick={() => navigate({ to: '/candidate/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <SuccessView status="VERIFIED" profile={userProfile} onRetry={() => setStep('UPLOAD')} />
                </div>
            </div>
        );
    }

    const handleUploadComplete = async (selectedFile: File) => {
        try {
            setFile(selectedFile);
            // Execute upload
            await submitVerification.mutateAsync(selectedFile);
            setStep('SUCCESS');
            toast.success('Gửi hồ sơ thành công!');
        } catch (e) {
            // Toast already handled in hook
            setFile(null);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 font-sans">
            {/* Top Bar for Overview and Upload */}
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
                        {step === 'OVERVIEW' ? 'Xác thực tài khoản' : 'Chụp ảnh giấy tờ'}
                    </h1>
                </div>
            )}

            {/* Main Content Areas */}
            <div className={step === 'UPLOAD' ? 'h-[calc(100vh-70px)]' : 'px-5 pb-24'}>
                {step === 'OVERVIEW' && <OverviewView onNext={() => setStep('UPLOAD')} />}
                {step === 'UPLOAD' && (
                    <UploadView
                        isUploading={submitVerification.isPending}
                        onUpload={handleUploadComplete}
                    />
                )}
                {step === 'SUCCESS' && (
                    <div className="pt-20 px-5">
                        <SuccessView status="PENDING" profile={userProfile} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── 1. Overview Screen ──
function OverviewView({ onNext }: { onNext: () => void }) {
    return (
        <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Hero Icon */}
            <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <ShieldCheck className="w-12 h-12 text-white" />
                </div>
            </div>

            <div className="w-full bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
                    Nâng tầm uy tín cho hồ sơ của bạn
                </h2>
                <p className="text-[15px] text-slate-600 text-center mb-8">
                    Xác thực tài khoản để nổi bật trong mắt nhà tuyển dụng và nhận được nhiều cơ hội việc làm hơn.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Ứng tuyển nhanh chóng</h3>
                            <p className="text-sm text-slate-500 mt-1">Chỉ cần một chạm để ứng tuyển công việc mong muốn</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Huy hiệu Đã xác thực</h3>
                            <p className="text-sm text-slate-500 mt-1">Hiển thị huy hiệu uy tín trên hồ sơ cá nhân</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Tăng tỉ lệ nhà tuyển dụng chú ý lên 40%</h3>
                            <p className="text-sm text-slate-500 mt-1">Nhà tuyển dụng ưu tiên liên hệ với các ứng viên đã xác thực</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
                XÁC THỰC NGAY
            </button>

            <div className="flex items-center gap-2 mt-6 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Quy trình diễn ra trong 2 phút</span>
            </div>
        </div>
    );
}

// ── 2. Document Upload Flow ──
function UploadView({ isUploading, onUpload }: { isUploading: boolean, onUpload: (file: File) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-300 px-5 relative -mt-5">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Tải ảnh lên</h2>
            <p className="text-slate-500 text-center text-[15px] mb-8 max-w-sm">
                Vui lòng tải lên ảnh chụp mặt trước CCCD / CMND của bạn.
            </p>

            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`w-full max-w-md aspect-[1.3] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading
                    ? 'border-slate-300 bg-slate-50 opacity-70'
                    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400'
                    }`}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-sm" />
                        <span className="text-slate-700 font-bold mb-1">Đang tải lên...</span>
                        <span className="text-slate-400 text-sm">Vui lòng đợi giây lát</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-blue-100 flex items-center justify-center shadow-sm mb-5">
                            <ImageIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <span className="text-slate-800 font-bold text-lg mb-1">Nhấn để chọn ảnh</span>
                        <span className="text-slate-500 text-sm font-medium">Hỗ trợ JPG, PNG (Tối đa 5MB)</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
            />

            <div className="mt-10 flex gap-6 w-full max-w-sm justify-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-slate-600 text-[13px] font-semibold">Rõ nét</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-slate-600 text-[13px] font-semibold">Đủ sáng</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500" />
                    </div>
                    <span className="text-slate-600 text-[13px] font-semibold">Không chói</span>
                </div>
            </div>
        </div>
    );
}

// ── 3. Success / Pending State ──
function SuccessView({ status, profile, onRetry }: { status: 'PENDING' | 'VERIFIED', profile: any, onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 pb-12">

            <div className="w-full bg-gradient-to-b from-blue-50 to-white rounded-[2rem] p-8 shadow-sm flex flex-col items-center border border-blue-100/50">

                {status === 'VERIFIED' ? (
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-emerald-400/30 blur-2xl rounded-full" />
                        <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" />
                    </div>
                ) : (
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-400/30 blur-2xl rounded-full" />
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center relative z-10 border-4 border-white shadow-md">
                            <Clock className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
                    {status === 'VERIFIED' ? 'Tài khoản đã xác thực' : 'Gửi hồ sơ thành công!'}
                </h2>

                <p className="text-center text-slate-600 mb-8 leading-relaxed">
                    {status === 'VERIFIED'
                        ? 'Cảm ơn bạn đã đồng hành cùng JobNow. Hồ sơ của bạn hiện đang tận hưởng đầy đủ các đặc quyền xác thực.'
                        : 'Cảm ơn bạn đã hoàn tất xác thực. Đội ngũ JobNow sẽ xét duyệt hồ sơ của bạn trong vòng 1-2 ngày làm việc.'}
                </p>

                <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-slate-100 flex items-center justify-between mb-8 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">Trạng thái:</span>
                    {status === 'VERIFIED' ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" /> Đã duyệt
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> Đang chờ duyệt
                        </span>
                    )}
                </div>

                {status === 'PENDING' && (
                    <p className="text-xs text-slate-500 text-center mb-8 px-4">
                        * Huy hiệu Đã xác thực sẽ hiển thị ngay khi được phê duyệt.
                    </p>
                )}

                {profile?.cccd_number && (
                    <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-8 text-left space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Thông tin trích xuất</h3>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                            <p className="text-[15px] font-semibold text-slate-900">{profile.cccd_full_name || 'Không xác định'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Số CCCD/CMND</p>
                            <p className="text-[15px] font-semibold text-slate-900">{profile.cccd_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                            <p className="text-[15px] font-semibold text-slate-900">{profile.cccd_dob || 'Không xác định'}</p>
                        </div>
                    </div>
                )}

                <div className="w-full flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-bold py-4 rounded-xl shadow-md text-center transition-colors"
                        >
                            Quét lại
                        </button>
                    )}
                    <Link
                        to="/candidate/profile"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-md text-center transition-colors block"
                    >
                        Về Trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
