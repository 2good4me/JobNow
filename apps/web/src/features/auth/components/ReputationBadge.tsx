import {
  Ban,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Star,
  Crown,
} from 'lucide-react';
import { getReputationTier } from '../helpers/reputationHelper';

interface ReputationBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ReputationBadge({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}: ReputationBadgeProps) {
  const tierInfo = getReputationTier(score);

  // Map icon string to component
  const IconMap = {
    Ban,
    Lock,
    AlertTriangle,
    ShieldCheck,
    Star,
    Crown,
  };
  const IconComponent = IconMap[tierInfo.icon as keyof typeof IconMap];

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${tierInfo.bgColor} rounded-full flex items-center justify-center flex-shrink-0 border ${tierInfo.borderColor}`}
      >
        <IconComponent className={`${iconSizeClasses[size]} ${tierInfo.iconColor}`} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-bold ${tierInfo.textColor}`}>
            {tierInfo.labelVi}
          </span>
          <span className="text-xs text-slate-500">
            {score} điểm
          </span>
        </div>
      )}
    </div>
  );
}
