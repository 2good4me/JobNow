import { createRootRoute, Outlet, useNavigate, useLocation, Link } from '@tanstack/react-router';
import { BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useEffect } from 'react';
import { CandidateBottomNav } from '../components/ui/CandidateBottomNav';
import { EmployerBottomNav } from '../components/ui/EmployerBottomNav';
import { GlobalHeader } from '../components/ui/GlobalHeader';
import { Toaster } from 'sonner';
import { useOnlineStatus } from '../features/auth/hooks/useOnlineStatus';
import { useFCM } from '../hooks/useFCM';
import { ThemeProvider, useTheme } from '../components/ThemeProvider';

export const Route = createRootRoute({
    component: RootApp,
});

function RootApp() {
    return (
        <ThemeProvider>
            <RootLayout />
        </ThemeProvider>
    );
}

/* ── Auth pages that should never show nav ─────── */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/onboarding'];
const ADMIN_ROUTES_PREFIX = '/admin';
const ONBOARDING_STORAGE_KEY = 'jobnow_onboarding_seen';

function hasSeenGuestOnboarding() {
    try {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function RootLayout() {
    const { user, role, needsProfileSetup, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Heartbeat for online status
    useOnlineStatus();
    // Initialize standard notifications
    useFCM();
    
    const isAuthPage = AUTH_ROUTES.some((r) => location.pathname.startsWith(r));
    const guestOnboardingSeen = hasSeenGuestOnboarding();
    const shouldRedirectGuestToOnboarding =
        !loading && !user && !guestOnboardingSeen && location.pathname !== '/onboarding';

    // Guest-first onboarding: first open must see onboarding before auth pages.
    useEffect(() => {
        if (shouldRedirectGuestToOnboarding) {
            navigate({ to: '/onboarding', replace: true });
        }
    }, [shouldRedirectGuestToOnboarding, navigate]);

    // If logged in and still on auth pages, push to correct in-app destination.
    useEffect(() => {
        if (!user || !isAuthPage) return;

        if (needsProfileSetup) {
            if (location.pathname !== '/onboarding') {
                navigate({ to: '/onboarding', replace: true });
            }
            return;
        }

        if (role === 'CANDIDATE') {
            if (!location.pathname.startsWith('/candidate')) {
                navigate({ to: '/candidate', replace: true });
            }
            return;
        }

        if (role === 'EMPLOYER') {
            if (!location.pathname.startsWith('/employer')) {
                navigate({ to: '/employer', replace: true });
            }
        }

        if (role === 'ADMIN') {
            if (!location.pathname.startsWith('/admin')) {
                navigate({ to: '/admin', replace: true });
            }
        }
    }, [user, role, needsProfileSetup, isAuthPage, location.pathname, navigate]);

    // Redirect to profile setup if user is logged in but has no profile.
    useEffect(() => {
        if (loading) return;

        if (needsProfileSetup && !isAuthPage) {
            navigate({ to: '/onboarding', replace: true });
        }
    }, [needsProfileSetup, isAuthPage, loading, navigate]);

    // Redirect candidates/employers to their dashboard after login
    useEffect(() => {
        if (loading) return;

        if (location.pathname === '/') {
            if (needsProfileSetup) {
                navigate({ to: '/onboarding', replace: true });
                return;
            }
            if (role === 'CANDIDATE') navigate({ to: '/candidate', replace: true });
            if (role === 'EMPLOYER') navigate({ to: '/employer', replace: true });
            if (role === 'ADMIN') navigate({ to: '/admin', replace: true });
        }
    }, [role, needsProfileSetup, loading, location.pathname, navigate]);

    const isProtectedRoute = location.pathname.startsWith('/candidate') || 
                             location.pathname.startsWith('/employer') || 
                             location.pathname.startsWith('/admin');

    // Forcefully redirect logged out users from protected routes
    useEffect(() => {
        if (!loading && !user && isProtectedRoute) {
            navigate({ to: '/', replace: true });
        }
    }, [loading, user, isProtectedRoute, navigate]);

    const isCandidateRoute = role === 'CANDIDATE' && !isAuthPage;
    const isEmployerRoute = role === 'EMPLOYER' && !isAuthPage;
    const isAdminRoute = location.pathname.startsWith(ADMIN_ROUTES_PREFIX);
    const isFullScreenFlow = location.pathname.startsWith('/employer/post-job');
    const isChatRoute = location.pathname.includes('/chat');

    // Whether to show mobile-first app layout
    const isAppLayout = isCandidateRoute || isEmployerRoute;
    const { theme } = useTheme();

    // Prevent flicker while resolving persisted auth/profile state.
    if (loading || shouldRedirectGuestToOnboarding) {
        return (
            <div className={`min-h-[100dvh] flex items-center justify-center transition-colors duration-300 ${!isAuthPage && theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-900`}>
                <div className="w-full max-w-sm px-6">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Auth pages render bare (no nav chrome)
    if (isAuthPage) {
        return (
            <div className={`min-h-[100dvh] font-sans transition-colors duration-300 bg-slate-50`}>
                <Outlet />
            </div>
        );
    }

    // Admin routes use their own layout (AdminLayout), no header/nav needed
    if (isAdminRoute) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <Outlet />
                <Toaster position="top-center" richColors />
            </div>
        );
    }

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''}`}>
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-900 font-sans flex flex-col transition-colors duration-300">
            {/* ── Global Header ─────────────────── */}
            <GlobalHeader isAppLayout={isAppLayout} />

            {/* ── Main Content ─────────────────────────── */}
            <main className={`flex-1 w-full ${(isFullScreenFlow || isChatRoute) ? 'pb-0' : 'pb-20'} ${isAppLayout ? '' : 'bg-slate-50/50'}`}>
                <Outlet />
            </main>

            {/* ── Bottom Navs (hidden during full-screen wizard flows) ── */}
            {isCandidateRoute && <CandidateBottomNav />}
            {isEmployerRoute && !isFullScreenFlow && <EmployerBottomNav />}

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

            <Toaster position="top-center" richColors />
        </div>
        </div>
    );
}
