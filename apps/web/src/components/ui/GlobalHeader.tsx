import { Link } from '@tanstack/react-router';
import { BriefcaseBusiness, Bell } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';

export function GlobalHeader() {
    const { user, userProfile, role, signOut } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Mock state for notification dot
    const hasUnread = true;

    // Determine dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/';
        if (role === 'CANDIDATE') return '/candidate';
        if (role === 'EMPLOYER') return '/employer';
        return '/';
    };

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between">

                {/* 1. Brand Anchor (Trái) */}
                <Link to={getDashboardLink()} className="flex items-center gap-2 group outline-none">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl text-white group-hover:scale-105 transition-transform shadow-sm">
                        <BriefcaseBusiness className="w-5 h-5" />
                    </div>
                    <span className="font-heading font-black text-xl tracking-tight text-slate-800">
                        Job<span className="text-indigo-600">Now</span>
                    </span>
                </Link>

                {/* 2. Interaction Hub (Phải) */}
                <div className="flex items-center gap-3">
                    {!user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors h-10 flex items-center">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm transition-transform active:scale-95 h-10 flex items-center">
                                Đăng ký
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Nút Thông báo */}
                            <Link to={role === 'EMPLOYER' ? '/employer/notifications' : '/candidate/notifications'}
                                className="relative p-2.5 bg-slate-100/50 hover:bg-slate-100 border border-slate-200/50 rounded-full transition-colors active:scale-95 shrink-0 text-slate-600">
                                <Bell className="w-5 h-5" />
                                {hasUnread && (
                                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </Link>

                            {/* Nút Avatar (Kèm Dropdown Profile) */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 p-1 pr-3 bg-white border border-slate-200 rounded-full shadow-sm hover:border-slate-300 transition-colors active:scale-95 text-left"
                                >
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                            {(userProfile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <>
                                        {/* Backdrop để tắt menu khi click ngoài */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>

                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-3 py-2 mb-1 border-b border-slate-50">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {userProfile?.full_name || user.email?.split('@')[0]}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
                                                    {role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                                                </p>
                                            </div>

                                            <div className="space-y-1 mt-2">
                                                <Link
                                                    to={role === 'EMPLOYER' ? '/employer/profile' : '/candidate/profile'}
                                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    Hồ sơ cá nhân
                                                </Link>
                                                <button
                                                    onClick={() => { signOut(); setIsProfileMenuOpen(false); }}
                                                    className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
