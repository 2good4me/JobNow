import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Search, CalendarDays, MessageCircle, UserCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChatUnreadCount } from '@/features/chat/hooks/useChatUnreadCount';

const navItems = [
    { to: '/candidate', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/jobs', icon: Search, label: 'Tìm kiếm' },
    { to: '/candidate/shifts', icon: CalendarDays, label: 'Ca của tôi' },
    { to: '/candidate/chat', icon: MessageCircle, label: 'Chat', badgeType: 'chat' as const },
    { to: '/candidate/profile', icon: UserCircle, label: 'Tài khoản' },
] as const;

export function CandidateBottomNav() {
    const location = useLocation();
    const { userProfile } = useAuth();
    const chatUnreadCount = useChatUnreadCount(userProfile?.uid, 'CANDIDATE');

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-slide-in-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto h-[72px] px-2 relative">
                {navItems.map(({ to, icon: Icon, label, ...rest }) => {
                    const badgeType = 'badgeType' in rest ? rest.badgeType : undefined;
                    const badgeValue = badgeType === 'chat' ? chatUnreadCount : 0;
                    const hasBadge = Boolean(badgeType);

                    const isActive =
                        to === '/candidate'
                            ? location.pathname === '/candidate' || location.pathname === '/candidate/'
                            : to === '/candidate/profile'
                                ? location.pathname.startsWith(to) || location.pathname.startsWith('/support-center')
                                : location.pathname.startsWith(to);

                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`
                                flex-1 flex flex-col items-center justify-center gap-1 group relative h-full transition-colors
                            `}
                        >
                            <div className={`flex h-7 items-center justify-center transition-all duration-200 ${isActive ? 'text-primary-600 drop-shadow-[0_0_8px_rgba(36,99,235,0.4)]' : 'text-slate-400 group-hover:text-primary-500'}`}>
                                <Icon className={`w-[26px] h-[26px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {hasBadge && badgeValue > 0 && (
                                <span className="absolute top-2 right-[20%] min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full border border-white px-1 z-10">
                                    {badgeValue > 99 ? '99+' : badgeValue}
                                </span>
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
