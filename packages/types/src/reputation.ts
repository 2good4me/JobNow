export const DEFAULT_REPUTATION_SCORE = 100;
export const MIN_REPUTATION_SCORE = 0;
export const MAX_REPUTATION_SCORE = 500;
export const EKYC_REPUTATION_BONUS = 20;

export type ReputationTier =
    | 'BANNED'
    | 'RESTRICTED'
    | 'RISK'
    | 'STANDARD'
    | 'GOLD'
    | 'DIAMOND';

export type ReputationActorRole = 'CANDIDATE' | 'EMPLOYER';

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
    | 'SYSTEM_STREAK_RECOVERY';

export type ReputationEntryStatus = 'APPLIED' | 'PENDING_REVIEW' | 'REVERSED';
export type ReputationDirection = 'REWARD' | 'PENALTY';

export interface ReputationActionDefinition {
    code: ReputationActionCode;
    role: ReputationActorRole | 'SYSTEM';
    label: string;
    labelVi: string;
    points: number;
    direction: ReputationDirection;
}

export interface ReputationHistoryEntry {
    id: string;
    user_id: string;
    user_role: ReputationActorRole;
    action_code: ReputationActionCode;
    action_label?: string;
    action_label_vi?: string;
    score_change: number;
    balance_after: number;
    status: ReputationEntryStatus;
    related_job_id?: string | null;
    related_application_id?: string | null;
    related_shift_id?: string | null;
    actor_id?: string | null;
    appeal_deadline_at?: any;
    created_at?: any;
    updated_at?: any;
    metadata?: Record<string, unknown>;
}

export interface ReputationAppeal {
    id: string;
    user_id: string;
    reputation_history_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    created_at?: any;
    updated_at?: any;
}

export const REPUTATION_ACTIONS: Record<ReputationActionCode, ReputationActionDefinition> = {
    C_COMPLETED: {
        code: 'C_COMPLETED',
        role: 'CANDIDATE',
        label: 'Completed shift',
        labelVi: 'Hoàn thành ca làm việc',
        points: 2,
        direction: 'REWARD',
    },
    C_RATING_5: {
        code: 'C_RATING_5',
        role: 'CANDIDATE',
        label: 'Received 5-star rating',
        labelVi: 'Nhận đánh giá 5 sao',
        points: 3,
        direction: 'REWARD',
    },
    C_REVIEW_OTHER: {
        code: 'C_REVIEW_OTHER',
        role: 'CANDIDATE',
        label: 'Reviewed employer',
        labelVi: 'Đánh giá nhà tuyển dụng',
        points: 1,
        direction: 'REWARD',
    },
    C_CANCEL_G24: {
        code: 'C_CANCEL_G24',
        role: 'CANDIDATE',
        label: 'Cancelled more than 24h before shift',
        labelVi: 'Hủy đơn trước ca hơn 24 giờ',
        points: -5,
        direction: 'PENALTY',
    },
    C_CANCEL_2_24: {
        code: 'C_CANCEL_2_24',
        role: 'CANDIDATE',
        label: 'Cancelled within 2-24h before shift',
        labelVi: 'Hủy đơn trong khoảng 2-24 giờ trước ca',
        points: -15,
        direction: 'PENALTY',
    },
    C_CANCEL_L2: {
        code: 'C_CANCEL_L2',
        role: 'CANDIDATE',
        label: 'Cancelled less than 2h before shift',
        labelVi: 'Hủy đơn sát giờ dưới 2 tiếng',
        points: -30,
        direction: 'PENALTY',
    },
    C_NOSHOW: {
        code: 'C_NOSHOW',
        role: 'CANDIDATE',
        label: 'No-show',
        labelVi: 'Bỏ ca không đến làm',
        points: -50,
        direction: 'PENALTY',
    },
    E_PAID_ONTIME: {
        code: 'E_PAID_ONTIME',
        role: 'EMPLOYER',
        label: 'Paid worker on time',
        labelVi: 'Thanh toán đúng hạn',
        points: 2,
        direction: 'REWARD',
    },
    E_RATING_5: {
        code: 'E_RATING_5',
        role: 'EMPLOYER',
        label: 'Received 5-star rating',
        labelVi: 'Nhận đánh giá 5 sao',
        points: 3,
        direction: 'REWARD',
    },
    E_QUICK_APP: {
        code: 'E_QUICK_APP',
        role: 'EMPLOYER',
        label: 'Approved candidate quickly',
        labelVi: 'Duyệt ứng viên nhanh',
        points: 1,
        direction: 'REWARD',
    },
    E_CANCEL_POST: {
        code: 'E_CANCEL_POST',
        role: 'EMPLOYER',
        label: 'Cancelled job posting',
        labelVi: 'Hủy bài đăng tuyển dụng',
        points: -10,
        direction: 'PENALTY',
    },
    E_CANCEL_L2: {
        code: 'E_CANCEL_L2',
        role: 'EMPLOYER',
        label: 'Cancelled job less than 2h before shift',
        labelVi: 'Hủy việc sát giờ dưới 2 tiếng',
        points: -40,
        direction: 'PENALTY',
    },
    E_REPORT_FALSE: {
        code: 'E_REPORT_FALSE',
        role: 'EMPLOYER',
        label: 'Posted false or abusive information',
        labelVi: 'Đăng thông tin sai sự thật',
        points: -50,
        direction: 'PENALTY',
    },
    EKYC_VERIFIED: {
        code: 'EKYC_VERIFIED',
        role: 'SYSTEM',
        label: 'eKYC verified',
        labelVi: 'Xác thực eKYC thành công',
        points: 20,
        direction: 'REWARD',
    },
    SYSTEM_STREAK_RECOVERY: {
        code: 'SYSTEM_STREAK_RECOVERY',
        role: 'SYSTEM',
        label: 'Recovery bonus for positive streak',
        labelVi: 'Hoàn điểm nhờ chuỗi hành vi tốt',
        points: 0,
        direction: 'REWARD',
    },
};
