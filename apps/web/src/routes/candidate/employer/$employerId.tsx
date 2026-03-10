import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Share2, MapPin, Phone, UtensilsCrossed, BadgeCheck, ShieldCheck, Star } from 'lucide-react';

export const Route = createFileRoute('/candidate/employer/$employerId')({
    component: EmployerDetailPage,
});

function EmployerDetailPage() {
    const { employerId } = Route.useParams();
    const navigate = useNavigate();

    // Mock data for Employer Profile based on the screenshot
    const employer = {
        id: employerId,
        companyName: "Quán Mộc Cafe",
        isVerified: true,
        vipTier: "VIP Tier",
        followersCount: "1.2k",
        trustScore: 92,
        rating: 4.6,
        totalReviews: 84,
        isGpkdVerified: true,
        isEkycVerified: true,
        address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
        hotline: "0909 123 456",
        field: "F&B, Nhà hàng, Khách sạn",
        completedShifts: 156,
        coverUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200&h=400",
        avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MC&backgroundColor=eab308",
        activeJobs: [
            {
                id: "j1",
                title: "Nhân viên phục vụ bàn",
                type: "Full-time",
                shiftType: "Ca sáng/chiều",
                salaryFrom: "25k",
                salaryTo: "30k/h",
                postedAgo: "2 ngày trước",
                slots: "5 slot",
            },
            {
                id: "j2",
                title: "Pha chế (Barista)",
                type: "Part-time",
                shiftType: "Ca tối",
                salaryFrom: "30k",
                salaryTo: "35k/h",
                postedAgo: "5 giờ trước",
                isUrgent: true,
            }
        ],
        reviews: [
            {
                id: "r1",
                authorName: "Minh Tuấn",
                timeAgo: "Đã làm việc: 2 tháng trước",
                rating: 5,
                content: "Quán chuyên nghiệp, quản lý thân thiện. Lương nhận đúng ngày không delay. Môi trường làm việc thoải mái.",
                tags: ["Trả lương đúng hẹn", "Môi trường tốt"],
                authorAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Tuan&backgroundColor=ffedd5"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Transparent Header App Bar matching the design */}
            <div className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
                <button
                    onClick={() => navigate({ to: '/candidate' })}
                    className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-800" />
                </button>
                <h1 className="text-[17px] font-bold text-slate-900">Hồ sơ nhà tuyển dụng</h1>
                <button className="w-10 h-10 flex items-center justify-center -mr-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-800" />
                </button>
            </div>

            {/* Cover and Avatar Section */}
            <div className="relative pt-14">
                {/* Cover Image */}
                <div className="h-48 w-full bg-slate-200">
                    <img
                        src={employer.coverUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Gradient Overlay for bottom of cover */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-200 to-transparent" />

                {/* Avatar and Basic Info Details positioned over cover bottom */}
                <div className="px-5 relative -mt-16 flex flex-col items-center">
                    <div className="w-[104px] h-[104px] rounded-full p-1 bg-white shadow-md mb-3">
                        <img
                            src={employer.avatarUrl}
                            alt="Logo"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                        <h2 className="text-xl font-bold text-slate-900">{employer.companyName}</h2>
                        {employer.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 mb-5">
                        {employer.vipTier && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                <AwardIcon className="w-3.5 h-3.5" />
                                {employer.vipTier}
                            </span>
                        )}
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{employer.followersCount} người theo dõi</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-full shadow-sm transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Theo dõi
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 rounded-full shadow-sm transition-colors">
                            <MessageCircleIcon className="w-5 h-5" />
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="px-5 mt-6 space-y-3">

                {/* Trust & Rating Cards */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Điểm tin cậy</p>
                        <div className="flex items-baseline gap-1 text-emerald-600">
                            <span className="text-3xl font-extrabold tracking-tight">{employer.trustScore}</span>
                            <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-white rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đánh giá</p>
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <span className="text-3xl font-extrabold tracking-tight">{employer.rating}</span>
                            <Star className="w-6 h-6 fill-amber-400" />
                        </div>
                    </div>
                </div>

                {/* Verification Badges */}
                <div className="flex gap-2">
                    {employer.isGpkdVerified && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold text-xs px-3 py-2 rounded-full border border-emerald-100">
                            <ShieldCheck className="w-4 h-4" />
                            Đã xác minh GPKD
                        </div>
                    )}
                    {employer.isEkycVerified && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold text-xs px-3 py-2 rounded-full border border-emerald-100">
                            <ShieldCheck className="w-4 h-4" />
                            eKYC
                        </div>
                    )}
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 space-y-5 mt-3">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Địa chỉ</p>
                            <p className="text-[15px] font-medium text-slate-800 leading-snug">{employer.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Hotline</p>
                            <p className="text-[15px] font-medium text-slate-800 leading-snug">{employer.hotline}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Lĩnh vực</p>
                            <p className="text-[15px] font-medium text-slate-800 leading-snug">{employer.field}</p>
                        </div>
                    </div>
                </div>

                {/* Active Jobs Section */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mt-3">
                    <div className="p-4 flex items-center justify-between border-b border-slate-50">
                        <h3 className="font-bold text-slate-900 text-[17px]">
                            Đang tuyển <span className="text-blue-600">({employer.activeJobs.length})</span>
                        </h3>
                        <button className="text-[13px] font-bold text-blue-600 hover:text-blue-700">Xem tất cả</button>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {employer.activeJobs.map(job => (
                            <div key={job.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1.5">
                                    <h4 className="font-bold text-[16px] text-slate-900">{job.title}</h4>
                                    <span className="font-semibold text-[13px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md self-start shrink-0">
                                        {job.salaryFrom} - {job.salaryTo}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[14px] text-slate-500 mb-3 font-medium">
                                    <span>{job.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-0.5" />
                                    <span>{job.shiftType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        {job.postedAgo}
                                    </span>
                                    {job.slots && (
                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                            <UsersIcon className="w-3.5 h-3.5" />
                                            {job.slots}
                                        </span>
                                    )}
                                    {job.isUrgent && (
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                                            <FlameIcon className="w-3.5 h-3.5" />
                                            Gấp
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mt-3">
                    <div className="p-5 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-[17px]">Đánh giá từ nhân viên</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[15px]">{employer.rating}</span>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500 -mt-0.5" />
                            <span className="text-[13px] text-slate-400 font-medium">({employer.totalReviews} đánh giá)</span>
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        {employer.reviews.map(review => (
                            <div key={review.id} className="bg-slate-50 border border-slate-100 rounded-[20px] p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <img src={review.authorAvatar} alt={review.authorName} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                                        <div>
                                            <h4 className="font-bold text-[15px] text-slate-800">{review.authorName}</h4>
                                            <p className="text-[12px] text-slate-400">{review.timeAgo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[14px] text-slate-600 leading-relaxed mb-3">
                                    {review.content}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {review.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                            <ThumbsUpIcon className="w-3 h-3 text-emerald-500" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button className="w-full mt-4 py-3 text-[14px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                            Xem thêm {employer.totalReviews - 1} đánh giá
                        </button>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="py-6 flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full shadow-sm font-semibold text-[13px] mb-4">
                        <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                        Đã hoàn thành {employer.completedShifts} ca làm việc
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">JobNow © 2026. Thông tin được xác thực.</p>
                </div>

            </div>
        </div>
    );
}

// Supplemental icons mapped from UI elements
function AwardIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>; }
function PlusIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>; }
function MessageCircleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>; }
function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function FlameIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>; }
function ThumbsUpIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>; }
function CheckCircleIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>; }
