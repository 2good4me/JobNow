import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Users, PlusCircle, MessageCircle, UserCircle } from 'lucide-react';

const navItems = [
    { to: '/employer', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/employer/applicants', icon: Users, label: 'Quản lý' },
    { to: '/employer/post-job', icon: PlusCircle, label: 'Đăng tin' },
    { to: '/employer/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/employer/profile', icon: UserCircle, label: 'Tài khoản' },
] as const;

export function EmployerBottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-slide-in-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const isActive =
                        to === '/employer'
                            ? location.pathname === '/employer' || location.pathname === '/employer/'
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
            <div className="h-[env(safe-area-bottom,0px)]" />
        </nav>
    );
}
