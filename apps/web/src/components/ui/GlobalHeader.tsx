import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { BriefcaseBusiness, Bell, LogOut, Settings, UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';

type AppRoutePath =
    | '/'
    | '/candidate'
    | '/candidate/profile'
    | '/candidate/notifications'
    | '/employer'
    | '/employer/profile'
    | '/employer/profile/settings'
    | '/employer/notifications';

interface GlobalHeaderProps {
    isAppLayout: boolean;
}

function getRoleLabel(role: ReturnType<typeof useAuth>['role']) {
    if (role === 'EMPLOYER') return 'Nhà tuyển dụng';
    if (role === 'CANDIDATE') return 'Ứng viên';
    return 'Người dùng';
}

export function GlobalHeader({ isAppLayout }: GlobalHeaderProps) {
    const { user, userProfile, role, signOut } = useAuth();
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const menuContainerRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    // Lấy số lượng thông báo chưa đọc (áp dụng cho cả Employer và Candidate)
    const unreadCount = useUnreadCount(userProfile?.uid);
    const hasUnread = unreadCount > 0;

    const dashboardPath = useMemo<AppRoutePath>(() => {
        if (!user) return '/';
        if (role === 'CANDIDATE') return '/candidate';
        if (role === 'EMPLOYER') return '/employer';
        return '/';
    }, [user, role]);

    const profilePath = useMemo<AppRoutePath>(() => {
        return role === 'EMPLOYER' ? '/employer/profile' : '/candidate/profile';
    }, [role]);

    const settingsPath = useMemo<AppRoutePath>(() => {
        return role === 'EMPLOYER' ? '/employer/profile/settings' : '/candidate/profile';
    }, [role]);

    const notificationPath = useMemo<AppRoutePath>(() => {
        return role === 'EMPLOYER' ? '/employer/notifications' : '/candidate/notifications';
    }, [role]);

    const isProfileRoute = location.pathname.startsWith('/candidate/profile') || location.pathname.startsWith('/employer/profile');
    const roleLabel = getRoleLabel(role);
    const userDisplayName = userProfile?.full_name || user?.email?.split('@')[0] || 'Người dùng';
    const avatarInitial = (userProfile?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

    useEffect(() => {
        if (!isProfileMenuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!menuContainerRef.current?.contains(target)) {
                setIsProfileMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isProfileMenuOpen]);

    useEffect(() => {
        setIsProfileMenuOpen(false);
    }, [location.pathname]);

    const handleSignOut = async () => {
        if (isSigningOut) return;
        try {
            setIsSigningOut(true);
            await signOut();
            await navigate({ to: '/login' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsSigningOut(false);
            setIsProfileMenuOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20 dark:border-slate-700/50 shadow-sm supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors duration-300">
            <div className={`container mx-auto px-4 ${isAppLayout ? 'max-w-lg' : 'max-w-7xl'} flex h-16 items-center justify-between`}>

                {/* 1. Brand Anchor (Trái) */}
                <Link to={dashboardPath} className="flex items-center gap-2 group outline-none">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl text-white group-hover:scale-105 transition-transform shadow-sm">
                        <BriefcaseBusiness className="w-5 h-5" />
                    </div>
                    <span className="font-heading font-black text-xl tracking-tight text-slate-800 dark:text-slate-100">
                        Job<span className="text-indigo-600 dark:text-indigo-400">Now</span>
                    </span>
                </Link>

                {/* 2. Interaction Hub (Phải) */}
                <div className="flex items-center gap-3">
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 flex items-center">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm transition-transform active:scale-95 h-10 flex items-center">
                                Đăng ký
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Nút Thông báo */}
                            <Link
                                to={notificationPath}
                                className={`relative p-2.5 rounded-full transition-colors active:scale-95 shrink-0 border
                                    ${location.pathname.startsWith(notificationPath)
                                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                                        : 'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                aria-label="Thông báo"
                            >
                                <Bell className={`w-5 h-5 ${location.pathname.startsWith(notificationPath) ? 'fill-primary-100' : ''}`} />
                                {hasUnread && (
                                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                            </Link>

                            {/* Nút Avatar (Kèm Dropdown Profile) */}
                            <div className="relative" ref={menuContainerRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`flex items-center gap-2 p-1 pr-3 bg-white dark:bg-slate-800 border rounded-full shadow-sm transition-colors active:scale-95 text-left min-h-11
                                        ${isProfileRoute ? 'border-primary-300 dark:border-primary-500 ring-2 ring-primary-100 dark:ring-primary-900/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                    aria-haspopup="menu"
                                    aria-expanded={isProfileMenuOpen}
                                    aria-label="Mở menu tài khoản"
                                >
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                            {avatarInitial}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                <div
                                    className={`fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[1px] transition-opacity duration-200
                                        ${isProfileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                    onClick={() => setIsProfileMenuOpen(false)}
                                />

                                <div
                                    className={`absolute right-0 top-[calc(100%+10px)] z-50 w-80 max-w-[calc(100vw-1rem)] rounded-3xl border border-white/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-800/95 p-2 shadow-2xl shadow-slate-900/15 dark:shadow-slate-900/50 backdrop-blur-xl transition-all duration-200 ease-out origin-top-right
                                        ${isProfileMenuOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'}`}
                                >
                                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 p-4">
                                        <div className="flex items-center gap-3">
                                            {userProfile?.avatar_url ? (
                                                <img
                                                    src={userProfile.avatar_url}
                                                    alt={userDisplayName}
                                                    className="w-14 h-14 rounded-2xl object-cover border border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 border border-indigo-200 shadow-sm font-bold text-lg flex items-center justify-center">
                                                    {avatarInitial}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{userDisplayName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{roleLabel}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <Link
                                            to={profilePath}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-11"
                                        >
                                            <UserRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            Trang cá nhân của tôi
                                        </Link>

                                        <Link
                                            to={settingsPath}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-11"
                                        >
                                            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            Cài đặt tài khoản
                                        </Link>

                                        <button
                                            onClick={handleSignOut}
                                            disabled={isSigningOut}
                                            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 bg-rose-50/80 hover:bg-rose-100 transition-colors disabled:opacity-60 min-h-11"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
