import React from 'react';
import { Zap, Heart, Check, Shield, Trophy, Flame } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose';
  unlockedAt?: Date;
  unlocked: boolean;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const colorMap = {
  blue: 'bg-blue-100 text-blue-600 ring-1 ring-blue-200',
  amber: 'bg-amber-100 text-amber-600 ring-1 ring-amber-200',
  emerald: 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200',
  purple: 'bg-purple-100 text-purple-600 ring-1 ring-purple-200',
  rose: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200',
};

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

const iconSizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function AchievementBadges({
  achievements,
  maxDisplay = 5,
  size = 'md',
  showTooltip = true,
}: AchievementBadgesProps) {
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const displayed = unlockedAchievements.slice(0, maxDisplay);
  const remaining = Math.max(0, unlockedAchievements.length - maxDisplay);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayed.map((achievement) => {
        const Icon = achievement.icon;
        return (
          <div
            key={achievement.id}
            className={`${sizeMap[size]} ${colorMap[achievement.color]} rounded-full flex items-center justify-center flex-shrink-0 ${
              showTooltip ? 'cursor-help' : ''
            } transition-transform hover:scale-110`}
            title={showTooltip ? achievement.description : undefined}
          >
            <Icon className={iconSizeMap[size]} />
          </div>
        );
      })}

      {remaining > 0 && (
        <div
          className={`${sizeMap[size]} bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

/**
 * Predefined achievements for the system
 */
export const PREDEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'lightning-response',
    name: '⚡ Phản Hồi Siêu Tốc',
    description: 'Phản hồi ứng viên trong vòng 1 giờ',
    icon: Zap,
    color: 'amber',
    unlocked: true,
  },
  {
    id: 'high-satisfaction',
    name: '❤️ Hài Lòng Cao',
    description: 'Đạt 5⭐ từ 10 ứng viên trở lên',
    icon: Heart,
    color: 'rose',
    unlocked: true,
  },
  {
    id: 'trusted-employer',
    name: '✓ Nhà Tuyển Dụng Tin Cậy',
    description: 'Hoàn thành 50 ca không bù bớt',
    icon: Check,
    color: 'emerald',
    unlocked: true,
  },
  {
    id: 'verified-business',
    name: '🛡️ Kinh Doanh Xác Thực',
    description: 'Đã xác minh giấy phép kinh doanh',
    icon: Shield,
    color: 'blue',
    unlocked: true,
  },
  {
    id: 'top-employer',
    name: '👑 Nhà Tuyển Dụng Hàng Đầu',
    description: 'Hạng Diamond với trên 200 điểm uy tín',
    icon: Trophy,
    color: 'purple',
    unlocked: false,
  },
  {
    id: 'hot-recruiter',
    name: '🔥 Tuyển Dụng Hot',
    description: 'Đạt 100+ ứng tuyển trong 30 ngày',
    icon: Flame,
    color: 'amber',
    unlocked: false,
  },
];

export const CANDIDATE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'active-worker',
    name: '💪 Ong Chăm Chỉ',
    description: 'Hoàn thành 10 ca làm việc đầu tiên',
    icon: Zap,
    color: 'amber',
    unlocked: true,
  },
  {
    id: 'top-rated-candidate',
    name: '🌟 Ngôi Sao Sáng',
    description: 'Đạt đánh giá trung bình 5.0 từ 5 nhà tuyển dụng',
    icon: Trophy,
    color: 'rose',
    unlocked: true,
  },
  {
    id: 'verified-candidate',
    name: '🛡️ Hồ Sơ Tin Cậy',
    description: 'Đã hoàn thành xác minh CCCD/eKYC',
    icon: Shield,
    color: 'blue',
    unlocked: true,
  },
  {
    id: 'fast-learner',
    name: '⚡ Tiếp Thu Nhanh',
    description: 'Được nhà tuyển dụng đánh giá cao khả năng thích nghi',
    icon: Flame,
    color: 'purple',
    unlocked: false,
  },
  {
    id: 'reliable-partner',
    name: '🤝 Đối Tác Tin Cậy',
    description: 'Duy trì lịch sử làm việc ổn định và không bỏ ca',
    icon: Check,
    color: 'emerald',
    unlocked: false,
  },
];
