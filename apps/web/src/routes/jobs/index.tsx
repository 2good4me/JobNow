import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import {
  ArrowLeft, Search, Mic, Map as MapIcon,
  List, CheckCircle2, MapPin, Navigation
} from 'lucide-react';
import { JobCard } from '@/features/jobs/components/JobCard';
import { MapPicker } from '@/features/jobs/components/MapPicker';
import { JobMapView } from '@/features/jobs/components/JobMapView';

export const Route = createFileRoute('/jobs/')({
  component: CandidateSearchDashboard,
});

const DISTRICTS = [
  'Tất cả',
  'Ba Đình',
  'Hoàn Kiếm',
  'Tây Hồ',
  'Long Biên',
  'Cầu Giấy',
  'Đống Đa',
  'Hai Bà Trưng',
  'Hoàng Mai',
  'Thanh Xuân',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông',
];

// Helper to calculate distance in km between two lat/lng coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function CandidateSearchDashboard() {
  const [searchText, setSearchText] = useState('');
  const [distance, setDistance] = useState(5);
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  
  const [minWage, setMinWage] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const { data: jobs = [], isLoading, isError } = useAllJobs();

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      // 1. Search text
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(searchLower);
        const employerMatch = job.employerName?.toLowerCase().includes(searchLower);
        if (!titleMatch && !employerMatch) return false;
      }
      // 2. Minimum wage
      if (job.salary && job.salary < minWage * 1000) {
        return false;
      }
      // 3. Verified only
      if (verifiedOnly && !job.isPremium) {
        return false;
      }
      
      // 4a. GPS Location filter (takes precedence if selected)
      if (selectedLocation) {
         if (job.location?.latitude && job.location?.longitude) {
           const jobDist = calculateDistance(
             selectedLocation.lat, selectedLocation.lng, 
             job.location.latitude, job.location.longitude
           );
           if (jobDist > distance) {
             return false;
           }
         } else {
           // If job has no GPS, filter it out when using GPS search mode
           return false;
         }
      } 
      // 4b. District filter (fallback if no GPS location selected)
      else if (selectedDistrict !== 'Tất cả') {
        const address = (job.location?.address || job.address || '').toLowerCase();
        if (!address.includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }
      
      // 5. Categories
      if (selectedCategories.length > 0) {
        const textToSearch = `${job.title} ${job.description}`.toLowerCase();
        const matchesCategory = selectedCategories.some(cat => {
          if (cat === 'F&B') return textToSearch.includes('phục vụ') || textToSearch.includes('pha chế') || textToSearch.includes('nhà hàng') || textToSearch.includes('bán thời gian');
          if (cat === 'Giao hàng') return textToSearch.includes('giao hàng') || textToSearch.includes('shipper');
          if (cat === 'Sự kiện') return textToSearch.includes('sự kiện') || textToSearch.includes('event') || textToSearch.includes('pg');
          if (cat === 'Bán hàng') return textToSearch.includes('bán hàng') || textToSearch.includes('sale') || textToSearch.includes('thu ngân');
          return true;
        });
        if (!matchesCategory) return false;
      }

      // 6. Time filter
      if (selectedTime) {
        const jobDate = job.start_date || job.startDate;
        if (jobDate) {
          const today = new Date().toISOString().split('T')[0];
          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          if (selectedTime === 'Hôm nay' && jobDate !== today) return false;
          if (selectedTime === 'Ngày mai' && jobDate !== tomorrow) return false;
        }
      }

      // 7. Shift time filter
      if (selectedShifts.length > 0) {
        const jobShifts = job.shifts || [];
        const hasMatchingShift = jobShifts.some((s: any) => {
          const hour = parseInt((s.startTime || s.start_time || '0').split(':')[0] || '0');
          if (selectedShifts.includes('Sáng') && hour >= 5 && hour < 12) return true;
          if (selectedShifts.includes('Chiều') && hour >= 12 && hour < 17) return true;
          if (selectedShifts.includes('Tối') && hour >= 17) return true;
          return false;
        });
        if (!hasMatchingShift) return false;
      }
      return true;
    });
  }, [jobs, searchText, minWage, verifiedOnly, selectedDistrict, selectedLocation, distance, selectedCategories, selectedTime, selectedShifts]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [filteredJobs]);

  const handleResetFilters = () => {
    setDistance(5);
    setSelectedDistrict('Tất cả');
    setSelectedLocation(null);
    setMinWage(20);
    setSelectedCategories([]);
    setSelectedTime('');
    setSelectedShifts([]);
    setVerifiedOnly(false);
  };


  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleShift = (shift: string) => {
    setSelectedShifts(prev =>
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    );
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24 font-sans text-slate-800">
      {/* Search Header */}
      <div className="bg-white sticky top-0 z-40 pt-4 pb-2 px-4 shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center gap-3 mb-4">
          <button className="text-slate-600" onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm việc làm, công ty..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setShowFilters(true)}
              onClick={() => setShowFilters(true)}
              className="w-full bg-slate-100 text-slate-900 rounded-full py-2.5 pl-10 pr-10 border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-[15px]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Suggestion Tags */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar text-[13px] whitespace-nowrap mb-2">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mr-1">Gần đây</span>
          <button 
            className="bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-slate-700 transition-colors"
            onClick={() => {
              setSearchText('Phục vụ bàn');
              setShowFilters(false);
            }}
          >
            Phục vụ bàn
          </button>
          <button 
            className="bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-slate-700 transition-colors"
            onClick={() => {
              setSearchText('PG sự kiện');
              setShowFilters(false);
            }}
          >
            PG sự kiện
          </button>
          <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] ml-1 mr-1">Phổ biến</span>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Advanced Filters Section */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)}>
            <div 
              className="w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
                <h2 className="text-[18px] font-bold text-slate-900">Bộ lọc nâng cao</h2>
                <div className="flex gap-4">
                  <button onClick={handleResetFilters} className="text-blue-500 text-[14px] font-semibold">Xóa tất cả</button>
                  <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            {/* District Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="text-slate-600 font-medium text-[14px] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Khu vực tìm kiếm
                </div>
                <button
                  onClick={() => setShowMapPicker(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                    selectedLocation 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {selectedLocation ? (selectedLocation.address ? `Ghim tại: ${selectedLocation.address}` : 'Đã ghim vị trí GPS') : 'Ghim trên bản đồ'}
                </button>
              </div>
              
              {!selectedLocation && (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {DISTRICTS.map(district => (
                    <button
                      key={district}
                      onClick={() => setSelectedDistrict(district)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${selectedDistrict === district
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Distance Filter */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 text-[14px] font-medium">Khoảng cách</span>
                <span className="text-blue-600 text-[14px] font-bold">{distance} km</span>
              </div>
              <input
                type="range"
                min="1" max="10"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-1 text-slate-400 text-[12px]">
                <span>1km</span>
                <span>10km</span>
              </div>
            </div>

            {/* Minimum Wage Filter */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 text-[14px] font-medium">Lương tối thiểu / giờ</span>
                <span className="text-blue-600 text-[14px] font-bold">{minWage}k</span>
              </div>
              <input
                type="range"
                min="20" max="100" step="5"
                value={minWage}
                onChange={(e) => setMinWage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between mt-1 text-slate-400 text-[12px]">
                <span>20k</span>
                <span>100k</span>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <div className="text-slate-600 font-medium text-[14px] mb-3">Danh mục</div>
              <div className="flex flex-wrap gap-2">
                {['F&B', 'Giao hàng', 'Sự kiện', 'Bán hàng'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-5 py-2 rounded-full text-[14px] font-medium transition-colors ${selectedCategories.includes(cat)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Time and Shift */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-slate-600 font-medium text-[14px] mb-3">Thời gian</div>
                <div className="flex flex-col gap-2">
                  {['Hôm nay', 'Ngày mai'].map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-[14px] font-medium transition-colors ${selectedTime === time
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                        : 'bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-slate-600 font-medium text-[14px] mb-3">Ca làm</div>
                <div className="grid grid-cols-2 gap-2">
                  {['Sáng', 'Chiều', 'Tối'].map(shift => (
                    <button
                      key={shift}
                      onClick={() => toggleShift(shift)}
                      className={`py-2 rounded-xl text-[14px] font-medium transition-colors ${shift === 'Tối' ? 'col-span-2' : ''
                        } ${selectedShifts.includes(shift)
                          ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                          : 'bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {shift}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Employer Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-semibold text-[14px]">Employer đã xác thực</span>
              </div>
              <div
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${verifiedOnly ? 'bg-blue-600' : 'bg-slate-300'}`}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${verifiedOnly ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>

              </div>
              
              {/* Footer Buttons */}
              <div className="p-5 border-t border-slate-100 shrink-0 bg-white sm:rounded-b-3xl">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  ÁP DỤNG BỘ LỌC
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-slate-600 font-medium">Tìm thấy <span className="font-bold text-slate-900">{isLoading ? '...' : filteredJobs.length}</span> việc làm</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" /> Danh sách
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${viewMode === 'map' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
            >
              <MapIcon className="w-4 h-4" /> Bản đồ
            </button>
          </div>
        </div>

        {/* Real Job Items / Mock items based on new design */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">Đang tải việc làm...</div>
          ) : isError ? (
            <div className="text-center py-10 text-red-500">Có lỗi xảy ra khi tải danh sách việc làm.</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Không tìm thấy việc làm phù hợp.</div>
          ) : viewMode === 'map' ? (
            <JobMapView 
              jobs={filteredJobs as any} 
              selectedLocation={selectedLocation} 
              onSelectLocation={(loc) => {
                setSelectedLocation({...loc, address: 'Vị trí đã ghim'});
              }}
            />
          ) : (
            <>
              {filteredJobs.slice(0, visibleCount).map((job: any) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  companyName={job.employerName || 'Nhà tuyển dụng'}
                  title={job.title}
                  wage={job.salary ? `${job.salary.toLocaleString()}đ/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'tháng'}` : 'Thỏa thuận'}
                  distance={job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc'}
                  shift={job.shifts?.[0] ? `${job.shifts[0].startTime || job.shifts[0].start_time} - ${job.shifts[0].endTime || job.shifts[0].end_time}` : 'Linh hoạt'}
                  logoUrl={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.title}&backgroundColor=3b82f6`}
                  hasVerifiedBadge={job.isPremium || false}
                  detailVariant="public"
                />
              ))}
              {visibleCount < filteredJobs.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="w-full mt-4 py-3 border border-blue-200 bg-blue-50/80 rounded-xl font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  XEM THÊM ({filteredJobs.length - visibleCount} việc làm nữa)
                </button>
              )}
            </>
          )}
        </div>

      </div>

      {showMapPicker && (
        <MapPicker 
          onClose={() => setShowMapPicker(false)}
          onSelect={(lat, lng, address) => {
             setSelectedLocation({lat, lng, address});
             setSelectedDistrict('Tất cả'); // clear district if GPS is used
             setShowMapPicker(false);
          }}
          initialLocation={selectedLocation || undefined}
        />
      )}
    </div>
  );
}
