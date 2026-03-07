import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, ClipboardList, Plus, MessageCircle, UserCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChatUnreadCount } from '@/features/chat/hooks/useChatUnreadCount';

const navItemsDef = [
    { to: '/employer', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/employer/job-list', icon: ClipboardList, label: 'Quản lý', badgeType: 'manage' as const },
    {
        to: '/employer/post-job',
        icon: Plus,
        label: 'Đăng tin',
        isFab: true
    },
    { to: '/employer/chat', icon: MessageCircle, label: 'Chat', badgeType: 'chat' as const },
    { to: '/employer/profile', icon: UserCircle, label: 'Tài khoản' },
] as const;

export function EmployerBottomNav() {
    const location = useLocation();
    const { userProfile } = useAuth();
    const chatUnreadCount = useChatUnreadCount(userProfile?.uid, 'EMPLOYER');

    // TODO: implement logic for unread applicants or pending jobs
    const manageBadgeCount = 0;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-slide-in-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto h-[72px] px-2 relative">
                {navItemsDef.map((item) => {
                    const { to, icon: Icon, label } = item;
                    const badgeType = 'badgeType' in item ? item.badgeType : undefined;
                    const isFab = 'isFab' in item ? item.isFab : false;

                    const badgeValue = badgeType === 'chat' ? chatUnreadCount : (badgeType === 'manage' ? manageBadgeCount : 0);
                    const hasBadge = Boolean(badgeType);

                    const isActive =
                        to === '/employer'
                            ? location.pathname === '/employer' || location.pathname === '/employer/'
                            : to === '/employer/profile'
                                ? location.pathname.startsWith(to) || location.pathname.startsWith('/support-center')
                                : location.pathname.startsWith(to);

                    if (isFab) {
                        return (
                            <Link
                                key={to}
                                to={to}
                                className="flex-1 flex flex-col items-center -mt-8 mb-2 group"
                            >
                                <button className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/40 border-4 border-white dark:border-slate-900 active:scale-95 transition-transform" type="button" aria-label="Đăng tin mới">
                                    <Icon className="w-8 h-8 font-bold" strokeWidth={2.5} />
                                </button>
                                <span className={`text-[10px] font-medium leading-none tracking-tight mt-1.5 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-500 group-hover:text-primary-500'}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={to}
                            to={to}
                            className="flex-1 flex flex-col items-center justify-center gap-1 group relative h-full transition-colors"
                        >
                            <div className={`flex h-7 items-center justify-center transition-all duration-200 ${isActive ? 'text-primary-600 drop-shadow-[0_0_8px_rgba(36,99,235,0.4)]' : 'text-slate-400 group-hover:text-primary-500'}`}>
                                <Icon className={`w-[26px] h-[26px] ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {hasBadge && badgeValue > 0 && badgeType === 'chat' && (
                                <span className="absolute top-2 right-[20%] min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white px-1 z-10">
                                    {badgeValue > 99 ? '99+' : badgeValue}
                                </span>
                            )}

                            {hasBadge && badgeValue > 0 && badgeType === 'manage' && (
                                <span className="absolute top-2 right-[25%] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10" />
                            )}

                            <span className={`text-[10px] font-medium leading-none tracking-tight transition-colors ${isActive ? 'text-primary-600' : 'text-slate-500 group-hover:text-primary-500'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area spacer for iOS */}
            <div className="h-[env(safe-area-bottom,0px)]" />
        </nav>
    );
}
