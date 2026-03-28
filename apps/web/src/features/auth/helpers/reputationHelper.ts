import {
  DEFAULT_REPUTATION_SCORE,
  MAX_REPUTATION_SCORE,
  MIN_REPUTATION_SCORE,
  REPUTATION_ACTIONS,
  getReputationTier as getTierKey,
  type ReputationActionDefinition,
  type ReputationActorRole,
  type ReputationTier,
} from '@jobnow/types';

export interface TierInfo {
  tier: ReputationTier;
  label: string;
  labelVi: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: 'Ban' | 'Lock' | 'AlertTriangle' | 'ShieldCheck' | 'Star' | 'Crown';
  iconColor: string;
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

export interface ReputationRuleItem {
  code: string;
  actionVi: string;
  points: number;
}

const TIER_DETAILS: Record<ReputationTier, TierInfo> = {
  BANNED: {
    tier: 'BANNED',
    label: 'Banned',
    labelVi: 'Cấm',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    icon: 'Ban',
    iconColor: 'text-rose-600',
    descriptionVi: 'Tài khoản xuống dưới 30 điểm và bị cấm tham gia hệ thống.',
    minScore: 0,
    maxScore: 29,
    restrictions: ['Không thể ứng tuyển hoặc đăng tin', 'Cần khiếu nại hoặc được admin mở lại'],
    benefits: [],
  },
  RESTRICTED: {
    tier: 'RESTRICTED',
    label: 'Restricted',
    labelVi: 'Hạn Chế',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: 'Lock',
    iconColor: 'text-orange-600',
    descriptionVi: 'Tài khoản bị hạn chế mạnh và cần phục hồi uy tín trước khi hoạt động bình thường.',
    minScore: 30,
    maxScore: 59,
    restrictions: ['Bị cảnh báo nổi bật trên hồ sơ', 'Ưu tiên hiển thị thấp', 'Nguy cơ bị khóa nếu tiếp tục vi phạm'],
    benefits: ['Vẫn có thể phục hồi điểm bằng chuỗi hành vi tốt'],
  },
  RISK: {
    tier: 'RISK',
    label: 'Risk',
    labelVi: 'Rủi Ro',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: 'AlertTriangle',
    iconColor: 'text-amber-600',
    descriptionVi: 'Tài khoản có rủi ro, cần cải thiện hành vi để trở về mức tiêu chuẩn.',
    minScore: 60,
    maxScore: 99,
    restrictions: ['Điểm uy tín thấp hơn mặt bằng chung', 'Cần hạn chế hủy ca hoặc chậm thanh toán'],
    benefits: ['Vẫn được hoạt động trên hệ thống', 'Có thể hồi điểm bằng chuỗi hành vi tốt'],
  },
  STANDARD: {
    tier: 'STANDARD',
    label: 'Standard',
    labelVi: 'Tiêu Chuẩn',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    icon: 'ShieldCheck',
    iconColor: 'text-sky-600',
    descriptionVi: 'Mức mặc định của hệ thống. Hoạt động bình thường với đầy đủ quyền cơ bản.',
    minScore: 100,
    maxScore: 149,
    restrictions: [],
    benefits: ['Điểm khởi tạo mặc định của tài khoản mới', 'Được tham gia đầy đủ các luồng chính'],
  },
  GOLD: {
    tier: 'GOLD',
    label: 'Gold',
    labelVi: 'Vàng',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: 'Star',
    iconColor: 'text-yellow-600',
    descriptionVi: 'Tài khoản uy tín cao, có lịch sử giao dịch và phản hồi tốt.',
    minScore: 150,
    maxScore: 200,
    restrictions: [],
    benefits: ['Được nhìn nhận là đối tác đáng tin cậy', 'Tăng độ tin cậy khi hiển thị hồ sơ'],
  },
  DIAMOND: {
    tier: 'DIAMOND',
    label: 'Diamond',
    labelVi: 'Kim Cương',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    icon: 'Crown',
    iconColor: 'text-violet-600',
    descriptionVi: 'Mức uy tín cao nhất, dành cho tài khoản duy trì hành vi rất ổn định.',
    minScore: 201,
    maxScore: 500,
    restrictions: [],
    benefits: ['Mốc uy tín cao nhất của hệ thống', 'Thể hiện hồ sơ cực kỳ đáng tin cậy'],
  },
};

const NEXT_TIER_THRESHOLDS = [30, 60, 100, 150, 201];

export function clampReputationScore(score: number): number {
  return Math.max(MIN_REPUTATION_SCORE, Math.min(MAX_REPUTATION_SCORE, Math.round(score)));
}

export function getReputationTier(score: number): TierInfo {
  return TIER_DETAILS[getTierKey(score)];
}

export function getProgressToNextTier(score: number): TierProgress {
  const safeScore = clampReputationScore(Number.isFinite(score) ? score : DEFAULT_REPUTATION_SCORE);
  const currentTier = getReputationTier(safeScore);
  const nextThreshold = NEXT_TIER_THRESHOLDS.find((threshold) => safeScore < threshold) ?? null;

  if (!nextThreshold) {
    return {
      currentTier,
      nextTier: null,
      currentScore: safeScore,
      nextTierScore: currentTier.maxScore,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const previousThreshold = NEXT_TIER_THRESHOLDS.filter((threshold) => threshold < nextThreshold).at(-1) ?? 0;
  const progressPercent = Math.floor(((safeScore - previousThreshold) / (nextThreshold - previousThreshold)) * 100);

  return {
    currentTier,
    nextTier: getReputationTier(nextThreshold),
    currentScore: safeScore,
    nextTierScore: nextThreshold,
    progressPercent: Math.max(0, Math.min(progressPercent, 100)),
    pointsNeeded: nextThreshold - safeScore,
  };
}

function toRuleItem(rule: ReputationActionDefinition): ReputationRuleItem {
  return {
    code: rule.code,
    actionVi: rule.labelVi,
    points: rule.points,
  };
}

export function getReputationRulesByRole(role: ReputationActorRole) {
  const entries = Object.values(REPUTATION_ACTIONS).filter((item) => item.role === role);
  return {
    rewards: entries.filter((item) => item.points > 0).map(toRuleItem),
    penalties: entries.filter((item) => item.points < 0).map(toRuleItem),
  };
}

export function getReputationActionLabel(actionCode: string): string {
  return REPUTATION_ACTIONS[actionCode as keyof typeof REPUTATION_ACTIONS]?.labelVi ?? actionCode;
}
