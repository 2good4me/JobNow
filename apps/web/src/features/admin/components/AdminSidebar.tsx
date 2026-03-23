import { Link, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard, Users, Briefcase, AlertTriangle,
    FolderTree, BarChart3, Settings, Shield,
} from 'lucide-react';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tổng quan', exact: true },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
    { to: '/admin/verifications', icon: Shield, label: 'eKYC' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Việc làm' },
    { to: '/admin/reports', icon: AlertTriangle, label: 'Báo cáo' },
    { to: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Thống kê' },
    { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
] as const;

export function AdminSidebar() {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white z-40 flex flex-col">
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-700/50">
                <div className="bg-indigo-500 p-2 rounded-xl">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="font-bold text-lg tracking-tight">
                        Job<span className="text-indigo-400">Now</span>
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium -mt-0.5">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const { to, icon: Icon, label } = item;
                    const exact = 'exact' in item && item.exact;
                    const isActive = exact
                        ? location.pathname === to || location.pathname === `${to}/`
                        : location.pathname.startsWith(to);

                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                                ${isActive
                                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                        >
                            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500 text-center">© 2026 JobNow Admin</p>
            </div>
        </aside>
    );
}
