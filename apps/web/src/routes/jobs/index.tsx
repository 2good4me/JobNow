import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowLeft, Search, Mic, Map as MapIcon,
  List, Heart, CheckCircle2
} from 'lucide-react';

export const Route = createFileRoute('/jobs/')({
  component: CandidateSearchDashboard,
});

function CandidateSearchDashboard() {
  const [distance, setDistance] = useState(5);
  const [minWage, setMinWage] = useState(35);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['F&B']);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
          <button className="text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              defaultValue="Nhân viên"
              className="w-full bg-slate-100 text-slate-900 rounded-full py-2.5 pl-10 pr-10 border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Suggestion Tags */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar text-[13px] whitespace-nowrap mb-2">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] mr-1">Gần đây</span>
          <button className="bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-slate-700 transition-colors">
            Phục vụ bàn
          </button>
          <button className="bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full text-slate-700 transition-colors">
            PG sự kiện
          </button>
          <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] ml-1 mr-1">Phổ biến</span>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Advanced Filters Section */}
        <div className="mb-6 border-b border-slate-200 pb-6 bg-white p-4 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[18px] font-bold text-slate-900">Bộ lọc nâng cao</h2>
            <button className="text-blue-500 text-[14px]">Đặt lại</button>
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

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
            ÁP DỤNG BỘ LỌC
          </button>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-slate-600 font-medium">Tìm thấy <span className="font-bold text-slate-900">24</span> việc làm</h3>
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
          <JobCard
            id="job1"
            companyName="The Coffee House"
            title="Nhân viên Phục vụ"
            wage="25k - 30k/h"
            distance="0.5km"
            shift="Ca chiều"
            logoUrl="https://api.dicebear.com/7.x/initials/svg?seed=TCH&backgroundColor=3b82f6"
          />
          <JobCard
            id="job2"
            companyName="Pizza 4P's"
            title="Phụ bếp Nhà hàng"
            wage="35k/h"
            distance="1.2km"
            shift="Ca gãy"
            logoUrl="https://api.dicebear.com/7.x/initials/svg?seed=4P&backgroundColor=ea580c"
            hasVerifiedBadge
          />
          <JobCard
            id="job3"
            companyName="Galaxy Event"
            title="PG Sự Kiện Ra Mắt"
            wage="150k/ca"
            distance="2.5km"
            shift="Thời vụ"
            logoUrl="https://api.dicebear.com/7.x/initials/svg?seed=GL&backgroundColor=10b981"
          />
        </div>

      </div>
    </div>
  );
}

function JobCard({
  id, companyName, title, wage, distance, shift, logoUrl, hasVerifiedBadge
}: {
  id: string, companyName: string, title: string, wage: string,
  distance: string, shift: string, logoUrl: string, hasVerifiedBadge?: boolean
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate({ to: '/candidate/jobs/$jobId', params: { jobId: id } });
      }}
      className="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm border border-slate-100"
    >
      <div className="relative">
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 border border-slate-200">
          <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
        </div>
        {hasVerifiedBadge && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="font-bold text-[16px] text-slate-900 truncate pr-2">{title}</h3>
          <button className="text-slate-400 hover:text-red-500 transition-colors shrink-0 bg-slate-50 p-1.5 rounded-full">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[13px] text-slate-500 mb-2 truncate">
          {companyName} <span className="text-slate-300">•</span> {distance}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 text-[12px] px-2.5 py-1 rounded-md font-medium">
            {shift}
          </div>
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[12px] px-2.5 py-1 rounded-md font-medium">
            {wage}
          </div>
        </div>
      </div>
    </div>
  );
}
