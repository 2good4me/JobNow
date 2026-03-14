import { Users, type LucideIcon } from 'lucide-react';
import { getReputationTier, getProgressToNextTier } from '../helpers/reputationHelper';
import { ReputationBadge } from './ReputationBadge';

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
  const progress = getProgressToNextTier(reputationScore);

  const displayStatValue = statValue !== undefined ? statValue : (totalApplicants || 0);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header với Tier Badge */}
      <div className={`${tierInfo.bgColor} px-4 py-3 border-b ${tierInfo.borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Hạng Uy Tín
            </p>
            <ReputationBadge score={reputationScore} size="lg" showLabel={true} />
          </div>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Chi tiết
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-3 divide-x divide-slate-100">
        {/* Reputation Score */}
        <div className="text-center px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Điểm Uy Tín
          </p>
          <p className="text-2xl font-extrabold text-slate-800">{reputationScore}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {progress.pointsNeeded > 0
              ? `${progress.pointsNeeded} đến ${progress.nextTier?.labelVi}`
              : 'Tối đa'}
          </p>
        </div>

        {/* Rating */}
        <div className="text-center px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Đánh Giá
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-extrabold text-amber-500">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-amber-500">⭐</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">/5.0</p>
        </div>

        {/* Dynamic Third Stat */}
        <div className="text-center px-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            {statLabel}
          </p>
          <div className="flex items-center justify-center gap-1">
            <StatIcon className="w-4 h-4 text-blue-600" />
            <span className="text-2xl font-extrabold text-blue-600">{displayStatValue}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar đến Tier tiếp theo */}
      {progress.nextTier && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Tiến độ đến {progress.nextTier.labelVi}
            </span>
            <span className="text-xs font-bold text-slate-400">{progress.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${progress.nextTier.textColor.replace(
                'text-',
                'bg-'
              )}`}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
