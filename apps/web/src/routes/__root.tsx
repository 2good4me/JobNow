import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { BriefcaseBusiness, Menu, Search } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    const { user, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Premium Glassmorphic Navigation Bar */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary-600 p-2 rounded-xl text-white group-hover:bg-primary-500 transition-colors shadow-sm">
                                <BriefcaseBusiness className="w-5 h-5" />
                            </div>
                            <span className="font-heading font-black text-xl tracking-tight text-slate-900">
                                Job<span className="text-primary-600">Now</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex gap-6">
                            <Link to="/jobs" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors [&.active]:text-primary-600 [&.active]:after:absolute [&.active]:after:-bottom-4 [&.active]:after:left-0 [&.active]:after:w-full [&.active]:after:h-1 [&.active]:after:bg-primary-600 [&.active]:after:rounded-t-full relative">
                                Tìm việc quanh đây
                            </Link>
                            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">
                                Nhà tuyển dụng
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Search className="w-5 h-5" />
                        </button>

                        {!user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-full shadow-sm transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                                    Đăng ký
                                </Link>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4 bg-white/80 pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                    {user.email?.[0].toUpperCase() || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 leading-none">{user.email?.split('@')[0]}</span>
                                    <span className="text-[10px] text-primary-600 font-semibold uppercase mt-0.5">Ứng viên</span>
                                </div>
                                <div className="h-4 w-px bg-slate-200 mx-2" />
                                <button
                                    onClick={() => signOut()}
                                    className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}

                        <button className="md:hidden flex items-center justify-center p-2 text-slate-800">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full bg-slate-50/50">
                <Outlet />
            </main>

            {/* Modern Footer Area */}
            <footer className="bg-white border-t border-slate-200/60 mt-auto py-8">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between opacity-70">
                    <div className="flex items-center gap-2 mb-4 md:mb-0 grayscale">
                        <BriefcaseBusiness className="w-5 h-5 text-slate-400" />
                        <span className="font-heading font-bold text-lg text-slate-400">JobNow</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 JobNow Application. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
