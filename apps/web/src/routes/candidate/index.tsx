import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import {
  Search, Bell, Navigation, Banknote,
  UtensilsCrossed, Plus, Minus, MapPin,
  BadgeCheck, Star, RefreshCw
} from 'lucide-react';
import { useAllJobs } from '@/features/jobs/hooks/useAllJobs';
import { seedJobs } from '@/lib/api';

export const Route = createFileRoute('/candidate/')({
  component: CandidateMapDashboard,
});

function CandidateMapDashboard() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useAllJobs();

  const selectedJob: any = jobs.find((j: any) => j.id === selectedJobId) || jobs[0] || null;

  // Simple pseudo-random distribution for map pins since exact coordinates aren't fully visualized here
  const mapJobsToPins = useMemo(() => {
    // Default base coordinates (e.g. Center of screen)
    return jobs.map((job: any, index) => {
      // Create a deterministic pseudo-random spread based on index
      // Top: 20% to 80%
      const top = 20 + ((index * 13) % 60);
      // Left: 10% to 90%
      const left = 10 + ((index * 27) % 80);

      let wageText = `${job.salary || 0}k/h`;
      if (job.salaryType === 'PER_SHIFT') {
        wageText = `${((job.salary || 0) / 1000).toFixed(0)}k/ca`;
      } else if (job.salaryType === 'MONTHLY') {
        wageText = `${((job.salary || 0) / 1000000).toFixed(1)}M/tháng`;
      }

      return {
        ...job,
        top: `${top}%`,
        left: `${left}%`,
        delay: `${(index % 5) * 150}ms`,
        wageText,
        type: index % 3 === 0 ? 'high' : (index % 4 === 0 ? 'hot' : 'normal'), // Mocking highlight types
      };
    });
  }, [jobs]);


  return (
    <div className="relative w-full h-[100dvh] bg-[#9bbca4] overflow-hidden font-sans select-none">
      {/* Map Background Pattern / Simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Subtle radial gradient to simulate "focus" on center */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#7da488]/40 pointer-events-none"></div>

      {/* --- Top Overlay (Search & Filters) --- */}
      <div className="absolute top-0 inset-x-0 z-40 p-4 pb-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
        {/* Search Bar Row */}
        <div className="flex items-center gap-3 mb-4 pointer-events-auto">
          <div className="w-12 h-12 bg-[#e0dfd5] rounded-full p-1 border-2 border-white/50 shrink-0 shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0dfd5" alt="Avatar" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 relative bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center px-4 py-3 border border-white" onClick={() => navigate({ to: '/jobs' })}>
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Tìm quán, việc làm..."
              readOnly
              className="bg-transparent w-full outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400 cursor-pointer"
            />
          </div>

          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center border border-white relative shrink-0">
            <Bell className="w-6 h-6 text-slate-700" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-white">
              3
            </span>
          </button>
        </div>

        {/* Filter Chips Scroll Row */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pointer-events-auto pb-2">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full font-semibold text-[14px] shadow-md shadow-blue-500/30 shrink-0 border border-blue-500">
            <Navigation className="w-4 h-4 fill-white" />
            Gần nhất
          </button>
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2.5 rounded-full font-semibold text-[14px] shadow-sm shrink-0 border border-white">
            <Banknote className="w-4 h-4" />
            Lương cao
          </button>
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2.5 rounded-full font-semibold text-[14px] shadow-sm shrink-0 border border-white">
            <UtensilsCrossed className="w-4 h-4" />
            F&B
          </button>
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2.5 rounded-full font-semibold text-[14px] shadow-sm shrink-0 border border-white">
            Bán thời gian
          </button>
        </div>
      </div>

      {/* --- Elements on the Map --- */}

      {/* Center User Location Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
          <div className="absolute w-8 h-8 bg-blue-500/40 rounded-full"></div>
          {/* Main dot */}
          <div className="relative w-5 h-5 bg-blue-500 border-[3px] border-white rounded-full shadow-md"></div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-white font-bold animate-pulse drop-shadow-md bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm">
          Đang tải dữ liệu việc làm...
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 w-full px-8 text-center">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white max-w-sm">
            <h3 className="font-bold text-slate-900 text-[18px] mb-2">Chưa có việc làm nào</h3>
            <p className="text-slate-500 text-[14px] mb-6">
              Hệ thống hiện chưa có tin tuyển dụng nào. Bạn có muốn tạo dữ liệu mẫu để chạy thử không?
            </p>
            <button
              onClick={async () => {
                try {
                  await seedJobs();
                  window.location.reload();
                } catch (err) {
                  alert('Lỗi khi tạo dữ liệu mẫu');
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <RefreshCw className="w-5 h-5" /> Tạo dữ liệu mẫu
            </button>
          </div>
        </div>
      )}

      {/* Map Job Pins */}
      {mapJobsToPins.map((pin) => {
        const isSelected = selectedJob?.id === pin.id;

        // Determine styling based on pin type
        let bgClass = "bg-blue-600";
        let textClass = "text-white";

        if (pin.type === 'hot') {
          bgClass = "bg-amber-500";
        } else if (pin.type === 'high') {
          bgClass = "bg-emerald-500";
        }

        if (isSelected) {
          bgClass = "bg-slate-900"; // Darken when selected
        }

        return (
          <div
            key={pin.id}
            className={`absolute z-20 cursor-pointer transform transition-all duration-300 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'} animate-bounce-in`}
            style={{ top: pin.top, left: pin.left, animationDelay: pin.delay }}
            onClick={() => setSelectedJobId(pin.id)}
          >
            <div className={`${bgClass} ${textClass} px-3 py-1.5 rounded-full font-bold text-[13px] shadow-lg flex items-center gap-1 relative`}>
              {pin.type === 'hot' && <Star className="w-3.5 h-3.5 fill-white" />}
              {pin.wageText}

              {/* Down arrow triangle for the speech bubble effect */}
              <div className={`absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-current ${textClass} ${isSelected ? 'text-slate-900' : ''}`}
                style={{ borderTopColor: isSelected ? '#0f172a' : (pin.type === 'hot' ? '#f59e0b' : (pin.type === 'high' ? '#10b981' : '#2563eb')) }}>
              </div>
            </div>
          </div>
        );
      })}

      {/* Zoom Controls */}
      <div className="absolute right-4 bottom-56 z-30 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-slate-50 transition-colors">
          <Plus className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-700 hover:bg-slate-50 transition-colors">
          <Minus className="w-6 h-6" />
        </button>
      </div>

      {/* --- Bottom Sheet / Card --- */}
      {/* Safe spacing for actual bottom navigation bar is handled by PB */}
      <div className="absolute bottom-[20px] left-4 right-4 z-40">
        {selectedJob && (
          <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-white shadow-black/10 transition-transform duration-300 animate-slide-up relative">
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-[88px] h-[88px] rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 relative">
                <img
                  src={selectedJob.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedJob.title}`}
                  alt="Job cover"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[17px] text-slate-900 leading-tight pr-2 line-clamp-2">
                      {selectedJob.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium mb-3">
                    <span className="flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5" /> {(selectedJob.location?.address || selectedJob.address) ? (selectedJob.location?.address || selectedJob.address).split(',')[0] : 'Gần đây'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-emerald-500 font-extrabold text-[16px]">
                    {selectedJob.salary?.toLocaleString() || 'Thỏa thuận'}<span className="text-[12px] font-semibold text-emerald-600/70">{selectedJob.salaryType === 'PER_SHIFT' ? '/ca' : (selectedJob.salaryType === 'MONTHLY' ? '/tháng' : '/giờ')}</span>
                  </span>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-6 py-2 rounded-xl shadow-md shadow-blue-200 transition-colors active:scale-95 whitespace-nowrap"
                    onClick={() => navigate({ to: '/candidate/jobs/$jobId', params: { jobId: selectedJob.id } })}
                  >
                    Xem ngay
                  </button>
                </div>
              </div>

              {selectedJob.isPremium && (
                <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold uppercase border border-blue-100">
                  <BadgeCheck className="w-3.5 h-3.5 fill-blue-500 text-white" /> Ưu Tiên
                </div>
              )}
            </div>

            {/* Tiny Page Indicators for swiping (mock) */}
            <div className="flex justify-center gap-1.5 mt-4 mb-1">
              <div className="w-6 h-1.5 rounded-full bg-blue-500"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .bg-radial-gradient {
                    background-image: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
                }
                @keyframes bounce-in {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out;
                }
            `}</style>
    </div >
  );
}
