import { Users, ShieldCheck, Star, type LucideIcon } from 'lucide-react';
import { getReputationTier } from '../helpers/reputationHelper';

interface ReputationStatsCardProps {
  reputationScore: number;
  averageRating: number;
  statValue?: number | string;
  statLabel?: string;
  statIcon?: LucideIcon;
  // Deprecated: used for backward compatibility with employer profile until updated
  totalApplicants?: number;
  onViewDetails?: () => void;
}

export function ReputationStatsCard({
  reputationScore,
  averageRating,
  statValue,
  statLabel = 'Ứng Viên',
  statIcon: StatIcon = Users,
  totalApplicants,
  onViewDetails,
}: ReputationStatsCardProps) {
  const tierInfo = getReputationTier(reputationScore);

  const displayStatValue = statValue !== undefined ? statValue : (totalApplicants || 0);

  return (
    <div className="space-y-4">
      {/* Khối Hạng Uy Tín */}
      <div className="bg-white dark:bg-[#1e293b] rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Hạng Uy Tín
          </h2>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              Chi tiết
            </button>
          )}
        </div>
        
        <div className="bg-[#f8faff] dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1e293b] flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-tight mb-0.5">
              {tierInfo.labelVi || 'Tiêu Chuẩn'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {reputationScore} điểm
            </p>
          </div>
        </div>
      </div>

      {/* 3 Blocks */}
      <div className="grid grid-cols-3 gap-3">
        {/* Điểm Uy Tín */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Điểm Uy Tín
          </p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            {reputationScore}
          </p>
        </div>

        {/* Đánh Giá */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Đánh Giá
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-amber-500">
              {averageRating.toFixed(1)}
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* Dynamic Third Stat */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {statLabel}
          </p>
          <div className="flex items-center gap-1.5 align-middle">
            <StatIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {displayStatValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
