import { createFileRoute, Link } from '@tanstack/react-router';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobMapView } from '@/features/jobs/components/JobMapView';
import { useNearbyJobs } from '@/features/jobs/hooks/useNearbyJobs';
import { mapJobDocToJob } from '@/features/jobs/services/adapters';
import { mapNearbyApiToJobDocSafe } from '@/features/jobs/services/jobSearchService';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { DistrictPicker } from '@/features/jobs/components/DistrictPicker';
import { Briefcase, CalendarClock, ChevronRight, Heart, Wallet } from 'lucide-react';

export const Route = createFileRoute('/candidate/')({ component: CandidateDashboard });

const CATEGORIES = [
  { label: 'Tất cả' },
  { label: 'F&B' },
  { label: 'Giao hàng' },
  { label: 'Văn phòng' },
  { label: 'Lao động chân tay' },
];

function CandidateDashboard() {
  const { userProfile } = useAuth();
  
  // Real data hooks that were removed
  const { data: applications = [] } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100
  });
  const { data: wishlist = [] } = useWishlistJobs(userProfile?.uid);
  const { data: jobs = [], isLoading, isError } = useAllJobs();

  // State
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchText, setSearchText] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('Tất cả Khu vực');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Derived stats
  const activeApplications = applications.filter(app => app.status === 'PENDING' || app.status === 'APPROVED').length;
  const activeShifts = applications.filter(app => app.status === 'APPROVED' || app.status === 'CHECKED_IN').length;
  const wishlistCount = wishlist.length;

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Chào buổi sáng' : currentHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const matchesJobFilters = (job: any) => {
    // Search filter
    if (searchText) {
      const text = `${job.title} ${job.employerName} ${job.description}`.toLowerCase();
      if (!text.includes(searchText.toLowerCase())) return false;
    }

    // District filter
    if (activeDistrict !== 'Tất cả Khu vực') {
      const address = (job.location?.address || job.address || '').toLowerCase();
      if (!address.includes(activeDistrict.toLowerCase())) return false;
    }

    // Category filter
    if (activeCategory !== 'Tất cả') {
      const text = `${job.title} ${job.description}`.toLowerCase();
      let categoryMatch = false;
      if (activeCategory === 'F&B') categoryMatch = text.includes('phục vụ') || text.includes('pha chế') || text.includes('nhà hàng') || text.includes('f&b') || text.includes('coffee');
      else if (activeCategory === 'Giao hàng') categoryMatch = text.includes('giao hàng') || text.includes('shipper') || text.includes('kho vận');
      else if (activeCategory === 'Văn phòng') categoryMatch = text.includes('văn phòng') || text.includes('cộng tác viên') || text.includes('sale') || text.includes('thu ngân');
      else if (activeCategory === 'Lao động chân tay') categoryMatch = text.includes('lao động') || text.includes('kho') || text.includes('bốc xếp') || text.includes('sự kiện') || text.includes('event');
      if (!categoryMatch) return false;
    }
    return true;
  };

  const filteredJobs = jobs.filter(matchesJobFilters);

  useEffect(() => {
    if (viewMode !== 'map' || mapLocation) return;

    const fallbackJob = filteredJobs.find((job: any) => job.location?.latitude && job.location?.longitude);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (fallbackJob) {
        setMapLocation({
          lat: fallbackJob.location.latitude,
          lng: fallbackJob.location.longitude,
          address: fallbackJob.location.address || fallbackJob.address || 'Khu vực có việc làm',
        });
      }
      setLocationError('Thiết bị không hỗ trợ lấy vị trí hiện tại. Đã chuyển sang khu vực có việc làm gần nhất.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Vị trí của bạn',
        });
        setLocationError(null);
        setIsLocating(false);
      },
      () => {
        if (fallbackJob) {
          setMapLocation({
            lat: fallbackJob.location.latitude,
            lng: fallbackJob.location.longitude,
            address: fallbackJob.location.address || fallbackJob.address || 'Khu vực có việc làm',
          });
        }
        setLocationError('Không lấy được GPS. Bạn vẫn có thể bấm trực tiếp lên bản đồ để xem việc làm quanh đó.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [filteredJobs, mapLocation, viewMode]);

  const {
    data: nearbyJobsRaw = [],
    isLoading: isNearbyLoading,
    isError: isNearbyError,
  } = useNearbyJobs({
    lat: mapLocation?.lat ?? 0,
    lng: mapLocation?.lng ?? 0,
    radius: 5000,
    enabled: viewMode === 'map' && !!mapLocation,
  });

  const nearbyJobs = useMemo(
    () =>
      nearbyJobsRaw
        .map((job) => mapJobDocToJob(job.id, mapNearbyApiToJobDocSafe(job)))
        .filter(matchesJobFilters),
    [nearbyJobsRaw, activeCategory, activeDistrict, searchText]
  );

  if (isLoading || isError) {
    return (
      <div className="min-h-screen bg-[#F2F4F6] flex flex-col items-center justify-center p-6 text-center">
        {isLoading ? (
          <div className="w-12 h-12 border-4 border-[#006399] border-t-transparent rounded-full animate-spin mb-4" />
        ) : (
          <span className="material-symbols-outlined text-rose-500 text-5xl mb-4">error</span>
        )}
        <p className="text-[#45464D] font-medium">{isLoading ? 'Đang tải trang chủ...' : 'Không thể tải dữ liệu. Vui lòng thử lại sau.'}</p>
      </div>
    );
  }

  const userFirstName = userProfile?.full_name?.split(' ').pop() || 'Bạn';

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-28 font-body">
      {/* Header with Greeting & Stats */}
      <header className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] pt-14 pb-6 px-6 rounded-b-[2rem] shadow-lg sticky top-0 z-40">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-200/80 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {userFirstName} 👋
            </h1>
          </div>
          <Link 
            to="/candidate/profile"
            className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {userProfile?.avatar_url ? (
               <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <span className="text-white font-bold text-lg">{userFirstName.charAt(0)}</span>
            )}
          </Link>
        </div>

        {/* Quick Stats Cards */}
        <div className="flex gap-3 mt-4">
          <Link to="/candidate/wallet" className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3 shadow-sm relative overflow-hidden active:scale-95 transition-transform">
           <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
           <Wallet className="w-5 h-5 text-emerald-100 mb-2" />
           <div className="text-2xl font-black text-white leading-tight">
             {(userProfile?.balance || 0).toLocaleString()}đ
           </div>
           <div className="text-[10px] font-bold text-emerald-100 uppercase mt-0.5 tracking-wider">Số dư ví</div>
        </Link>
          <div className="flex-1 flex flex-col gap-3">
             <Link to="/jobs" className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-inner border border-white/5 active:scale-95 transition-transform flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                   <Briefcase className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{activeApplications}</div>
                  <div className="text-[10px] text-blue-200 font-medium tracking-wide">Đã ứng tuyển</div>
                </div>
             </Link>
             <Link to="/jobs" className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-inner border border-white/5 active:scale-95 transition-transform flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                 <Heart className="w-4 h-4 text-rose-300" />
               </div>
               <div>
                 <div className="text-lg font-bold text-white">{wishlistCount}</div>
                 <div className="text-[10px] text-blue-200 font-medium tracking-wide">Việc đã lưu</div>
               </div>
             </Link>
          </div>
        </div>
      </header>

      <main className="pb-4">
        {activeShifts > 0 && (
          <div className="px-6 mt-6">
            <Link to="/jobs" className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <CalendarClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[15px]">Bạn có {activeShifts} ca làm sắp tới</h3>
                  <p className="text-amber-100 text-[12px] font-medium leading-tight mt-0.5">Nhấn để xem chi tiết lịch làm việc</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </Link>
          </div>
        )}

        {/* Search & Filter Section */}
        <section className="px-6 pt-6 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] group focus-within:ring-2 focus-within:ring-[#006399]/20 transition-all">
              <span className="material-symbols-outlined text-[#45464D] mr-3">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm font-medium placeholder:text-[#76777D]"
                placeholder="Tìm kiếm công việc..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            {/* View Switcher Map/List */}
            <button 
              onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
              className={`p-3.5 rounded-2xl shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] transition-colors ${viewMode === 'map' ? 'bg-[#006399] text-white' : 'bg-white text-[#191C1E] hover:bg-[#E6E8EA]'}`}
            >
              <span className="material-symbols-outlined">{viewMode === 'map' ? 'list' : 'map'}</span>
            </button>
          </div>

          <DistrictPicker 
            activeDistrict={activeDistrict} 
            onChange={setActiveDistrict} 
          />
        </section>

        {/* Category Horizontal Scroll */}
        <section className="overflow-x-auto no-scrollbar hide-scrollbar flex items-center gap-3 px-6 pb-4">
          {CATEGORIES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveCategory(label)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                activeCategory === label
                  ? 'bg-[#131B2E] text-white'
                  : 'bg-white text-[#45464D] shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] hover:bg-[#E6E8EA]'
              }`}
            >
              {label}
            </button>
          ))}
        </section>

        {/* Job List / Map */}
        <section className="px-6 space-y-4 mt-2">
          {viewMode === 'map' ? (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white p-4 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#76777D]">Việc làm quanh đây</p>
                    <h3 className="mt-1 text-lg font-headline font-bold text-[#191C1E]">
                      Bấm lên bản đồ để xem công việc gần khu vực bạn chọn
                    </h3>
                    <p className="mt-1 text-sm text-[#45464D]">
                      {mapLocation?.address || 'Mở bản đồ để lấy vị trí hiện tại hoặc chọn một điểm khác.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapLocation(null)}
                    className="rounded-full bg-[#E6E8EA] px-3 py-2 text-xs font-semibold text-[#191C1E] transition-colors hover:bg-[#D9DDE1]"
                  >
                    Định vị lại
                  </button>
                </div>
                {isLocating && (
                  <p className="mt-3 text-sm font-medium text-[#006399]">Đang lấy vị trí hiện tại...</p>
                )}
                {locationError && (
                  <p className="mt-3 text-sm text-[#B26A00]">{locationError}</p>
                )}
                {isNearbyError && (
                  <p className="mt-3 text-sm text-rose-600">Không tải được việc làm gần đây. Bạn hãy bấm lại một vị trí khác trên bản đồ.</p>
                )}
              </div>

              <JobMapView
                jobs={nearbyJobs}
                selectedLocation={mapLocation}
                onSelectLocation={(location) => {
                  setMapLocation(location);
                  setLocationError(null);
                }}
                detailVariant="candidate"
              />

              <div className="rounded-3xl bg-white p-4 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#191C1E]">Công việc gần điểm đã chọn</h3>
                    <p className="mt-1 text-sm text-[#45464D]">
                      {isNearbyLoading ? 'Đang tìm việc làm trong bán kính 5km...' : `${nearbyJobs.length} công việc phù hợp trong bán kính 5km.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)]">
              <span className="material-symbols-outlined text-5xl text-[#C6C6CD] mb-4 block">search_off</span>
              <h3 className="text-lg font-headline font-bold text-[#191C1E] mb-1">Không tìm thấy việc làm</h3>
              <p className="text-sm text-[#45464D]">Thử thay đổi bộ lọc hoặc từ khóa để mở rộng danh sách.</p>
            </div>
          ) : (
            filteredJobs.slice(0, 15).map((job: any) => (
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
        </section>
      </main>
    </div>
  );
}
