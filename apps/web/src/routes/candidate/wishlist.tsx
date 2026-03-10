import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useWishlistJobs } from '@/features/jobs/hooks/useWishlistJobs';
import { ArrowLeft, BookHeart, HeartOff } from 'lucide-react';
import { JobCard } from '@/features/jobs/components/JobCard';

export const Route = createFileRoute('/candidate/wishlist')({
  component: WishlistPage,
});

function WishlistPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const { data: wishlistJobs = [], isLoading, isError } = useWishlistJobs(userProfile?.uid);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 pt-12 pb-4 px-5 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '/candidate/profile' })}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Việc làm đã lưu</h1>
            <p className="text-sm font-medium text-slate-500">{wishlistJobs.length} công việc</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-5 pt-6 pb-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải danh sách...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
            Có lỗi xảy ra khi tải danh sách. Vui lòng thử lại sau.
          </div>
        ) : wishlistJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm mt-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookHeart className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="font-bold text-slate-800 text-xl mb-2">Chưa có việc làm nào</h3>
            <p className="text-slate-500 text-sm mb-8 max-w-[250px] mx-auto leading-relaxed">
              Bạn chưa lưu bất kỳ công việc nào. Hãy tìm kiếm và lưu lại những công việc phù hợp nhé!
            </p>
            <button
              onClick={() => navigate({ to: '/jobs' })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              Tìm việc ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistJobs.map((job: any) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyName={job.employerName || 'Nhà tuyển dụng'}
                title={job.title}
                wage={job.salary ? `${job.salary.toLocaleString()}đ/${job.salaryType === 'PER_SHIFT' ? 'ca' : 'tháng'}` : 'Thỏa thuận'}
                distance={job.location?.address?.split(',')[0] || job.address?.split(',')[0] || 'Toàn quốc'}
                shift={job.employmentType === 'PART_TIME' ? 'Bán thời gian' : 'Toàn thời gian'}
                logoUrl={job.images?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${job.title}&backgroundColor=3b82f6`}
                hasVerifiedBadge={job.isPremium || false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
