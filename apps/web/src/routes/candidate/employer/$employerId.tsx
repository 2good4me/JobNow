import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Verified, 
  Star, 
  MapPin, 
  Phone, 
  UserPlus, 
  MessageSquare,
  Share2,
  Users,
  Flame,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useUserProfile } from '@/features/auth/hooks/useUserProfile';
import { useGetEmployerJobs } from '@/features/jobs/hooks/useEmployerJobs';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toggleFollow, checkFollowStatus, getFollowerCount } from '@/features/auth/services/followService';

export const Route = createFileRoute('/candidate/employer/$employerId')({
    component: EmployerDetailPage,
});

function EmployerDetailPage() {
    const { employerId } = Route.useParams();
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const { data: profile, isLoading: isProfileLoading } = useUserProfile(employerId);
    const { data: jobs, isLoading: isJobsLoading } = useGetEmployerJobs(employerId);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (userProfile && employerId) {
            checkFollowStatus(userProfile.uid, employerId).then(setIsFollowing);
            getFollowerCount(employerId).then(setFollowerCount);
        }
    }, [userProfile, employerId]);

    const handleFollow = async () => {
        if (!userProfile) {
            toast.error('Vui lòng đăng nhập để theo dõi');
            return;
        }
        setIsActionLoading(true);
        try {
            const followed = await toggleFollow(userProfile.uid, employerId);
            setIsFollowing(followed);
            setFollowerCount((prev: number) => followed ? prev + 1 : prev - 1);
            toast.success(followed ? 'Đã theo dõi nhà tuyển dụng' : 'Đã hủy theo dõi');
        } catch (err: any) {
            console.error('Follow error:', err);
            const msg = err.code === 'permission-denied' 
                ? 'Lỗi phân quyền (Firebase Rules)' 
                : 'Lỗi kết nối hoặc tài khoản';
            toast.error(`Không thể thực hiện: ${msg}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép liên kết hồ sơ');
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-10 h-10 text-[#006399] animate-spin mb-4" />
                <p className="text-[#45464d] font-medium">Đang tải hồ sơ nhà tuyển dụng...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[#191c1e] mb-2">Không tìm thấy nhà tuyển dụng</h2>
                <button
                    onClick={() => navigate({ to: '/candidate' })}
                    className="bg-[#006399] text-white px-6 py-2.5 rounded-xl font-bold mt-4"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const displayName = profile.company_name || profile.full_name || 'Nhà tuyển dụng';
    const avatarUrl = profile.company_logo_url || profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=eab308`;
    const isVerified = profile.verification_status === 'VERIFIED';
    const avgRating = profile.average_rating ? profile.average_rating.toFixed(1) : null;

    return (
        <div className="bg-[#f7f9fb] min-h-screen font-sans text-[#191c1e] antialiased">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="flex items-center justify-between px-4 h-16 max-w-[375px] mx-auto">
                    <div className="flex items-center">
                        <button onClick={() => navigate({ to: '/candidate' })} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                            <ArrowLeft size={24} className="text-slate-900" />
                        </button>
                        <h1 className="ml-2 font-bold text-lg tracking-tight text-slate-900">
                            Hồ sơ nhà tuyển dụng
                        </h1>
                    </div>
                    <button onClick={handleShare} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                        <Share2 size={20} className="text-slate-700" />
                    </button>
                </div>
            </header>

            <main className="pt-20 pb-32 px-4 max-w-[375px] mx-auto">
                {/* Profile Section */}
                <section className="mb-8">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-slate-100">
                            <img 
                                src={avatarUrl} 
                                alt={displayName} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-xl text-[#191c1e] truncate">{displayName}</h2>
                            {isVerified && (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Verified size={18} className="text-[#009668] fill-[#009668]/10" />
                                    <span className="text-[#009668] text-[10px] font-bold tracking-wider uppercase">ĐÃ XÁC THỰC</span>
                                </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                                {profile.industry && (
                                    <span className="px-2.5 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold uppercase tracking-tight rounded-lg">
                                        {profile.industry}
                                    </span>
                                )}
                                <span className="text-[#45464d] text-xs">{followerCount} người theo dõi</span>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="w-full flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex text-yellow-500">
                            <Star size={18} fill="currentColor" />
                        </div>
                        <span className="font-bold text-[#191c1e]">{avgRating || 'Mới'}</span>
                        {profile.total_ratings > 0 && (
                            <span className="text-[#45464d] text-sm">({profile.total_ratings} đánh giá)</span>
                        )}
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="grid grid-cols-3 gap-3 mb-10">
                    {[
                        { label: "Tin đang tuyển", value: jobs?.length || 0 },
                        { label: "Điểm tin cậy", value: profile.reputation_score || 0 },
                        { label: "Đánh giá", value: avgRating || 'Mới' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-3xl text-center shadow-sm border border-slate-50">
                            <p className="font-bold text-xl text-[#006399]">{stat.value}</p>
                            <p className="text-[9px] font-bold text-[#45464d] uppercase mt-1 leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </section>

                {/* About Section */}
                <section className="mb-10">
                    <h3 className="font-bold text-lg mb-4">Giới thiệu</h3>
                    <div className="bg-[#f2f4f6] rounded-3xl p-6">
                        {profile.company_description && (
                            <p className="text-[#45464d] text-sm leading-relaxed mb-6">
                                {profile.company_description}
                            </p>
                        )}
                        <div className="space-y-4">
                            {profile.address_text && (
                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-[#006399] mt-0.5 shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-[#191c1e]">Địa chỉ</p>
                                        <p className="text-[#45464d]">{profile.address_text}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Phone size={20} className="text-[#006399] mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-[#191c1e]">Điện thoại</p>
                                    <p className="text-[#45464d]">{profile.phone_number || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Active Jobs */}
                <section className="mb-10 -mx-4 overflow-hidden">
                    <div className="px-4 flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">
                            Đang tuyển <span className="text-[#006399]">({jobs?.length || 0})</span>
                        </h3>
                    </div>
                    <div className="px-4">
                        {isJobsLoading ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Đang tải danh sách việc...</div>
                        ) : jobs && jobs.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {jobs.map(job => (
                                    <div 
                                        key={job.id} 
                                        className="min-w-[200px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-2 cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => navigate({ to: '/candidate/jobs/$jobId', params: { jobId: job.id } })}
                                    >
                                        <span className="text-[10px] font-bold text-[#005236] bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full uppercase mb-3 inline-block">
                                            {job.salaryType === 'MONTHLY' ? 'Full-time' : 'Part-time'}
                                        </span>
                                        <h4 className="font-bold text-[#191c1e] leading-snug mb-2">{job.title}</h4>
                                        <p className="text-[#006399] font-extrabold">{job.salary.toLocaleString()}đ</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <Users className="w-3 h-3" /> {job.vacancies || 0} chỗ
                                            </span>
                                            {job.isPremium && (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                                                    <Flame className="w-3 h-3" /> Gấp
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
                                Hiện chưa có tin tuyển dụng nào hoạt động
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[55] bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe">
                <div className="flex items-center gap-3 max-w-[375px] mx-auto px-4 py-3">
                    <button
                        onClick={handleFollow}
                        disabled={isActionLoading}
                        className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] transition-all active:scale-95 ${
                            isFollowing
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'border border-[#006399] text-[#006399] hover:bg-sky-50 bg-white'
                        }`}
                    >
                        {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                {isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}
                            </>
                        )}
                    </button>
                    <button 
                        onClick={() => navigate({ 
                            to: '/candidate/chat', 
                            search: { 
                                employerId: profile.uid,
                                applicationId: undefined,
                                jobId: undefined
                            } 
                        })}
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0369A1] to-[#004F7B] text-white rounded-xl font-bold text-[13px] hover:shadow-md transition-all active:scale-95 shadow-sm shadow-[#0369A1]/20"
                    >
                        <MessageSquare size={18} />
                        Nhắn tin
                    </button>
                </div>
            </div>
        </div>
    );
}
