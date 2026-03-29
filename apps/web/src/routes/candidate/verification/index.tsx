import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSubmitCandidateVerification } from '@/features/candidate/verification/hooks/useVerification';
import {
    ArrowLeft, ShieldCheck, Zap,
    Clock, Image as ImageIcon, CheckCircle2,
    Briefcase, Award, Camera, Info, User, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/candidate/verification/')({
    component: CandidateVerificationPage,
});

type Step = 'OVERVIEW' | 'ID_UPLOAD' | 'PORTRAIT_UPLOAD' | 'OCR_CONFIRM' | 'SUCCESS';

function CandidateVerificationPage() {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('OVERVIEW');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [portraitFile, setPortraitFile] = useState<File | null>(null);
    const [ocrData, setOcrData] = useState<{
        cccd_number: string;
        full_name: string;
        dob: string;
    }>({
        cccd_number: '',
        full_name: '',
        dob: ''
    });

    const submitVerification = useSubmitCandidateVerification();

    const handleIdUpload = (file: File) => {
        setFrontFile(file);
        // Simulate OCR extraction logic here
        // In reality, Step 1 UPLOAD will call the API to pre-fill
        setOcrData({
            cccd_number: '0012010xxxxx',
            full_name: userProfile?.full_name || '',
            dob: '01/01/1990'
        });
        setStep('PORTRAIT_UPLOAD');
    };

    const handlePortraitUpload = (file: File) => {
        setPortraitFile(file);
        setStep('OCR_CONFIRM');
    };

    const handleFinalSubmit = async () => {
        if (!frontFile) return;
        try {
            await submitVerification.mutateAsync({
                frontFile,
                portraitFile,
                confirmedOcr: ocrData
            });
            setStep('SUCCESS');
            toast.success('Hồ sơ đã được gửi để duyệt!');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 font-sans">
            {/* Header Content */}
            {step !== 'SUCCESS' && (
                <div className="flex items-center p-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md">
                    <button
                        onClick={() => {
                            if (step === 'ID_UPLOAD') setStep('OVERVIEW');
                            else if (step === 'PORTRAIT_UPLOAD') setStep('ID_UPLOAD');
                            else if (step === 'OCR_CONFIRM') setStep('PORTRAIT_UPLOAD');
                            else navigate({ to: '/candidate/profile' });
                        }}
                        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-200/50 transition"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 ml-2">
                        {step === 'OVERVIEW' ? 'Xác thực tài khoản' : 
                         step === 'ID_UPLOAD' ? 'Bước 1: Chụp CCCD' :
                         step === 'PORTRAIT_UPLOAD' ? 'Bước 2: Chụp chân dung' :
                         'Bước 3: Xác nhận thông tin'}
                    </h1>
                </div>
            )}

            {/* Content Swapping */}
            <div className={step === 'ID_UPLOAD' || step === 'PORTRAIT_UPLOAD' ? 'h-[calc(100vh-70px)]' : 'px-5 pb-24'}>
                {step === 'OVERVIEW' && <OverviewView onNext={() => setStep('ID_UPLOAD')} />}
                {step === 'ID_UPLOAD' && (
                    <UploadView
                        title="Mặt trước CCCD/CMND"
                        description="Vui lòng tải lên ảnh chụp mặt trước CCCD của bạn."
                        onUpload={handleIdUpload}
                    />
                )}
                {step === 'PORTRAIT_UPLOAD' && (
                    <UploadView
                        title="Ảnh chân dung"
                        description="Vui lòng chụp ảnh khuôn mặt của bạn để đối chiếu."
                        icon={<Camera className="w-8 h-8 text-blue-500" />}
                        onUpload={handlePortraitUpload}
                    />
                )}
                {step === 'OCR_CONFIRM' && (
                    <ConfirmView 
                        data={ocrData}
                        setData={setOcrData}
                        isSubmitting={submitVerification.isPending}
                        onSubmit={handleFinalSubmit}
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
                className="w-full h-14 bg-[#0f172a] hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
                Bắt đầu ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center gap-2 mt-6 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>Quy trình diễn ra trong 2 phút</span>
            </div>
        </div>
    );
}

// ── 2. Universal Upload Step ──
function UploadView({ 
    title, 
    description, 
    onUpload, 
    icon = <ImageIcon className="w-8 h-8 text-blue-500" /> 
}: { 
    title: string;
    description: string;
    onUpload: (file: File) => void;
    icon?: React.ReactNode;
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsProcessing(true);
            setTimeout(() => {
                onUpload(e.target.files![0]);
                setIsProcessing(false);
            }, 800);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-300 px-5 relative -mt-5">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-500 text-center text-[15px] mb-8 max-w-sm">
                {description}
            </p>

            <div
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`w-full max-w-md aspect-[1.3] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${isProcessing
                    ? 'border-slate-300 bg-slate-50 opacity-70'
                    : 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400'
                    }`}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-sm" />
                        <span className="text-slate-700 font-bold mb-1">Đang xử lý...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-blue-100 flex items-center justify-center shadow-sm mb-5">
                            {icon}
                        </div>
                        <span className="text-slate-800 font-bold text-lg mb-1">Bắt đầu chụp</span>
                        <span className="text-slate-500 text-sm font-medium">Hoặc nhấn để chọn từ thư viện</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isProcessing}
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

// ── 3. Confirm & Edit OCR Inform Flow ──
function ConfirmView({ data, setData, isSubmitting, onSubmit }: { 
    data: any; 
    setData: any; 
    isSubmitting: boolean;
    onSubmit: () => void;
}) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                    Vui lòng kiểm tra kỹ thông tin được trích xuất từ CCCD của bạn. Bạn có thể chỉnh sửa nếu có sai sót.
                </p>
            </div>

            <div className="space-y-4 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Họ và tên</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={(e) => setData({ ...data, full_name: e.target.value })}
                            className="w-full bg-slate-50 p-4 pl-11 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Số CCCD / CMND</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={data.cccd_number}
                            onChange={(e) => setData({ ...data, cccd_number: e.target.value })}
                            className="w-full bg-slate-50 p-4 pl-11 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Ngày sinh</label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={data.dob}
                            onChange={(e) => setData({ ...data, dob: e.target.value })}
                            className="w-full bg-slate-50 p-4 pl-11 rounded-2xl border-none font-bold text-slate-900 outline-none focus:ring-2 ring-blue-500/20"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ĐANG GỬI...
                        </>
                    ) : (
                        'XÁC NHẬN & HOÀN TẤT'
                    )}
                </button>
            </div>
        </div>
    );
}

// ── 4. Success / Pending State ──
function SuccessView({ status, onRetry }: { status: 'PENDING' | 'VERIFIED', onRetry?: () => void }) {
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
