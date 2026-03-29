import { Link } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToggleWishlist } from '@/features/jobs/hooks/useWishlistJobs';
import { MouseEvent } from 'react';
import { toast } from 'sonner';

interface SavedJobCardProps {
  job: any;
}

export function SavedJobCard({ job }: SavedJobCardProps) {
  const { userProfile } = useAuth();
  const toggleWishlistMutation = useToggleWishlist();

  const handleToggleWishlist = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userProfile?.uid) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      return;
    }

    try {
      await toggleWishlistMutation.mutateAsync({
        userId: userProfile.uid,
        jobId: job.id,
        isCurrentlyWishlisted: true,
      });
      toast.success('Đã bỏ lưu việc làm');
    } catch (error) {
      toast.error('Không thể thao tác, vui lòng thử lại');
    }
  };

  const companyName = job.employerName || 'Nhà tuyển dụng';
  const logoUrl = job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}&backgroundColor=006399`;
  const wage = job.salary ? `${job.salary.toLocaleString()}đ/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'tháng'}` : 'Thỏa thuận';
  const distance = job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc';

  return (
    <Link
      to="/candidate/jobs/$jobId"
      params={{ jobId: job.id }}
      className="block bg-white rounded-3xl p-4 shadow-[0_4px_24px_-2px_rgba(124,131,155,0.04)] hover:shadow-md transition-shadow relative group"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ECEEF0] overflow-hidden flex-shrink-0">
            <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline font-bold text-lg text-[#191C1E] leading-tight mb-1 line-clamp-2 pr-8">
              {job.title || 'Công việc'}
            </h3>
            <p className="text-[13px] text-[#45464D] mb-2 font-medium flex items-center gap-1">
              {companyName}
              <span className="material-symbols-outlined text-[14px] text-[#006399]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </p>
            <div className="flex gap-1.5 flex-wrap mb-3">
              <span className="bg-[#E6F4EA] text-[#137333] px-2 py-0.5 rounded text-[10px] font-black tracking-wide">
                ĐANG TUYỂN
              </span>
              <span className="bg-[#F2F4F6] text-[#45464D] px-2 py-0.5 rounded text-[10px] font-black tracking-wide">
                {job.employmentType === 'PART_TIME' ? 'CA SÁNG' : 'TOÀN THỜI GIAN'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-[#006399] font-bold text-[15px]">{wage}</span>
              <span className="w-1 h-1 rounded-full bg-[#C6C6CD]" />
              <span className="text-[#45464D] text-[13px] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {distance}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleToggleWishlist}
        className="absolute top-4 right-4 text-[#BA1A1A] hover:bg-[#BA1A1A]/10 p-1.5 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          favorite
        </span>
      </button>
    </Link>
  );
}
