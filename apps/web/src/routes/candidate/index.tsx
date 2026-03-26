import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { JobCard } from '@/features/jobs/components/JobCard';
import { useState } from 'react';

export const Route = createFileRoute('/candidate/')({ component: CandidateDashboard });

const CATEGORIES = [
  { label: 'Tất cả', icon: 'bolt', color: 'indigo' },
  { label: 'F&B', icon: 'coffee', color: 'orange' },
  { label: 'Giao hàng', icon: 'local_shipping', color: 'sky' },
  { label: 'Bán hàng', icon: 'shopping_bag', color: 'pink' },
  { label: 'Sự kiện', icon: 'event', color: 'violet' },
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
  const [selectedDistrict, setSelectedDistrict] = useState('Hà Đông');
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
  const heroMessage = activeShiftsCount
    ? `Bạn đang có ${activeShiftsCount} ca trong tiến trình`
    : 'Khám phá ca làm mới để tích điểm nhanh hơn';

  const greeting = getGreeting();

  const filteredJobs = jobs.filter((job: any) => {
    if (activeCategory !== 'Tất cả') {
      const text = `${job.title} ${job.description}`.toLowerCase();
      let categoryMatch = false;
      if (activeCategory === 'F&B') categoryMatch = text.includes('phục vụ') || text.includes('pha chế') || text.includes('nhà hàng') || text.includes('f&b');
      else if (activeCategory === 'Giao hàng') categoryMatch = text.includes('giao hàng') || text.includes('shipper');
      else if (activeCategory === 'Bán hàng') categoryMatch = text.includes('bán hàng') || text.includes('sale') || text.includes('thu ngân');
      else if (activeCategory === 'Sự kiện') categoryMatch = text.includes('sự kiện') || text.includes('event') || text.includes('pg');

      if (!categoryMatch) return false;
    }

    const address = (job.location?.address || job.address || '').toLowerCase();
    if (!address.includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (isLoading || isError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        {isLoading ? (
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        ) : (
          <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">error</span>
        )}
        <p className="text-slate-600 font-medium">{isLoading ? 'Đang tải trang chủ...' : 'Không thể tải dữ liệu. Vui lòng thử lại sau.'}</p>
      </div>
    );
  }

  const heroStats = [
    { label: 'Đã ứng tuyển', value: totalAppliedCount, accent: 'bg-amber-50/80', icon: 'description' },
    { label: 'Ca đang theo dõi', value: activeShiftsCount, accent: 'bg-emerald-50/80', icon: 'schedule' },
    { label: 'Đã lưu', value: totalWishlistCount, accent: 'bg-rose-50/80', icon: 'favorite' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-body">
      <section className="relative overflow-hidden bg-[#0F172A] px-5 pt-12 pb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#3b82f6_0%,#0f172a_60%,#020617_100%)] opacity-60" />
        <div className="absolute top-8 left-5 w-20 h-20 bg-white/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#2dd4bf]/20 rounded-full blur-[90px]" />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] uppercase tracking-[0.6em] text-blue-200/80">{greeting}</p>
              <h1 className="text-white text-3xl font-headline font-black tracking-tight mt-2">
                {userProfile?.full_name || 'Bạn'} đang sẵn sàng
              </h1>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center relative text-white font-bold shadow-lg shadow-slate-900/30">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0F172A]"></span>
            </button>
          </div>
          <p className="text-blue-100 text-[15px] max-w-xl">{heroMessage}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate({ to: '/jobs' })}
              className="flex items-center gap-3 rounded-[1.5rem] border border-white/20 bg-white/10 px-4 py-3 text-left text-white shadow-[0_20px_40px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-2xl text-blue-200">search</span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/80">Tìm việc</p>
                <p className="text-base font-bold">Tìm việc phù hợp ngay</p>
              </div>
            </button>
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-3 rounded-[1.5rem] border border-white/20 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white shadow-[0_20px_40px_rgba(15,23,42,0.35)]"
            >
              <span className="material-symbols-outlined text-2xl">location_on</span>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/80">Vị trí</p>
                <p className="text-base font-bold">{selectedDistrict}</p>
              </div>
            </button>
          </div>
        </div>
        {showLocationPicker && (
          <div className="absolute inset-x-5 -bottom-12 rounded-[2rem] bg-white p-5 shadow-2xl border border-slate-100 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 font-bold">Chọn khu vực</h3>
              <button onClick={() => setShowLocationPicker(false)} className="text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DISTRICTS.map((district) => (
                <button
                  key={district}
                  onClick={() => {
                    setSelectedDistrict(district);
                    setShowLocationPicker(false);
                  }}
                  className={`rounded-2xl px-3 py-2 text-sm font-bold transition-colors ${
                    selectedDistrict === district
                      ? 'bg-slate-900 text-white border border-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="px-5 -mt-10 relative z-10 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {heroStats.map(({ label, value, accent, icon }) => (
            <Link
              key={label}
              to={
                label === 'Ca đang theo dõi'
                  ? '/candidate/shifts'
                  : label === 'Đã lưu'
                    ? '/candidate/wishlist'
                    : '/candidate/applications'
              }
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                <span className="material-symbols-outlined text-xl text-slate-700">{icon}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{label}</p>
                <p className="text-3xl font-headline font-black text-slate-900">{value}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Đổi mới</p>
            <h2 className="text-2xl font-headline font-black text-slate-900">Việc làm gợi ý</h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600"
          >
            Xem tất cả
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`flex items-center gap-2 rounded-[1.8rem] border px-4 py-2 text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === label
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/80 p-10 text-center text-slate-500">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">search_off</span>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy việc làm</h3>
              <p className="text-sm">Thử thay đổi khu vực, bộ lọc hoặc tần suất để mở rộng danh sách.</p>
            </div>
          ) : (
            filteredJobs.slice(0, 10).map((job: any) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyName={job.employerName || 'Nhà tuyển dụng'}
                title={job.title}
                wage={job.salary ? `${(job.salary / 1000).toLocaleString()}K/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'giờ'}` : 'Thỏa thuận'}
                distance={job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Khu vực'}
                shift={job.shiftTime || (job.employmentType === 'PART_TIME' ? 'Bán thời gian' : 'Toàn thời gian')}
                logoUrl={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.employerName}&backgroundColor=3b82f6`}
                hasVerifiedBadge={job.employerVerificationStatus === 'VERIFIED' || false}
              />
            ))
          )}
        </div>
      </section>

      <section className="px-5 mt-8 space-y-4">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">event_upcoming</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Hôm nay</p>
              <h3 className="text-xl font-headline font-black text-slate-900">
                {activeShiftsCount > 0 ? `${activeShiftsCount} ca đang chờ` : 'Không có ca nào'}
              </h3>
              <p className="text-sm text-slate-500">
                {activeShiftsCount > 0
                  ? 'Bám sát tiến trình để nhận tiền kịp thời.'
                  : 'Khám phá việc làm mới và đăng ký liền tay.'}
              </p>
            </div>
          </div>
          <Link
            to="/candidate/shifts"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
          >
            Quản lý ca
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
