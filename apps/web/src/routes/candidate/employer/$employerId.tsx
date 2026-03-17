import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
    ArrowLeft, Share2, MapPin, Phone, UtensilsCrossed, 
    BadgeCheck, ShieldCheck, Star, Award, Plus, 
    MessageCircle, Users, Flame, CheckCircle2 
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
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải hồ sơ nhà tuyển dụng...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy nhà tuyển dụng</h2>
                <button
                    onClick={() => navigate({ to: '/candidate' })}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold mt-4"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const displayName = profile.company_name || profile.full_name || 'Nhà tuyển dụng';
    const avatarUrl = profile.company_logo_url || profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=eab308`;
    const coverUrl = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200&h=400"; // Default cover

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Transparent Header App Bar */}
            <div className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
                <button
                    onClick={() => navigate({ to: '/candidate' })}
                    className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                </button>
                <h1 className="text-[17px] font-bold text-slate-900">Hồ sơ nhà tuyển dụng</h1>
                <button 
                    onClick={handleShare}
                    className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <Share2 className="w-5 h-5 text-slate-800" />
                </button>
            </div>

            {/* Cover and Avatar Section */}
            <div className="relative pt-14">
                <div className="h-48 w-full bg-slate-200">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />

                <div className="px-5 relative -mt-16 flex flex-col items-center">
                    <div className="w-[104px] h-[104px] rounded-full p-1 bg-white shadow-md mb-3">
                        <img src={avatarUrl} alt="Logo" className="w-full h-full rounded-full object-cover" />
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5 text-center">
                        <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                        {profile.verification_status === 'VERIFIED' && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 mb-5">
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                            <Award className="w-3.5 h-3.5" />
                            Đăng tin tin cậy
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{followerCount} người theo dõi</span>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <button 
                            onClick={handleFollow}
                            disabled={isActionLoading}
                            className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-full shadow-sm transition-colors ${
                                isFollowing 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isActionLoading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isFollowing ? (
                                <>Hủy theo dõi</>
                            ) : (
                                <><Plus className="w-5 h-5" /> Theo dõi</>
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
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 rounded-full shadow-sm transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" /> Nhắn tin
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="px-5 mt-6 space-y-3">
                {/* Stats Cards */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm tin cậy</p>
                        <div className="flex items-baseline gap-1 text-emerald-600">
                            <span className="text-3xl font-extrabold tracking-tight">{profile.reputation_score || 0}</span>
                            <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đánh giá</p>
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <span className="text-3xl font-extrabold tracking-tight">
                                {profile.average_rating ? profile.average_rating.toFixed(1) : 'Mới'}
                            </span>
                            <Star className="w-6 h-6 fill-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Verification Detail */}
                <div className="flex flex-wrap gap-2">
                    {profile.verification_status === 'VERIFIED' ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold text-xs px-3 py-2 rounded-full border border-emerald-100">
                            <ShieldCheck className="w-4 h-4" /> Đã xác thực tài khoản
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 font-semibold text-xs px-3 py-2 rounded-full border border-slate-100">
                            <ShieldCheck className="w-4 h-4" /> Chưa xác thực hồ sơ
                        </div>
                    )}
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 space-y-5 mt-3">
                    {profile.address_text && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Địa chỉ</p>
                                <p className="text-[15px] font-medium text-slate-800 leading-snug">{profile.address_text}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Liên hệ</p>
                            <p className="text-[15px] font-medium text-slate-800 leading-snug">{profile.phone_number || 'Chưa cập nhật'}</p>
                        </div>
                    </div>
                    {profile.industry && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                <UtensilsCrossed className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Lĩnh vực</p>
                                <p className="text-[15px] font-medium text-slate-800 leading-snug">{profile.industry}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Jobs */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mt-3">
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                        <h3 className="font-bold text-slate-900 text-[17px]">
                            Đang tuyển <span className="text-blue-600">({jobs?.length || 0})</span>
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {isJobsLoading ? (
                            <div className="p-8 text-center text-slate-400 text-sm">Đang tải danh sách việc...</div>
                        ) : jobs && jobs.length > 0 ? (
                            jobs.map(job => (
                                <div 
                                    key={job.id} 
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => navigate({ to: '/candidate/jobs/$jobId', params: { jobId: job.id } })}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className="font-bold text-[16px] text-slate-900">{job.title}</h4>
                                        <span className="font-bold text-[13px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md self-start shrink-0">
                                            {job.salary.toLocaleString()}đ
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[14px] text-slate-500 mb-2 font-medium">
                                        <span>{job.category || 'Việc làm'}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                                        <span>{job.salaryType === 'PER_SHIFT' ? 'Theo ca' : 'Theo giờ'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                            <Users className="w-3 h-3" /> {job.vacancies || 0} chỗ
                                        </span>
                                        {job.isPremium && (
                                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                                                <Flame className="w-3 h-3" /> Gấp
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">Hiện chưa có tin tuyển dụng nào hoạt động</div>
                        )}
                    </div>
                </div>

                {/* Bio / Description */}
                {profile.company_description && (
                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 mt-3">
                        <h3 className="font-bold text-slate-900 text-[17px] mb-3">Về chúng tôi</h3>
                        <p className="text-slate-600 text-[14px] leading-relaxed whitespace-pre-wrap">
                            {profile.company_description}
                        </p>
                    </div>
                )}

                {/* Footer Stats */}
                <div className="py-6 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full shadow-sm font-semibold text-[13px] mb-4">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Hoàn thành nhiều ca làm trên JobNow
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">JobNow © 2026. Thông tin hồ sơ được xác thực qua hệ thống.</p>
                </div>
            </div>
        </div>
    );
}
