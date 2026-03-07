import { createRootRoute, Outlet, useNavigate, useLocation, Link } from '@tanstack/react-router';
import { BriefcaseBusiness } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useEffect } from 'react';
import { CandidateBottomNav } from '../components/ui/CandidateBottomNav';
import { EmployerBottomNav } from '../components/ui/EmployerBottomNav';
import { GlobalHeader } from '../components/ui/GlobalHeader';

export const Route = createRootRoute({
    component: RootLayout,
});

/* ── Auth pages that should never show nav ─────── */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/onboarding'];
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
        }
    }, [role, needsProfileSetup, loading, location.pathname, navigate]);
    const isCandidateRoute = role === 'CANDIDATE' && !isAuthPage;
    const isEmployerRoute = role === 'EMPLOYER' && !isAuthPage;

    // Whether to show mobile-first app layout
    const isAppLayout = isCandidateRoute || isEmployerRoute;

    // Prevent flicker while resolving persisted auth/profile state.
    if (loading || shouldRedirectGuestToOnboarding) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-full max-w-sm px-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="animate-pulse space-y-3">
                            <div className="h-4 w-32 rounded bg-slate-200" />
                            <div className="h-3 w-full rounded bg-slate-200" />
                            <div className="h-3 w-5/6 rounded bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
            {/* ── Global Header ─────────────────── */}
            <GlobalHeader />

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
