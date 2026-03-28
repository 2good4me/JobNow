import {
    DEFAULT_REPUTATION_SCORE,
    MAX_REPUTATION_SCORE,
    MIN_REPUTATION_SCORE,
    type ReputationTier,
} from './reputation';

export interface ReputationTierInfo {
    tier: ReputationTier;
    minScore: number;
    maxScore: number;
}

export function clampReputationScore(score: number): number {
    return Math.max(MIN_REPUTATION_SCORE, Math.min(MAX_REPUTATION_SCORE, Math.round(score)));
}

export function getReputationTier(score: number): ReputationTier {
    const safeScore = clampReputationScore(Number.isFinite(score) ? score : DEFAULT_REPUTATION_SCORE);
    if (safeScore > 200) return 'DIAMOND';
    if (safeScore >= 150) return 'GOLD';
    if (safeScore >= 100) return 'STANDARD';
    if (safeScore >= 60) return 'RISK';
    if (safeScore >= 30) return 'RESTRICTED';
    return 'BANNED';
}

export const REPUTATION_TIER_RANGES: ReputationTierInfo[] = [
    { tier: 'BANNED', minScore: 0, maxScore: 29 },
    { tier: 'RESTRICTED', minScore: 30, maxScore: 59 },
    { tier: 'RISK', minScore: 60, maxScore: 99 },
    { tier: 'STANDARD', minScore: 100, maxScore: 149 },
    { tier: 'GOLD', minScore: 150, maxScore: 200 },
    { tier: 'DIAMOND', minScore: 201, maxScore: 500 },
];
