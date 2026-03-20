import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Briefcase, ChevronRight, Clock, FileText,
  AlertCircle, Heart, Search, MapPin,
  Zap, Star, TrendingUp, Coffee, Truck, ShoppingBag, Calendar
} from 'lucide-react';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { JobCard } from '@/features/jobs/components/JobCard';
import { useState } from 'react';

export const Route = createFileRoute('/candidate/')({ component: CandidateDashboard });

const CATEGORIES = [
  { label: 'Tất cả', icon: Zap, color: 'indigo' },
  { label: 'F&B', icon: Coffee, color: 'orange' },
  { label: 'Giao hàng', icon: Truck, color: 'sky' },
  { label: 'Bán hàng', icon: ShoppingBag, color: 'pink' },
  { label: 'Sự kiện', icon: Star, color: 'violet' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Chào đêm khuya';
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}


function CandidateDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { data: jobs = [], isLoading, isError } = useAllJobs();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedDistrict, setSelectedDistrict] = useState('Hà Đông'); // Mặc định như user nói
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const DISTRICTS = [
    'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy',
    'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân',
    'Nam Từ Liêm', 'Bắc Từ Liêm', 'Hà Đông'
  ];

  const { data: applications = [] } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });

  const { data: wishlistJobs = [] } = useWishlistJobs(userProfile?.uid);

  const activeShiftsCount = applications.filter(
    (app) => app.status === 'APPROVED' || app.status === 'CHECKED_IN'
  ).length;
  const totalAppliedCount = applications.length;
  const totalWishlistCount = wishlistJobs.length;

  const greeting = getGreeting();

  const filteredJobs = jobs.filter((job: any) => {
    // Filter by Category
    if (activeCategory !== 'Tất cả') {
      const text = `${job.title} ${job.description}`.toLowerCase();
      let categoryMatch = false;
      if (activeCategory === 'F&B') categoryMatch = text.includes('phục vụ') || text.includes('pha chế') || text.includes('nhà hàng') || text.includes('f&b');
      else if (activeCategory === 'Giao hàng') categoryMatch = text.includes('giao hàng') || text.includes('shipper');
      else if (activeCategory === 'Bán hàng') categoryMatch = text.includes('bán hàng') || text.includes('sale') || text.includes('thu ngân');
      else if (activeCategory === 'Sự kiện') categoryMatch = text.includes('sự kiện') || text.includes('event') || text.includes('pg');
      
      if (!categoryMatch) return false;
    }

    // Filter by District
    const address = (job.location?.address || job.address || '').toLowerCase();
    if (!address.includes(selectedDistrict.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] pb-24">
        <div className="px-5 pt-14 pb-5 bg-white animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-48 bg-slate-100 rounded-lg" />
            </div>
            <div className="w-11 h-11 bg-slate-100 rounded-full" />
          </div>
          <div className="h-12 bg-slate-100 rounded-2xl" />
        </div>
        <div className="px-5 mt-4 space-y-4 animate-pulse">
          <div className="flex gap-3">
            {[1,2,3].map(i => <div key={i} className="h-24 flex-1 bg-slate-100 rounded-2xl" />)}
          </div>
          <div className="h-4 w-32 bg-slate-100 rounded" />
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 max-w-sm mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-rose-400" />
          <p className="font-bold text-slate-800 text-lg mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-slate-500">Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF] pb-28">
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#3b82f6] px-5 pt-14 pb-8"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-blue-200 text-[13px] font-medium">{greeting},</p>
              <h1 className="text-white text-xl font-bold tracking-tight mt-0.5">{userProfile?.full_name || 'Ứng viên'}</h1>
            </div>
          </div>
          {/* Search Bar */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: '/jobs' })}
              className="flex-1 flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white/70 hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              <Search className="w-5 h-5 text-white/60 shrink-0" />
              <span className="text-[14px] text-white/70 text-left flex-1">Tìm việc làm...</span>
            </button>
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-3 text-white flex items-center gap-2 hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              <div className="bg-emerald-500 rounded-full p-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-bold whitespace-nowrap">{selectedDistrict}</span>
            </button>
          </div>

          {/* Location Picker Dropdown */}
          {showLocationPicker && (
            <div className="absolute left-5 right-5 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <h3 className="text-slate-800 font-bold text-sm mb-3">Chọn khu vực tìm kiếm</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DISTRICTS.map(district => (
                  <button
                    key={district}
                    onClick={() => {
                      setSelectedDistrict(district);
                      setShowLocationPicker(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all text-center ${
                      selectedDistrict === district
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats Cards ── */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/candidate/shifts"
            className="bg-white rounded-2xl p-4 shadow-sm border border-white flex flex-col gap-2 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-indigo-600 w-[18px] h-[18px]" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lịch làm</p>
            <p className="text-slate-900 text-2xl font-black leading-none">{activeShiftsCount}</p>
          </Link>

          <Link
            to="/candidate/applications"
            className="bg-white rounded-2xl p-4 shadow-sm border border-white flex flex-col gap-2 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FileText className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Ứng tuyển</p>
            <p className="text-slate-900 text-2xl font-black leading-none">{totalAppliedCount}</p>
          </Link>

          <Link
            to="/candidate/wishlist"
            className="bg-white rounded-2xl p-4 shadow-sm border border-white flex flex-col gap-2 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
              <Heart className="w-[18px] h-[18px] text-rose-500" />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Đã lưu</p>
            <p className="text-slate-900 text-2xl font-black leading-none">{totalWishlistCount}</p>
          </Link>
        </div>
      </div>

      {/* ── Earnings Teaser Banner ── */}
      <div className="px-5 mt-4">
        <Link
          to="/candidate/wallet"
          className="flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-md shadow-emerald-200 active:scale-[0.98] transition-transform"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[15px]">Ví thu nhập</p>
            <p className="text-emerald-100 text-[12px]">Xem số dư và lịch sử thanh toán</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </Link>
      </div>

      {/* ── Job Recommendations ── */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-slate-900 text-[17px]">Việc làm gợi ý</h2>
          <Link
            to="/jobs"
            className="text-[13px] font-bold text-indigo-600 flex items-center gap-0.5 bg-indigo-50 px-3 py-1.5 rounded-xl"
          >
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 -mx-5 px-5">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === label
                  ? 'bg-[#1e3a5f] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="mt-2 space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm mt-2">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Chưa có việc làm mới</h3>
              <p className="text-slate-400 text-sm">Hệ thống sẽ cập nhật sớm nhất cho bạn.</p>
            </div>
          ) : (
            filteredJobs.slice(0, 10).map((job: any) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyName={job.employerName || 'Nhà tuyển dụng'}
                title={job.title}
                wage={job.salary ? `${job.salary.toLocaleString()}đ/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'giờ'}` : 'Thỏa thuận'}
                distance={job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc'}
                shift={job.shiftTime || (job.employmentType === 'PART_TIME' ? 'Bán thời gian' : 'Toàn thời gian')}
                logoUrl={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.title}&backgroundColor=3b82f6`}
                hasVerifiedBadge={job.isPremium || false}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Quick Apply Banner ── */}
      <div className="px-5 mt-6 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 text-[14px] mb-0.5">Ca làm hôm nay</p>
            <p className="text-slate-500 text-[12px]">
              {activeShiftsCount > 0
                ? `Bạn có ${activeShiftsCount} ca đang hoạt động`
                : 'Chưa có ca làm nào được nhận'}
            </p>
          </div>
          <Link
            to="/candidate/shifts"
            className="bg-slate-900 text-white text-[12px] font-bold px-3 py-2 rounded-xl shrink-0"
          >
            Xem
          </Link>
        </div>
      </div>
    </div>
  );
}
