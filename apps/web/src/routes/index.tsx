import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEffect } from 'react';
import { BriefcaseBusiness, MapPin, Clock, Shield } from 'lucide-react';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    const { user, role } = useAuth();
    const navigate = useNavigate();

    // Redirect candidates to their dashboard
    useEffect(() => {
        if (role === 'CANDIDATE') {
            navigate({ to: '/candidate' });
        }
    }, [role, navigate]);

    // If candidate, show nothing while redirecting
    if (role === 'CANDIDATE') return null;

    return (
        <div className="min-h-[calc(100vh-12rem)]">
            {/* Hero Section */}
            <section className="container mx-auto px-4 max-w-7xl py-16 md:py-24">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight leading-tight">
                        Tìm việc làm thời vụ
                        <span className="block text-primary-600 mt-1">ngay gần bạn</span>
                    </h1>
                    <p className="text-lg text-slate-600 mt-4 max-w-lg">
                        Nền tảng kết nối việc làm thời vụ theo GPS. Tìm việc nhanh, làm ngay, nhận tiền liền.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        {!user ? (
                            <>
                                <Link
                                    to="/register"
                                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                                >
                                    Bắt đầu miễn phí
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/jobs"
                                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors"
                            >
                                Xem tin tuyển dụng
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 max-w-7xl pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: MapPin, title: 'Tìm việc theo GPS', desc: 'Xem ngay công việc xung quanh bạn trên bản đồ' },
                        { icon: Clock, title: 'Ứng tuyển tức thì', desc: 'Chỉ 1 chạm để nhận ca làm, không cần CV phức tạp' },
                        { icon: Shield, title: 'An toàn & Uy tín', desc: 'Hệ thống xác thực eKYC, chấm điểm uy tín cả 2 bên' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                                <Icon className="w-5 h-5 text-primary-600" />
                            </div>
                            <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">{title}</h3>
                            <p className="text-sm text-slate-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
