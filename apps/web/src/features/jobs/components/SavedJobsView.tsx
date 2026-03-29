import { useAuth } from '@/features/auth/context/AuthContext';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { Link } from '@tanstack/react-router';
import { SavedJobCard } from './SavedJobCard';

export function SavedJobsView() {
  const { userProfile } = useAuth();
  const { data: wishlistJobs = [], isLoading, isError } = useWishlistJobs(userProfile?.uid);

  const filters = [
    { label: `Tất cả (${wishlistJobs.length})`, active: true },
    { label: 'Đang tuyển', active: false },
    { label: 'Việc làm bán thời gian', active: false },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sticky top-[108px] bg-[#F2F4F6] z-30 pt-4">
        {filters.map((f, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-2xl text-[14px] font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
              f.active
                ? 'bg-[#191C1E] text-white shadow-sm'
                : 'bg-white border text-[#45464D] border-[#E2E2E9] hover:bg-[#F2F4F6]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pt-2 pb-6 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#006399] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-[#7C839B]">Đang tải danh sách...</p>
          </div>
        ) : isError ? (
          <div className="bg-[#BA1A1A]/10 text-[#BA1A1A] p-4 rounded-2xl text-center border border-[#BA1A1A]/20">
            Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại sau.
          </div>
        ) : wishlistJobs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 bg-[#E2E2E9] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[48px] text-[#A0A2A4]">heart_broken</span>
            </div>
            <h3 className="font-headline font-bold text-[#191C1E] text-lg mb-2">Chưa có việc làm nào được lưu</h3>
            <p className="text-[#45464D] text-[14px] mb-8 max-w-[250px] mx-auto leading-relaxed">
              Bấm <span className="text-[#BA1A1A]">❤</span> trên các tin tuyển dụng để lưu lại các công việc bạn yêu thích
            </p>
            <Link
              to="/candidate"
              className="bg-[#006399] hover:bg-[#004e7a] text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-all active:scale-[0.98]"
            >
              Khám phá việc làm
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistJobs.map((job: any) => (
              <SavedJobCard
                key={job.id}
                job={job}
              />
            ))}
            
            {/* Show empty state illustration at the bottom if jobs exist, matching the Stitch mockup? 
                Actually, the mockup shows an empty state at the end. We will assume the design means "if empty show this". */}
          </div>
        )}
      </div>
    </div>
  );
}
