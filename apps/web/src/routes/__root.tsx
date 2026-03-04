import { createRootRoute, Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { BriefcaseBusiness, Menu, X } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useEffect, useState } from 'react';
import { CandidateBottomNav } from '../components/ui/CandidateBottomNav';
import { EmployerBottomNav } from '../components/ui/EmployerBottomNav';

export const Route = createRootRoute({
    component: RootLayout,
});

/* ── Auth pages that should never show nav ─────── */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/onboarding'];

function RootLayout() {
    const { user, userProfile, role, needsOnboarding, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect to onboarding if user is logged in but has no profile
    useEffect(() => {
        if (needsOnboarding && !isAuthPage) {
            navigate({ to: '/onboarding' });
        }
    }, [needsOnboarding, navigate, location.pathname]);

    // Redirect candidates/employers to their dashboard after login
    useEffect(() => {
        if (location.pathname === '/') {
            if (role === 'CANDIDATE') navigate({ to: '/candidate' });
            if (role === 'EMPLOYER') navigate({ to: '/employer' });
        }
    }, [role, location.pathname, navigate]);

    const isAuthPage = AUTH_ROUTES.some((r) => location.pathname.startsWith(r));
    const isCandidateRoute = role === 'CANDIDATE' && !isAuthPage;
    const isEmployerRoute = role === 'EMPLOYER' && !isAuthPage;

    // Whether to show mobile-first app layout
    const isAppLayout = isCandidateRoute || isEmployerRoute;

    // Auth pages render bare (no nav chrome)
    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* ── Desktop/Guest Header ─────────────────── */}
            {!isAppLayout && (
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
                        </div>

                        <div className="flex items-center gap-4">
                            {!user ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-full shadow-sm transition-all">
                                        Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-4 bg-white/80 pl-2 pr-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {(userProfile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800 leading-none">
                                            {userProfile?.full_name || user.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200 mx-2" />
                                    <button
                                        onClick={() => signOut()}
                                        className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}

                            <button
                                className="md:hidden flex items-center justify-center p-2 text-slate-800"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-3 animate-fade-in-up">
                            {!user ? (
                                <>
                                    <Link to="/login" className="block w-full text-center py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="block w-full text-center py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                                        Đăng ký
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm font-medium text-slate-600 px-2">
                                        {userProfile?.full_name || user.email}
                                    </div>
                                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full text-left px-2 py-2 text-sm text-red-600 font-medium">
                                        Đăng xuất
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </header>
            )}

            {/* ── Main Content ─────────────────────────── */}
            <main className={`flex-1 w-full pb-20 ${isAppLayout ? '' : 'bg-slate-50/50'}`}>
                <Outlet />
            </main>

            {/* ── Bottom Navs ─────────────────── */}
            {isCandidateRoute && <CandidateBottomNav />}
            {isEmployerRoute && <EmployerBottomNav />}

            {/* ── Footer (Guest only) ─────────── */}
            {!isAppLayout && (
                <footer className="bg-white border-t border-slate-200/60 mt-auto py-8">
                    <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between opacity-70">
                        <div className="flex items-center gap-2 mb-4 md:mb-0 grayscale">
                            <BriefcaseBusiness className="w-5 h-5 text-slate-400" />
                            <span className="font-heading font-bold text-lg text-slate-400">JobNow</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/support-center" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">
                                Hỗ trợ
                            </Link>
                            <p className="text-sm text-slate-500">© 2026 JobNow Application. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
