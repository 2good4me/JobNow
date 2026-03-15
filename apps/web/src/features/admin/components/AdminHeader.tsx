import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Bell } from 'lucide-react';

export function AdminHeader() {
    const { userProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate({ to: '/login' });
    };

    const displayName = userProfile?.full_name || 'Admin';
    const initial = (displayName[0] ?? 'A').toUpperCase();

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div>
                <h2 className="text-sm font-semibold text-slate-800">Bảng điều khiển quản trị</h2>
            </div>

            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <button
                    className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500"
                    aria-label="Thông báo"
                >
                    <Bell className="w-5 h-5" />
                </button>

                {/* Admin info */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {initial}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">Quản trị viên</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
