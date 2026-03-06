import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSubmitVerification } from '@/features/employer/hooks/useVerification';
import {
    ArrowLeft, ShieldCheck, Infinity, TrendingUp, Clock,
    Image as ImageIcon, Zap, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/employer/verification/')({
    component: EmployerVerificationPage,
});

type Step = 'OVERVIEW' | 'UPLOAD' | 'SUCCESS';

function EmployerVerificationPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('OVERVIEW');
    const [, setFile] = useState<File | null>(null);

    const submitVerification = useSubmitVerification();

    // If already verified or pending, adjust step automatically
    const verificationStatus = userProfile?.verification_status || 'UNVERIFIED';

    if (!userProfile) return null;

    if (verificationStatus === 'PENDING' && step !== 'SUCCESS') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col pt-12">
                <div className="px-5">
                    <button onClick={() => navigate({ to: '/employer/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
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
                    <button onClick={() => navigate({ to: '/employer/profile' })} className="mb-6 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <SuccessView status="VERIFIED" />
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
                            else navigate({ to: '/employer/profile' });
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
                        <SuccessView status="PENDING" />
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
                    Nâng tầm uy tín cho doanh nghiệp của bạn
                </h2>
                <p className="text-[15px] text-slate-600 text-center mb-8">
                    Xác thực tài khoản để mở khóa toàn bộ tính năng và tạo niềm tin với ứng viên.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <Infinity className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Đăng tin không giới hạn</h3>
                            <p className="text-sm text-slate-500 mt-1">Không giới hạn số lượng tin tuyển dụng mỗi tháng</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Huy hiệu Đã xác thực</h3>
                            <p className="text-sm text-slate-500 mt-1">Hiển thị huy hiệu uy tín trên hồ sơ công ty</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-slate-900">Tăng tỉ lệ ứng tuyển lên 40%</h3>
                            <p className="text-sm text-slate-500 mt-1">Ứng viên tin tưởng hơn vào các doanh nghiệp đã xác thực</p>
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
        <div className="h-full bg-slate-900 relative flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">

            {/* Background camera simulation */}
            <div className="absolute inset-0 bg-slate-800 opacity-50" />

            {/* Viewfinder Frame */}
            <div className="relative z-10 w-[90%] aspect-[1.58] max-w-sm rounded-[1.5rem] border-4 border-dashed border-white/60 flex items-center justify-center shadow-2xl">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-[1.2rem]" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-[1.2rem]" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-[1.2rem]" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-[1.2rem]" />

                <p className="text-white/80 font-medium text-center px-4 bg-black/40 py-2 rounded-full backdrop-blur-sm">
                    Đặt mặt trước CCCD / GPKD vào khung hình
                </p>
            </div>

            {/* Guide tags */}
            <div className="absolute bottom-40 z-10 flex gap-4 w-full justify-center">
                <div className="flex flex-col items-center gap-2 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-medium">Đủ ánh sáng</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <div className="w-5 h-5 rounded-full border-2 border-white/80" />
                    </div>
                    <span className="text-xs font-medium">Không lóa</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-medium">Rõ nét</span>
                </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-0 w-full h-32 bg-black/80 backdrop-blur-xl flex items-center justify-around px-8">
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
                    className="flex flex-col items-center gap-1 opacity-80 hover:opacity-100 transition disabled:opacity-50"
                >
                    <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] text-white">Thư viện</span>
                </button>

                <button
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-slate-900 ring-4 ring-blue-600 active:scale-95 transition-transform shadow-xl disabled:opacity-50"
                >
                    {isUploading ? (
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <div className="w-16 h-16 rounded-full border border-slate-200" />
                    )}
                </button>

                <button className="flex flex-col items-center gap-1 hover:opacity-100 transition opacity-0 cursor-default">
                    {/* Placeholder for layout balance */}
                    <div className="w-12 h-12" />
                </button>
            </div>

        </div>
    );
}

// ── 3. Success / Pending State ──
function SuccessView({ status }: { status: 'PENDING' | 'VERIFIED' }) {
    return (
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">

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
                        ? 'Cảm ơn bạn đã đồng hành cùng JobNow. Doanh nghiệp của bạn hiện đang tận hưởng đầy đủ các đặc quyền xác thực.'
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

                <Link
                    to="/employer/profile"
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-md text-center transition-colors"
                >
                    Về Trang chủ
                </Link>

            </div>
        </div>
    );
}
