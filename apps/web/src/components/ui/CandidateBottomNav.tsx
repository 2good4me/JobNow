import { Link, useLocation } from '@tanstack/react-router';
import { Map, Search, CalendarDays, MessageCircle, UserCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChatUnreadCount } from '@/features/chat/hooks/useChatUnreadCount';

const navItems = [
    { to: '/candidate', icon: Map, label: 'Bản đồ' },
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-slide-in-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
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
                                flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1.5 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'text-primary-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }
                            `}
                        >
                            <div className={`relative p-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary-50' : ''}`}>
                                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                                {hasBadge && badgeValue > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                                        {badgeValue > 99 ? '99+' : badgeValue}
                                    </span>
                                )}
                                {isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                )}
                            </div>
                            <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* Safe area spacer for iOS */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </nav>
    );
}
