import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    Briefcase,
    Headset
} from 'lucide-react';

export const Route = createFileRoute(
    '/candidate/wallet_/transactions/$transactionId'
)({
    component: TransactionDetailsPage,
});

function TransactionDetailsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] antialiased relative z-0">
            {/* Visual Polish Elements (Background blur) */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-[#94ccff] opacity-10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[250px] h-[250px] bg-[#4edea3] opacity-10 blur-[80px] rounded-full"></div>
            </div>

            {/* TopAppBar */}
            <header className="sticky top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-lg border-b border-[#e0e3e5]/50 flex items-center px-4 h-16 w-full max-w-md mx-auto transition-all">
                <button 
                    onClick={() => navigate({ to: '/candidate/wallet' })}
                    className="active:scale-95 transition-transform duration-200 hover:bg-[#e0e3e5]/50 rounded-full p-2 flex items-center justify-center -ml-2"
                >
                    <ArrowLeft className="w-6 h-6 text-[#191c1e]" />
                </button>
                <h1 className="font-semibold text-lg tracking-tight text-[#191c1e] ml-2">Chi tiết giao dịch</h1>
            </header>

            <main className="max-w-md mx-auto px-5 pb-10 mt-2 space-y-8">
                {/* Hero Section */}
                <section className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 bg-[#009668] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#009668]/20">
                        <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    
                    <div className="space-y-1 mb-3">
                        <p className="font-medium text-[12px] tracking-wider text-[#45464d] uppercase font-mono">
                            THANH TOÁN CÔNG VIỆC
                        </p>
                        <h2 className="font-extrabold text-4xl text-[#009668] tracking-tight">
                            +420.000đ
                        </h2>
                    </div>
                    
                    <div className="inline-flex items-center px-4 py-1.5 bg-[#4edea3]/20 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#009668] mr-2"></span>
                        <span className="font-semibold text-sm text-[#009668]">Thành công</span>
                    </div>
                    
                    <p className="text-[#45464d] text-sm leading-relaxed max-w-[280px]">
                        Khoản thanh toán cho ca làm của bạn đã được ghi nhận vào ví.
                    </p>
                </section>

                {/* Transaction Receipt Card */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#e0e3e5]/50 space-y-5">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[#45464d] text-sm font-medium">Loại giao dịch</span>
                            <span className="text-[#191c1e] text-sm font-semibold">Thanh toán</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#45464d] text-sm font-medium">Thời gian</span>
                            <span className="text-[#191c1e] text-sm font-semibold">20:35, 26/03/2026</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[#45464d] text-sm font-medium">Trạng thái</span>
                            <span className="text-[#009668] text-sm font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Thành công
                            </span>
                        </div>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-[#f2f4f6] flex justify-between items-center">
                        <span className="text-[#45464d] text-sm font-medium">Số dư sau giao dịch</span>
                        <span className="text-[#191c1e] text-lg font-bold">1.850.000đ</span>
                    </div>
                </section>

                {/* Context Card (Related Job) */}
                <section className="bg-[#f2f4f6] border border-[#e0e3e5]/40 rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#94ccff]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <div className="relative">
                        <h3 className="font-bold text-sm text-[#191c1e] mb-4">Công việc liên quan</h3>
                        
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-[#e0e3e5]/30">
                                <Briefcase className="w-6 h-6 text-[#004b74]" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[15px] text-[#191c1e] leading-snug">
                                    Phục vụ tiệc cưới Riverside
                                </h4>
                                <div className="space-y-0.5 mt-1">
                                    <p className="text-[#45464d] text-xs flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Ca tối 17:00 - 22:00
                                    </p>
                                    <p className="text-[#45464d] text-xs flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Nhà hàng Riverside Palace
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button className="w-full py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#001d32] font-semibold text-sm active:scale-[0.98] transition-all hover:bg-[#f7f9fb] shadow-sm">
                            Xem công việc
                        </button>
                    </div>
                </section>

                {/* Timeline */}
                <section className="px-1">
                    <h3 className="font-bold text-sm text-[#191c1e] mb-6">Tiến trình thanh toán</h3>
                    
                    <div className="relative space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-[#009668]/20">
                        {/* Step 1 */}
                        <div className="relative flex items-center gap-4">
                            <div className="z-10 w-6 h-6 rounded-full bg-[#009668] flex items-center justify-center shadow-md shadow-[#009668]/20 ring-4 ring-[#f7f9fb]">
                                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-sm text-[#191c1e]">Giao dịch tạo thành công</span>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="relative flex items-center gap-4">
                            <div className="z-10 w-6 h-6 rounded-full bg-[#009668] flex items-center justify-center shadow-md shadow-[#009668]/20 ring-4 ring-[#f7f9fb]">
                                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-sm text-[#191c1e]">Hệ thống xác nhận</span>
                        </div>
                        
                        {/* Step 3 */}
                        <div className="relative flex items-center gap-4">
                            <div className="z-10 w-6 h-6 rounded-full bg-[#009668] flex items-center justify-center shadow-md shadow-[#009668]/20 ring-4 ring-[#f7f9fb]">
                                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium text-sm text-[#191c1e]">Hoàn tất thanh toán</span>
                        </div>
                    </div>
                </section>

                {/* Support Block */}
                <section className="space-y-4 pt-6 border-t border-[#e0e3e5]/60">
                    <div className="space-y-1">
                        <h3 className="font-bold text-[17px] text-[#191c1e]">Cần hỗ trợ giao dịch này?</h3>
                        <p className="text-[#45464d] text-[14px] leading-relaxed">
                            Nếu bạn có thắc mắc về thanh toán, JobNow sẽ hỗ trợ kiểm tra nhanh cho bạn.
                        </p>
                    </div>
                    
                    <button className="w-full py-3.5 bg-white border border-[#e0e3e5] text-[#191c1e] font-semibold text-sm rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-sm hover:bg-[#f2f4f6]">
                        <Headset className="w-5 h-5 text-[#006399]" />
                        <span className="text-[#006399]">Liên hệ hỗ trợ</span>
                    </button>
                </section>
            </main>
        </div>
    );
}
