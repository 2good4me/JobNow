import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChatUnreadCount } from '@/features/chat/hooks/useChatUnreadCount';

const navItemsDef = [
    { to: '/employer', icon: 'dashboard', label: 'Tổng quan' },
    { to: '/employer/job-list', icon: 'assignment', label: 'Quản lý', badgeType: 'manage' as const },
    {
        to: '/employer/post-job',
        icon: 'add',
        label: 'Đăng tin',
        isFab: true
    },
    { to: '/employer/chat', icon: 'chat_bubble', label: 'Chat', badgeType: 'chat' as const },
    { to: '/employer/profile', icon: 'person', label: 'Tài khoản' },
] as const;

export function EmployerBottomNav() {
    const location = useLocation();
    const { userProfile } = useAuth();
    const chatUnreadCount = useChatUnreadCount(userProfile?.uid, 'EMPLOYER');

    const manageBadgeCount = 0;

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-100 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] pb-safe">
            <div className="flex items-center justify-around max-w-lg mx-auto h-[64px] px-2 w-full relative">
                {navItemsDef.map((item) => {
                    const { to, icon, label } = item;
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
                                className="flex-1 flex flex-col items-center -mt-10 mb-1 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border-4 border-white active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-[32px] font-bold">
                                        {icon}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-medium mt-1 font-['Inter'] transition-colors ${isActive ? 'text-[#0284c7]' : 'text-[#94a3b8] group-hover:text-[#475569]'}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                                isActive ? 'text-[#0284c7]' : 'text-[#94a3b8] hover:text-[#475569]'
                            }`}
                        >
                            <span 
                                className="material-symbols-outlined text-[24px]"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {icon}
                            </span>
                            
                            {hasBadge && badgeValue > 0 && badgeType === 'chat' && (
                                <span className="absolute top-2 right-[20%] min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white px-1 z-10">
                                    {badgeValue > 99 ? '99+' : badgeValue}
                                </span>
                            )}

                            {hasBadge && badgeValue > 0 && badgeType === 'manage' && (
                                <span className="absolute top-2 right-[25%] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white z-10" />
                            )}

                            <span className="text-[10px] font-medium mt-1 font-['Inter']">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
