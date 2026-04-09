import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const DEFAULT_REPUTATION_SCORE = 100;
export const MIN_REPUTATION_SCORE = 0;
export const MAX_REPUTATION_SCORE = 500;
export const EKYC_REPUTATION_BONUS = 20;
const POSITIVE_STREAK_TARGET = 10;

export type ReputationTier =
  | 'BANNED'
  | 'RESTRICTED'
  | 'RISK'
  | 'STANDARD'
  | 'GOLD'
  | 'DIAMOND';

export type ReputationActionCode =
  | 'C_COMPLETED'
  | 'C_RATING_5'
  | 'C_REVIEW_OTHER'
  | 'C_CANCEL_G24'
  | 'C_CANCEL_2_24'
  | 'C_CANCEL_L2'
  | 'C_NOSHOW'
  | 'E_PAID_ONTIME'
  | 'E_RATING_5'
  | 'E_QUICK_APP'
  | 'E_CANCEL_POST'
  | 'E_CANCEL_L2'
  | 'E_REPORT_FALSE'
  | 'EKYC_VERIFIED'
  | 'SYSTEM_STREAK_RECOVERY'
  | 'SYSTEM_C_PENALTY_NO_SHOW'
  | 'SYSTEM_P_SETTLEMENT';

export type ReputationActionStatus = 'APPLIED' | 'PENDING_REVIEW' | 'REVERSED';
export type ReputationRole = 'CANDIDATE' | 'EMPLOYER';

export interface ReputationActionDefinition {
  code: ReputationActionCode;
  role: ReputationRole | 'SYSTEM';
  labelVi: string;
  points: number;
  direction: 'REWARD' | 'PENALTY';
}

export interface ApplyReputationActionInput {
  tx: FirebaseFirestore.Transaction;
  db: FirebaseFirestore.Firestore;
  userId: string;
  userRole: ReputationRole;
  userData?: FirebaseFirestore.DocumentData;
  actionCode: ReputationActionCode;
  dedupeKey: string;
  jobId?: string | null;
  applicationId?: string | null;
  shiftId?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
  status?: ReputationActionStatus;
  /** Pre-read history snapshot to avoid tx.get() after writes */
  preReadHistorySnap?: FirebaseFirestore.DocumentSnapshot | null;
}

export interface ApplyReputationActionResult {
  applied: boolean;
  score: number;
  delta: number;
  tier: ReputationTier;
}

export const REPUTATION_ACTIONS: Record<ReputationActionCode, ReputationActionDefinition> = {
  C_COMPLETED: { code: 'C_COMPLETED', role: 'CANDIDATE', labelVi: 'Hoàn thành ca làm việc', points: 2, direction: 'REWARD' },
  C_RATING_5: { code: 'C_RATING_5', role: 'CANDIDATE', labelVi: 'Nhận đánh giá 5 sao', points: 3, direction: 'REWARD' },
  C_REVIEW_OTHER: { code: 'C_REVIEW_OTHER', role: 'CANDIDATE', labelVi: 'Đánh giá nhà tuyển dụng', points: 1, direction: 'REWARD' },
  C_CANCEL_G24: { code: 'C_CANCEL_G24', role: 'CANDIDATE', labelVi: 'Hủy đơn trước ca hơn 24 giờ', points: -2, direction: 'PENALTY' },
  C_CANCEL_2_24: { code: 'C_CANCEL_2_24', role: 'CANDIDATE', labelVi: 'Hủy đơn trong khoảng 2-24 giờ trước ca', points: -10, direction: 'PENALTY' },
  C_CANCEL_L2: { code: 'C_CANCEL_L2', role: 'CANDIDATE', labelVi: 'Hủy đơn sát giờ dưới 2 tiếng', points: -30, direction: 'PENALTY' },
  C_NOSHOW: { code: 'C_NOSHOW', role: 'CANDIDATE', labelVi: 'Bỏ ca không đến làm', points: -50, direction: 'PENALTY' },
  E_PAID_ONTIME: { code: 'E_PAID_ONTIME', role: 'EMPLOYER', labelVi: 'Thanh toán đúng hạn', points: 2, direction: 'REWARD' },
  E_RATING_5: { code: 'E_RATING_5', role: 'EMPLOYER', labelVi: 'Nhận đánh giá 5 sao', points: 3, direction: 'REWARD' },
  E_QUICK_APP: { code: 'E_QUICK_APP', role: 'EMPLOYER', labelVi: 'Duyệt ứng viên nhanh', points: 1, direction: 'REWARD' },
  E_CANCEL_POST: { code: 'E_CANCEL_POST', role: 'EMPLOYER', labelVi: 'Hủy bài đăng tuyển dụng', points: -10, direction: 'PENALTY' },
  E_CANCEL_L2: { code: 'E_CANCEL_L2', role: 'EMPLOYER', labelVi: 'Hủy việc sát giờ dưới 2 tiếng', points: -40, direction: 'PENALTY' },
  E_REPORT_FALSE: { code: 'E_REPORT_FALSE', role: 'EMPLOYER', labelVi: 'Đăng thông tin sai sự thật', points: -50, direction: 'PENALTY' },
  EKYC_VERIFIED: { code: 'EKYC_VERIFIED', role: 'SYSTEM', labelVi: 'Xác thực eKYC thành công', points: EKYC_REPUTATION_BONUS, direction: 'REWARD' },
  SYSTEM_STREAK_RECOVERY: { code: 'SYSTEM_STREAK_RECOVERY', role: 'SYSTEM', labelVi: 'Hoàn điểm nhờ chuỗi hành vi tốt', points: 0, direction: 'REWARD' },
  SYSTEM_C_PENALTY_NO_SHOW: { code: 'SYSTEM_C_PENALTY_NO_SHOW', role: 'SYSTEM', labelVi: 'Trừ điểm uy tín (Vắng mặt không phép)', points: -10, direction: 'PENALTY' },
  SYSTEM_P_SETTLEMENT: { code: 'SYSTEM_P_SETTLEMENT', role: 'SYSTEM', labelVi: 'Cộng điểm uy tín (Hoàn tất thanh toán)', points: 2, direction: 'REWARD' },
};

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

export function getCancellationActionCode(hoursUntilShift: number | null): ReputationActionCode {
  if (hoursUntilShift === null) return 'C_CANCEL_G24';
  if (hoursUntilShift > 24) return 'C_CANCEL_G24';
  if (hoursUntilShift >= 2) return 'C_CANCEL_2_24';
  return 'C_CANCEL_L2';
}

function getHistoryRef(
  db: FirebaseFirestore.Firestore,
  userId: string,
  actionCode: ReputationActionCode,
  dedupeKey: string
) {
  const normalized = `${userId}_${actionCode}_${dedupeKey}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 140);
  return db.collection('reputation_history').doc(normalized);
}

export function getReputationHistoryRef(
  db: FirebaseFirestore.Firestore,
  userId: string,
  actionCode: ReputationActionCode,
  dedupeKey: string
) {
  return getHistoryRef(db, userId, actionCode, dedupeKey);
}

export async function applyReputationAction(input: ApplyReputationActionInput): Promise<ApplyReputationActionResult> {
  const action = REPUTATION_ACTIONS[input.actionCode];
  const userRef = input.db.collection('users').doc(input.userId);
  const historyRef = getHistoryRef(input.db, input.userId, input.actionCode, input.dedupeKey);
  const status = input.status ?? 'APPLIED';

  // Use pre-read snapshot if already fetched to comply with Firestore transaction rules (read-before-write)
  let historySnap: FirebaseFirestore.DocumentSnapshot;
  let userSnap: FirebaseFirestore.DocumentSnapshot | null = null;

  // If preReadHistorySnap is explicitly passed (either as a real snap or as null indicating it was checked and doesn't exist)
  if (input.preReadHistorySnap !== undefined) {
    if (input.preReadHistorySnap === null) {
      // Create a fake snapshot that represents a non-existing document
      historySnap = { 
        exists: false, 
        data: () => undefined,
        id: historyRef.id,
        ref: historyRef
      } as unknown as FirebaseFirestore.DocumentSnapshot;
    } else {
      historySnap = input.preReadHistorySnap;
    }
  } else {
    // FALLBACK: Only if caller didn't provide pre-read data.
    // WARNING: This will fail if any tx.set/update has already been called in this transaction.
    [historySnap, userSnap] = await Promise.all([
      input.tx.get(historyRef),
      input.userData ? Promise.resolve(null) : input.tx.get(userRef),
    ]);
  }

  if (historySnap.exists) {
    const existing = historySnap.data() || {};
    const balanceAfter = Number(existing.balance_after ?? input.userData?.reputation_score ?? DEFAULT_REPUTATION_SCORE);
    return {
      applied: false,
      score: clampReputationScore(balanceAfter),
      delta: Number(existing.score_change ?? 0),
      tier: getReputationTier(balanceAfter),
    };
  }

  const rawUserData = input.userData ?? (userSnap?.data() || {});
  const currentScore = clampReputationScore(Number(rawUserData.reputation_score ?? DEFAULT_REPUTATION_SCORE));
  const requestedDelta = status === 'APPLIED' ? Number(action.points) : 0;
  const nextScore = clampReputationScore(currentScore + requestedDelta);
  const appliedDelta = nextScore - currentScore;
  const nextTier = getReputationTier(nextScore);
  const positiveStreak = Number(rawUserData.reputation_positive_streak ?? 0);
  const totalDeducted = Number(rawUserData.reputation_total_deducted ?? 0);
  const totalRestored = Number(rawUserData.reputation_total_restored ?? 0);
  const isReward = appliedDelta > 0;
  const isPenalty = appliedDelta < 0;

  input.tx.set(userRef, {
    reputation_score: nextScore,
    current_tier: nextTier,
    reputation_positive_streak: isReward ? positiveStreak + 1 : 0,
    reputation_total_deducted: isPenalty ? totalDeducted + Math.abs(appliedDelta) : totalDeducted,
    reputation_total_restored: totalRestored,
    updated_at: FieldValue.serverTimestamp(),
  }, { merge: true });

  input.tx.set(historyRef, {
    user_id: input.userId,
    user_role: input.userRole,
    action_code: input.actionCode,
    action_label_vi: action.labelVi,
    score_change: appliedDelta,
    score_requested: action.points,
    balance_after: nextScore,
    status,
    related_job_id: input.jobId ?? null,
    related_application_id: input.applicationId ?? null,
    related_shift_id: input.shiftId ?? null,
    actor_id: input.actorId ?? null,
    appeal_deadline_at: appliedDelta < 0 ? Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000) : null,
    metadata: input.metadata ?? {},
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });

  const nextPositiveStreak = isReward ? positiveStreak + 1 : 0;
  const restorable = Math.max(totalDeducted - totalRestored, 0);
  const recoveryPoints = nextPositiveStreak >= POSITIVE_STREAK_TARGET ? Math.floor(restorable * 0.5) : 0;

  if (recoveryPoints > 0) {
    const recoveryRef = getHistoryRef(input.db, input.userId, 'SYSTEM_STREAK_RECOVERY', `streak_${input.dedupeKey}`);
    const recoveryNextScore = clampReputationScore(nextScore + recoveryPoints);
    const appliedRecovery = recoveryNextScore - nextScore;

    if (appliedRecovery > 0) {
      input.tx.set(userRef, {
        reputation_score: recoveryNextScore,
        current_tier: getReputationTier(recoveryNextScore),
        reputation_positive_streak: 0,
        reputation_total_restored: totalRestored + appliedRecovery,
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });

      input.tx.set(recoveryRef, {
        user_id: input.userId,
        user_role: input.userRole,
        action_code: 'SYSTEM_STREAK_RECOVERY',
        action_label_vi: REPUTATION_ACTIONS.SYSTEM_STREAK_RECOVERY.labelVi,
        score_change: appliedRecovery,
        score_requested: recoveryPoints,
        balance_after: recoveryNextScore,
        status: 'APPLIED',
        related_job_id: input.jobId ?? null,
        related_application_id: input.applicationId ?? null,
        related_shift_id: input.shiftId ?? null,
        actor_id: input.actorId ?? null,
        metadata: {
          source_action: input.actionCode,
          restored_from_penalties: restorable,
          positive_streak_target: POSITIVE_STREAK_TARGET,
        },
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

      return {
        applied: true,
        score: recoveryNextScore,
        delta: appliedDelta + appliedRecovery,
        tier: getReputationTier(recoveryNextScore),
      };
    }
  }

  return {
    applied: true,
    score: nextScore,
    delta: appliedDelta,
    tier: nextTier,
  };
}
