import { Link, useLocation } from '@tanstack/react-router';

const navItems = [
    { to: '/candidate', icon: 'home', label: 'Trang chủ' },
    { to: '/jobs', icon: 'work', label: 'Việc của tôi' },
    { to: '/candidate/shifts', icon: 'schedule', label: 'Ca làm' },
    { to: '/candidate/wallet', icon: 'wallet', label: 'Ví tiền' },
    { to: '/candidate/profile', icon: 'person', label: 'Hồ sơ' },
] as const;

export function CandidateBottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-100 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] pb-safe">
            <div className="flex items-center justify-around max-w-lg mx-auto h-[64px] px-2 w-full">
                {navItems.map((item) => {
                    const { to, icon, label } = item;
                    const search = 'search' in item ? item.search : undefined;
                    const isActive =
                        to === '/candidate'
                            ? location.pathname === '/candidate' || location.pathname === '/candidate/'
                            : to === '/candidate/profile'
                                ? location.pathname.startsWith(to) || location.pathname.startsWith('/support-center')
                                // Wallet handling in case it doesn't exist yet but design has it
                                : location.pathname.startsWith(to);

                    return (
                        <Link
                            key={to}
                            to={to as any} // Cast to any to avoid TS errors if route doesn't exist yet
                            {...(search ? { search: search as any } : {})}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive ? 'text-[#0284c7]' : 'text-[#94a3b8] hover:text-[#475569]'
                            }`}
                        >
                            <span 
                                className="material-symbols-outlined text-[24px]"
                                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {icon}
                            </span>
                            <span className="text-[10px] font-medium mt-1 font-['Inter']">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
