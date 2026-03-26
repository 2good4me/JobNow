import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';

export const Route = createFileRoute('/candidate/profile/')({
    component: CandidateProfilePage,
});

function ProfileSkeleton() {
    return (
        <div className="animate-pulse pb-24 min-h-[100dvh] bg-slate-50">
            <div className="bg-white px-5 pt-14 pb-6 border-b border-slate-100 flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-7 w-40 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-32 bg-slate-100 rounded-md" />
                </div>
                <div className="w-16 h-16 bg-slate-200 rounded-full" />
            </div>
            <div className="px-5 py-6 space-y-6">
                <div className="h-24 bg-slate-200 rounded-2xl" />
                <div className="h-20 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-200 rounded-2xl" />
                    <div className="h-20 bg-slate-200 rounded-2xl" />
                </div>
                <div className="h-64 bg-slate-200 rounded-[24px]" />
            </div>
        </div>
    );
}

function CandidateProfilePage() {
    const { userProfile, signOut } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch real applications data just for counts
    const { data: applications = [] } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
        limit: 100,
    });

    const activeApplications = applications.filter(
        (app) => app.status === 'PENDING' || app.status === 'APPROVED' || app.status === 'CHECKED_IN'
    ).length;

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await signOut();
            await navigate({ to: '/' });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!userProfile) {
        return <ProfileSkeleton />;
    }

    const displayName = userProfile.full_name || 'Ứng viên';
    const avatarInitial = (userProfile.full_name?.[0] || 'U').toUpperCase();

    return (
        <div className="min-h-[100dvh] bg-slate-50 pb-24">
            {/* Header Section */}
            <div className="bg-white px-5 pt-14 pb-6 border-b border-slate-100/60 shadow-sm shadow-slate-100/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[22px] font-headline font-bold text-slate-900 leading-tight">
                            {displayName}
                        </h2>
                        <p className="text-[13px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            Lao động tự do
                            {userProfile.address_text && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span className="truncate max-w-[120px] inline-block align-bottom">{userProfile.address_text}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            {userProfile.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-600 font-headline font-bold text-xl">
                                    {avatarInitial}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="px-5 py-6 space-y-7">
                {/* Reputation Banner */}
                <Link
                    to="/candidate/profile/reputation"
                    className="block w-full text-left bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-[20px] p-4 border border-blue-100/50 relative overflow-hidden active:scale-[0.98] transition-transform"
                >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                    
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="font-headline font-bold text-blue-900 flex items-center gap-1.5 text-sm">
                                <span className="material-symbols-outlined text-[18px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                                Điểm uy tín
                            </h3>
                            <p className="text-[15px] font-semibold text-blue-900 mt-1">Xuất sắc — Top 15%</p>
                            <p className="text-[13px] text-blue-700/80 mt-0.5">Xác thực danh tính để mở khóa Premium Jobs</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-blue-600 text-[18px]">chevron_right</span>
                        </div>
                    </div>
                </Link>

                {/* Giới thiệu */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-headline font-bold text-slate-800">Giới thiệu</h3>
                        <Link to="/candidate/profile/edit" className="text-[13px] font-semibold text-blue-600 active:text-blue-700 transition-colors">
                            Chỉnh sửa
                        </Link>
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-600">
                        {userProfile.bio || "Chưa có thông tin giới thiệu. Hãy cập nhật để nhà tuyển dụng hiểu rõ hơn về bạn."}
                    </p>
                </section>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        to="/candidate/chat"
                        search={{ applicationId: undefined, jobId: undefined, employerId: undefined }}
                        className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm shadow-slate-200/20 active:bg-slate-50 transition-colors"
                    >
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 shrink-0 border border-slate-100/50">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                        </div>
                        <span className="font-medium text-[14px] text-slate-800 leading-tight">Tin nhắn</span>
                    </Link>
                    <Link
                        to="/candidate/applications"
                        className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm shadow-slate-200/20 active:bg-slate-50 transition-colors"
                    >
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 shrink-0 border border-slate-100/50 relative">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                            {activeApplications > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-[5px] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {activeApplications > 99 ? '99+' : activeApplications}
                                </span>
                            )}
                        </div>
                        <span className="font-medium text-[14px] text-slate-800 leading-tight">Đơn ứng tuyển</span>
                    </Link>
                </div>

                {/* Menu List */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/20 overflow-hidden divide-y divide-slate-50">
                    {[
                        { icon: 'favorite', label: 'Việc đã lưu', href: '/candidate/wishlist', fill: false },
                        { icon: 'stars', label: 'Điểm uy tín', href: '/candidate/profile/reputation', fill: true },
                        { icon: 'help', label: 'Trung tâm trợ giúp & FAQ', href: '/support-center', fill: false },
                        { icon: 'settings', label: 'Cài đặt', href: '/candidate/profile/settings', fill: false },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center justify-between p-4 px-5 active:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <span 
                                    className={`material-symbols-outlined text-[22px] ${item.fill ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`}
                                    style={item.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-medium text-[15px] text-slate-700 group-hover:text-slate-900 transition-colors">
                                    {item.label}
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-slate-400 transition-colors">
                                chevron_right
                            </span>
                        </Link>
                    ))}
                    
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center justify-between p-4 px-5 w-full active:bg-red-50/50 transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[22px] text-red-400">
                                logout
                            </span>
                            <span className="font-medium text-[15px] text-red-600">
                                {isLoggingOut ? 'Đang xử lý...' : 'Đăng xuất'}
                            </span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
