import { Link } from '@tanstack/react-router';
import { useUpdateApplicationStatus } from '@/features/jobs/hooks/useManageApplicants';
import { toast } from 'sonner';
import type { Application } from '@jobnow/types';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application: app }: ApplicationCardProps) {
  const updateStatusMutation = useUpdateApplicationStatus();
  
  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'APPROVED': 
        return { bg: 'bg-[#E6F4EA]', text: 'text-[#137333]', label: 'ĐÃ NHẬN' };
      case 'REJECTED': 
        return { bg: 'bg-[#FCE8E6]', text: 'text-[#C5221F]', label: 'TỪ CHỐI' };
      case 'NEW':
      case 'PENDING': 
        return { bg: 'bg-[#FEF7E0]', text: 'text-[#E37400]', label: 'CHỜ DUYỆT' };
      case 'CHECKED_IN': 
        return { bg: 'bg-[#E8F0FE]', text: 'text-[#1967D2]', label: 'ĐANG LÀM' };
      case 'COMPLETED': 
        return { bg: 'bg-[#F2F4F6]', text: 'text-[#45464D]', label: 'HOÀN THÀNH' };
      case 'CANCELLED': 
        return { bg: 'bg-[#F2F4F6]', text: 'text-[#7C839B]', label: 'ĐÃ HỦY' };
      default: 
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
    }
  };

  const handleCancelApplication = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast('Rút đơn ứng tuyển?', {
      description: 'Bạn có chắc chắn muốn hủy đơn ứng tuyển này không?',
      action: {
        label: 'Hủy đơn',
        onClick: async () => {
          try {
            await updateStatusMutation.mutateAsync({ id: app.id, status: 'CANCELLED' });
            toast.success('Đã rút đơn ứng tuyển thành công');
          } catch {
            toast.error('Không thể hủy đơn, vui lòng thử lại');
          }
        }
      }
    });
  };

  const theme = getStatusTheme(app.status);
  const canCancel = app.status === 'NEW' || app.status === 'PENDING';

  // Format salary
  const wage = app.salary
    ? `${app.salary.toLocaleString('vi-VN')}đ/${(app as any).salaryType === 'PER_HOUR' ? 'h' : 'ca'}`
    : 'Thỏa thuận';

  // Format shift time with date
  const shiftDisplay = app.shiftTime || 'Chưa xác định';
  const shiftDate = app.createdAt?.toDate?.()
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(app.createdAt.toDate())
    : '';

  // Time ago display
  const timeAgo = (() => {
    if (!app.createdAt?.toDate?.()) return 'Ứng tuyển gần đây';
    const diffMs = Date.now() - app.createdAt.toDate().getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Ứng tuyển vừa xong';
    if (diffHours < 24) return `Ứng tuyển ${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `Ứng tuyển ${diffDays} ngày trước`;
  })();

  return (
    <Link
      to="/candidate/applications/$applicationId"
      params={{ applicationId: app.id }}
      className="block bg-white rounded-3xl overflow-hidden shadow-[0_4px_24px_-2px_rgba(124,131,155,0.06)] hover:shadow-md transition-shadow border border-[#E2E2E9]/60"
    >
      {/* Top: Title + Company + Status Badge */}
      <div className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-3">
            <h3 className="font-bold text-[17px] text-[#191C1E] leading-snug mb-0.5 line-clamp-2">
              {app.jobTitle || 'Công việc'}
            </h3>
            <p className="text-[14px] text-[#45464D] font-medium">{app.employerName || 'Nhà tuyển dụng'}</p>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold tracking-wide whitespace-nowrap ${theme.bg} ${theme.text}`}>
            {theme.label}
          </div>
        </div>
      </div>

      {/* Middle: Job Details (Salary, Shift, Time) */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-[#45464D]">
          <span className="material-symbols-outlined text-[18px] text-[#7C839B]">payments</span>
          <span className="font-medium">{wage}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#45464D]">
          <span className="material-symbols-outlined text-[18px] text-[#7C839B]">schedule</span>
          <span className="font-medium">
            Ca {shiftDisplay}{shiftDate ? `, ${shiftDate}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#7C839B]">
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Bottom: Action Buttons — separated by a thin divider */}
      {(canCancel || app.status === 'APPROVED') && (
        <div className="px-4 pb-4">
          <div className="border-t border-[#F2F4F6] pt-4 flex items-center gap-3">
            {canCancel && (
              <button
                onClick={handleCancelApplication}
                className="w-full flex-1 border border-[#E2E2E9] text-[#191C1E] bg-white hover:bg-[#F2F4F6] py-2.5 rounded-2xl text-[14px] font-bold transition-colors"
              >
                Rút đơn
              </button>
            )}
            {app.status === 'APPROVED' && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to shift info
                  }}
                  className="flex-1 bg-[#006399] text-white py-2.5 rounded-2xl text-[14px] font-bold hover:bg-[#004e7a] transition-colors text-center"
                >
                  Xem ca làm
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to chat
                  }}
                  className="flex-1 border border-[#E2E2E9] text-[#191C1E] bg-white hover:bg-[#F2F4F6] py-2.5 rounded-2xl text-[14px] font-bold transition-colors text-center"
                >
                  Chat
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
