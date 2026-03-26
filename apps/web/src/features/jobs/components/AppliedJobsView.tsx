import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useMyApplicationsRealtime } from '@/features/jobs/hooks/useMyApplicationsRealtime';
import { Link } from '@tanstack/react-router';
import { ApplicationCard } from './ApplicationCard';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export function AppliedJobsView() {
  const { userProfile } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  const { data: applications = [], isLoading } = useMyApplicationsRealtime({
    candidateId: userProfile?.uid,
    limit: 100,
  });

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'PENDING' && app.status !== 'NEW' && app.status !== 'PENDING') return false;
    if (activeFilter === 'APPROVED' && app.status !== 'APPROVED') return false;
    if (activeFilter === 'REJECTED' && app.status !== 'REJECTED') return false;
    return true;
  });

  const pendingCount = applications.filter(a => a.status === 'NEW' || a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  const filters: { label: string; value: FilterStatus }[] = [
    { label: `Tất cả (${applications.length})`, value: 'ALL' },
    { label: `Chờ duyệt (${pendingCount})`, value: 'PENDING' },
    { label: `Đã nhận (${approvedCount})`, value: 'APPROVED' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Chips — Stitch pill style */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sticky top-[152px] bg-[#F2F4F6] z-30 pt-3">
        {filters.map((f) => {
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-[#191C1E] text-white shadow-sm'
                  : 'bg-white border text-[#45464D] border-[#E2E2E9] hover:bg-[#F2F4F6]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Application List */}
      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#006399] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-[#7C839B]">Đang tải danh sách...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E2E2E9] shadow-sm">
            <div className="w-16 h-16 bg-[#006399]/10 text-[#006399] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">work_history</span>
            </div>
            <h2 className="text-lg font-bold text-[#191C1E] mb-2">Chưa có đơn nào</h2>
            <p className="text-[14px] text-[#45464D] mb-6 font-medium">
              {activeFilter === 'ALL'
                ? 'Bạn chưa ứng tuyển công việc nào.'
                : 'Không có đơn ở trạng thái này.'}
            </p>
            <Link
              to="/candidate"
              className="bg-[#006399] text-white font-bold px-6 py-3 rounded-full shadow-md"
            >
              Khám phá việc làm
            </Link>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}
