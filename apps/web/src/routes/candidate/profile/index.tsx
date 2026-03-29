import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useState, useEffect } from 'react';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { getProgressToNextTier, getReputationTier } from '@/features/auth/helpers/reputationHelper';
import { getFollowingCount } from '@/features/auth/services/followService';
import { AchievementBadges, CANDIDATE_ACHIEVEMENTS } from '@/features/auth/components/AchievementBadges';
import { ReputationCircle } from '@/features/auth/components/ReputationCircle';
import { ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';

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
    const [followingCount, setFollowingCount] = useState(0);

    // Fetch real applications data just for counts
    const { data: applications = [] } = useMyApplicationsRealtime({
        candidateId: userProfile?.uid,
        limit: 100,
    });

    const activeApplications = applications.filter(
        (app) => app.status === 'PENDING' || app.status === 'APPROVED' || app.status === 'CHECKED_IN'
    ).length;

    useEffect(() => {
        if (userProfile?.uid) {
            getFollowingCount(userProfile.uid).then(setFollowingCount).catch(console.error);
        }
    }, [userProfile?.uid]);

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
    const reputationScore = userProfile.reputation_score || 0;
    const tierInfo = getReputationTier(reputationScore);
    const tierProgress = getProgressToNextTier(reputationScore);

    const percentageToText = (pct: number) => {
        if (pct >= 90) return 'Sắp đạt hạng mới';
        if (pct >= 50) return 'Đang tiến triển tốt';
        return `còn ${tierProgress.pointsNeeded} điểm nữa`;
    };

    return (
        <div className="min-h-[100dvh] bg-[#F8FAFC] pb-24">
            {/* Header Section with Cover */}
            <div className="bg-white pb-6 shadow-sm">
                <div className="h-[100px] w-full bg-gradient-to-r from-slate-100 to-slate-200 relative">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#0369A1 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </div>
                
                <div className="px-5 -mt-[40px] flex items-end justify-between relative z-10">
                    <div className="relative">
                        <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-50">
                            {userProfile.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-600 font-headline font-bold text-2xl">
                                    {avatarInitial}
                                </div>
                            )}
                        </div>
                        
                        {/* Verified Badge on Avatar */}
                        <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${userProfile.verification_status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                            {userProfile.verification_status === 'VERIFIED' ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                            ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                    </div>

                    <Link 
                        to="/candidate/profile/edit"
                        className="mb-1 px-4 py-2 rounded-xl border border-sky-700 text-sky-700 text-[13px] font-bold active:bg-sky-50 transition-colors"
                    >
                        Chỉnh sửa hồ sơ
                    </Link>
                </div>

                <div className="px-5 mt-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[22px] font-headline font-bold text-[#0F172A] leading-tight">
                            {displayName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider">
                            Ứng viên
                        </span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                        Lao động tự do
                        {userProfile.address_text && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span className="truncate max-w-[180px] inline-block align-bottom">{userProfile.address_text}</span>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <main className="px-5 py-6 space-y-7">
                {/* eKYC Alert Card */}
                {userProfile.verification_status !== 'VERIFIED' && (
                    <Link
                        to="/candidate/verification"
                        className="block rounded-2xl bg-amber-50 border border-amber-200 p-4 transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[14px] font-bold text-amber-900">Xác thực danh tính</h4>
                                <p className="text-[12px] text-amber-700 mt-0.5">Mở khóa Premium Jobs và tăng độ tin cậy</p>
                            </div>
                            <button className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[12px] font-bold">
                                Xác thực ngay
                            </button>
                        </div>
                    </Link>
                )}

                {/* Reputation Score Card */}
                <Link
                    to="/candidate/profile/reputation"
                    className="block w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative active:scale-[0.98] transition-transform"
                >
                    <div className="flex items-center gap-5">
                        <ReputationCircle score={reputationScore} size={72} strokeWidth={6} />
                        
                        <div className="min-w-0 flex-1">
                            <h3 className="font-headline font-bold text-slate-900 text-[14px]">
                                Điểm uy tín
                            </h3>
                            <p className="text-[15px] font-semibold text-sky-700 mt-0.5">
                                {tierInfo.labelVi} {tierProgress.nextTier ? `— ${percentageToText(tierProgress.progressPercent)}` : '— Hạng cao nhất'}
                            </p>
                            <p className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                                {activeApplications} ca hoàn thành • {userProfile.canceled_count || 0} lần hủy
                            </p>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-300" />
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

                {/* Follow Stats */}
                <section className="flex items-center gap-6 pb-2">
                    <div>
                        <span className="font-black text-lg text-slate-900">{followingCount}</span>
                        <span className="text-sm font-medium text-slate-500 ml-1.5">Đang theo dõi</span>
                    </div>
                    {/* Danh hiệu (Badges) */}
                    <div className="flex-1 bg-white border border-slate-100/60 rounded-[20px] px-4 py-3 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)]">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh hiệu nổi bật</h4>
                            <Link to="/candidate/profile/reputation" className="text-xs font-semibold text-blue-600">Xem tất cả</Link>
                        </div>
                        <AchievementBadges achievements={CANDIDATE_ACHIEVEMENTS} maxDisplay={4} size="md" />
                    </div>
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
