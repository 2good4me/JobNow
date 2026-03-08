/**
 * Reputation System Helper Functions
 * Handles Tier calculations, progress tracking, and reputation rules
 */

export enum ReputationTier {
  RESTRICTED = 'RESTRICTED',
  RISK = 'RISK',
  STANDARD = 'STANDARD',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
}

export type TierColor = 'red' | 'amber' | 'blue' | 'purple';

export interface TierInfo {
  tier: ReputationTier;
  label: string;
  labelVi: string;
  color: TierColor;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: 'Lock' | 'AlertTriangle' | 'ShieldCheck' | 'Star' | 'Crown';
  iconColor: string;
  description: string;
  descriptionVi: string;
  minScore: number;
  maxScore: number;
  restrictions: string[];
  benefits: string[];
}

export interface TierProgress {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  currentScore: number;
  nextTierScore: number;
  progressPercent: number;
  pointsNeeded: number;
}

/**
 * Get reputation tier information based on score
 * @param score - User's reputation score
 * @returns TierInfo object with all tier details
 */
export function getReputationTier(score: number): TierInfo {
  if (score >= 150) {
    return {
      tier: ReputationTier.DIAMOND,
      label: 'Diamond',
      labelVi: 'Kim Cương',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      icon: 'Crown',
      iconColor: 'text-purple-600',
      description: 'Highest reputation, prioritized in all features',
      descriptionVi: 'Uy tín cao nhất, được ưu tiên trong mọi tính năng',
      minScore: 150,
      maxScore: 999,
      restrictions: [],
      benefits: [
        'Unlimited job postings',
        'Candidate sees your listings first',
        'Marked as "Verified" on listings',
        'Access to premium features',
      ],
    };
  }

  if (score >= 120) {
    return {
      tier: ReputationTier.GOLD,
      label: 'Gold',
      labelVi: 'Vàng',
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      icon: 'Star',
      iconColor: 'text-amber-500',
      description: 'Trustworthy, unlocked premium features',
      descriptionVi: 'Tin cậy, mở khóa nhiều tính năng ưu tiên',
      minScore: 120,
      maxScore: 149,
      restrictions: [],
      benefits: [
        'Unlimited active listings',
        'Priority job notifications',
        'Access to premium analytics',
      ],
    };
  }

  if (score >= 80) {
    return {
      tier: ReputationTier.STANDARD,
      label: 'Standard',
      labelVi: 'Tiêu Chuẩn',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      icon: 'ShieldCheck',
      iconColor: 'text-blue-600',
      description: 'Standard reputation, normal operations',
      descriptionVi: 'Tiêu chuẩn, hoạt động bình thường',
      minScore: 80,
      maxScore: 119,
      restrictions: [],
      benefits: [
        'Visible on map',
        'Can receive applicants',
        'Standard features available',
      ],
    };
  }

  if (score >= 50) {
    return {
      tier: ReputationTier.RISK,
      label: 'Risk',
      labelVi: 'Rủi Ro',
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      icon: 'AlertTriangle',
      iconColor: 'text-amber-600',
      description: 'At risk, improve your behavior',
      descriptionVi: 'Rủi ro, cần cải thiện hành vi',
      minScore: 50,
      maxScore: 79,
      restrictions: [
        'Maximum 1 active job listing (Tier 1)',
        'Limited feature access',
        'Cannot use premium features',
      ],
      benefits: [
        'Still able to operate normally',
        'Can improve score through good behavior',
      ],
    };
  }

  // < 50: RESTRICTED
  return {
    tier: ReputationTier.RESTRICTED,
    label: 'Restricted',
    labelVi: 'Bị Hạn Chế',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    icon: 'Lock',
    iconColor: 'text-red-600',
    description: 'Restricted account, cannot post jobs',
    descriptionVi: 'Tài khoản bị hạn chế, không thể đăng tin',
    minScore: 0,
    maxScore: 49,
    restrictions: [
      'Cannot be seen on map (7 days)',
      'Cannot post job listings',
      'Candidates cannot see your listings (Shadow Ban)',
      'Limited to read-only access',
    ],
    benefits: [],
  };
}

/**
 * Get progress to next tier
 * @param score - User's current reputation score
 * @returns Progress information with percentages
 */
export function getProgressToNextTier(score: number): TierProgress {
  const currentTier = getReputationTier(score);

  // Define tier thresholds
  const tierThresholds = [50, 80, 120, 150];

  // Find current position
  let currentIndex = tierThresholds.findIndex((t) => score < t);
  if (currentIndex === -1) {
    // Score >= max tier
    currentIndex = tierThresholds.length;
  }

  const nextThreshold = tierThresholds[currentIndex] ?? null;

  if (!nextThreshold) {
    // Already at Diamond (max tier)
    return {
      currentTier,
      nextTier: null,
      currentScore: score,
      nextTierScore: 150,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const previousThreshold = currentIndex > 0 ? tierThresholds[currentIndex - 1] : 0;
  const pointsInRange = nextThreshold - previousThreshold;
  const pointsInCurrent = Math.max(0, score - previousThreshold);
  const progressPercent = Math.floor((pointsInCurrent / pointsInRange) * 100);

  return {
    currentTier,
    nextTier: getReputationTier(nextThreshold),
    currentScore: score,
    nextTierScore: nextThreshold,
    progressPercent: Math.min(progressPercent, 100),
    pointsNeeded: Math.max(0, nextThreshold - score),
  };
}

/**
 * Penalty and reward rules
 */
export const REPUTATION_RULES = {
  rewards: [
    {
      action: 'Complete shift successfully',
      actionVi: 'Hoàn thành ca làm việc',
      points: 10,
      color: 'emerald',
    },
    {
      action: 'Receive 5⭐ rating',
      actionVi: 'Được đánh giá 5⭐',
      points: 5,
      color: 'emerald',
    },
    {
      action: 'Quick response (< 1 hour)',
      actionVi: 'Phản hồi nhanh (< 1h)',
      points: 3,
      color: 'emerald',
    },
  ],
  penalties: [
    {
      action: 'Cancel shift last minute (< 2h)',
      actionVi: 'Hủy ca sát giờ (< 2h)',
      points: -30,
      color: 'red',
    },
    {
      action: 'No-show (over 30 min late)',
      actionVi: 'No-show (quá 30 phút)',
      points: -50,
      color: 'red',
    },
    {
      action: 'Reported for fraud/abuse',
      actionVi: 'Được báo cáo gian lận',
      points: -100,
      color: 'red',
    },
    {
      action: 'Employer cancels shift last minute',
      actionVi: 'Employer hủy ca sát giờ',
      points: -30,
      color: 'red',
    },
  ],
};

/**
 * Get reputation damage/reward summary
 */
export function getReputationImpact(actionKey: string): { points: number; label: string } | null {
  // Check rewards
  for (const reward of REPUTATION_RULES.rewards) {
    if (reward.actionVi.toLowerCase().includes(actionKey.toLowerCase())) {
      return { points: reward.points, label: reward.actionVi };
    }
  }

  // Check penalties
  for (const penalty of REPUTATION_RULES.penalties) {
    if (penalty.actionVi.toLowerCase().includes(actionKey.toLowerCase())) {
      return { points: penalty.points, label: penalty.actionVi };
    }
  }

  return null;
}
