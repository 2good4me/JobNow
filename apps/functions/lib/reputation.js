"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPUTATION_ACTIONS = exports.EKYC_REPUTATION_BONUS = exports.MAX_REPUTATION_SCORE = exports.MIN_REPUTATION_SCORE = exports.DEFAULT_REPUTATION_SCORE = void 0;
exports.clampReputationScore = clampReputationScore;
exports.getReputationTier = getReputationTier;
exports.getCancellationActionCode = getCancellationActionCode;
exports.getReputationHistoryRef = getReputationHistoryRef;
exports.applyReputationAction = applyReputationAction;
const firestore_1 = require("firebase-admin/firestore");
exports.DEFAULT_REPUTATION_SCORE = 100;
exports.MIN_REPUTATION_SCORE = 0;
exports.MAX_REPUTATION_SCORE = 500;
exports.EKYC_REPUTATION_BONUS = 20;
const POSITIVE_STREAK_TARGET = 10;
exports.REPUTATION_ACTIONS = {
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
    EKYC_VERIFIED: { code: 'EKYC_VERIFIED', role: 'SYSTEM', labelVi: 'Xác thực eKYC thành công', points: exports.EKYC_REPUTATION_BONUS, direction: 'REWARD' },
    SYSTEM_STREAK_RECOVERY: { code: 'SYSTEM_STREAK_RECOVERY', role: 'SYSTEM', labelVi: 'Hoàn điểm nhờ chuỗi hành vi tốt', points: 0, direction: 'REWARD' },
};
function clampReputationScore(score) {
    return Math.max(exports.MIN_REPUTATION_SCORE, Math.min(exports.MAX_REPUTATION_SCORE, Math.round(score)));
}
function getReputationTier(score) {
    const safeScore = clampReputationScore(Number.isFinite(score) ? score : exports.DEFAULT_REPUTATION_SCORE);
    if (safeScore > 200)
        return 'DIAMOND';
    if (safeScore >= 150)
        return 'GOLD';
    if (safeScore >= 100)
        return 'STANDARD';
    if (safeScore >= 60)
        return 'RISK';
    if (safeScore >= 30)
        return 'RESTRICTED';
    return 'BANNED';
}
function getCancellationActionCode(hoursUntilShift) {
    if (hoursUntilShift === null)
        return 'C_CANCEL_G24';
    if (hoursUntilShift > 24)
        return 'C_CANCEL_G24';
    if (hoursUntilShift >= 2)
        return 'C_CANCEL_2_24';
    return 'C_CANCEL_L2';
}
function getHistoryRef(db, userId, actionCode, dedupeKey) {
    const normalized = `${userId}_${actionCode}_${dedupeKey}`
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 140);
    return db.collection('reputation_history').doc(normalized);
}
function getReputationHistoryRef(db, userId, actionCode, dedupeKey) {
    return getHistoryRef(db, userId, actionCode, dedupeKey);
}
async function applyReputationAction(input) {
    const action = exports.REPUTATION_ACTIONS[input.actionCode];
    const userRef = input.db.collection('users').doc(input.userId);
    const historyRef = getHistoryRef(input.db, input.userId, input.actionCode, input.dedupeKey);
    const status = input.status ?? 'APPLIED';
    // Use pre-read snapshot if available, otherwise do tx.get (only safe before writes)
    let historySnap;
    let userSnap = null;
    if (input.preReadHistorySnap !== undefined && input.preReadHistorySnap !== null) {
        historySnap = input.preReadHistorySnap;
        userSnap = null;
    }
    else if (input.preReadHistorySnap === null) {
        // preReadHistorySnap is explicitly null → doc doesn't exist, create a fake non-existing snap
        // We still need to call tx.get if we don't have a pre-read snap
        // But if null is passed, it means the doc was pre-checked and doesn't exist
        historySnap = { exists: false };
        userSnap = null;
    }
    else {
        [historySnap, userSnap] = await Promise.all([
            input.tx.get(historyRef),
            input.userData ? Promise.resolve(null) : input.tx.get(userRef),
        ]);
    }
    if (historySnap.exists) {
        const existing = historySnap.data() || {};
        const balanceAfter = Number(existing.balance_after ?? input.userData?.reputation_score ?? exports.DEFAULT_REPUTATION_SCORE);
        return {
            applied: false,
            score: clampReputationScore(balanceAfter),
            delta: Number(existing.score_change ?? 0),
            tier: getReputationTier(balanceAfter),
        };
    }
    const rawUserData = input.userData ?? (userSnap?.data() || {});
    const currentScore = clampReputationScore(Number(rawUserData.reputation_score ?? exports.DEFAULT_REPUTATION_SCORE));
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
        updated_at: firestore_1.FieldValue.serverTimestamp(),
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
        appeal_deadline_at: appliedDelta < 0 ? firestore_1.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000) : null,
        metadata: input.metadata ?? {},
        created_at: firestore_1.FieldValue.serverTimestamp(),
        updated_at: firestore_1.FieldValue.serverTimestamp(),
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
                updated_at: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            input.tx.set(recoveryRef, {
                user_id: input.userId,
                user_role: input.userRole,
                action_code: 'SYSTEM_STREAK_RECOVERY',
                action_label_vi: exports.REPUTATION_ACTIONS.SYSTEM_STREAK_RECOVERY.labelVi,
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
                created_at: firestore_1.FieldValue.serverTimestamp(),
                updated_at: firestore_1.FieldValue.serverTimestamp(),
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
