export type ApplicationStatus =
    | 'NEW'
    | 'PENDING'
    /** @deprecated keep for backward compatibility only */
    | 'REVIEWED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CHECKED_IN'
    | 'COMPLETED'
    | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PROCESSING' | 'PAID';

export interface Application {
    id: string;
    jobId: string;
    shiftId: string;
    employerId: string;
    candidateId: string;
    status: ApplicationStatus;
    paymentStatus: PaymentStatus;
    coverLetter?: string;
    notes?: string;           // Employer ghi chú về ứng viên
    rating?: number;          // Đánh giá sau khi hoàn thành (1-5)
    appliedAt?: any;          // Timestamp ứng tuyển
    createdAt?: any;
    updatedAt?: any;
    // ─── Denormalized candidate snapshot (for fast listing) ───
    candidateName?: string;
    candidateAvatar?: string;
    candidateSkills?: string[];
    candidateRating?: number;
    candidateVerified?: boolean;
    // ─── Denormalized job/shift info ───
    jobTitle?: string;
    shiftTime?: string;
}

/**
 * Canonical Firestore document shape for applications (snake_case).
 */
export interface ApplicationDoc {
    job_id: string;
    shift_id: string;
    employer_id: string;
    candidate_id: string;
    status: ApplicationStatus;
    payment_status?: PaymentStatus;
    cover_letter?: string;
    notes?: string;
    rating?: number;
    idempotency_key?: string;
    applied_at?: any;
    created_at?: any;
    updated_at?: any;
    // ─── Denormalized candidate snapshot ───
    candidate_name?: string;
    candidate_avatar?: string;
    candidate_skills?: string[];
    candidate_rating?: number;
    candidate_verified?: boolean;
    // ─── Denormalized job/shift info ───
    job_title?: string;
    shift_time?: string;
}

export interface ApplyJobInput {
    jobId: string;
    shiftId: string;
    candidateId: string;
    coverLetter?: string;
    idempotencyKey: string;
}

export interface ApplyJobResult {
    applicationId: string;
    status: ApplicationStatus;
    remainingSlots?: number;
}

export interface ApplyPrecheckResult {
    canApply: boolean;
    reasons: string[];
    profileCompleteness: number;
    requiresEkyc: boolean;
}

export interface WithdrawApplicationInput {
    applicationId: string;
    candidateId: string;
}

export interface MyApplicationsFilters {
    candidateId: string;
    statuses?: ApplicationStatus[];
    limit?: number;
    cursor?: string;
}

export interface MyApplicationsPage {
    items: Application[];
    nextCursor?: string;
}

export interface CheckInInput {
    applicationId: string;
    candidateId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    qrPayload?: string;
}

export interface CheckInResult {
    checkinId: string;
    status: 'CHECKED_IN' | 'VERIFIED';
    method: 'GPS' | 'QR';
    distanceMeters?: number;
}

export interface CheckOutInput {
    applicationId: string;
    candidateId: string;
}

export interface RatingInput {
    applicationId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
}

export interface RatingResult {
    reviewId: string;
    updatedReputationScore: number;
}

export type ConversationStatus = 'PENDING' | 'ACTIVE' | 'CLOSED' | 'BLOCKED';
export type ChatPermission = 'NONE' | 'EMPLOYER_ONLY' | 'TWO_WAY';
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'QUICK_REPLY';

export interface Conversation {
    id: string;
    jobId: string;
    applicationId: string;
    candidateId: string;
    employerId: string;
    status: ConversationStatus;
    chatPermission: ChatPermission;
    lastMessageText?: string;
    lastMessageAt?: any;
    lastMessageBy?: string;
    candidateUnreadCount: number;
    employerUnreadCount: number;
    createdAt?: any;
    updatedAt?: any;
}

export interface ConversationDoc {
    job_id: string;
    application_id: string;
    candidate_id: string;
    employer_id: string;
    status: ConversationStatus;
    chat_permission: ChatPermission;
    last_message_text?: string;
    last_message_at?: any;
    last_message_by?: string;
    candidate_unread_count?: number;
    employer_unread_count?: number;
    created_at?: any;
    updated_at?: any;
}

export interface Message {
    id: string;
    conversationId: string;
    applicationId: string;
    senderId: string;
    senderRole: 'CANDIDATE' | 'EMPLOYER' | 'SYSTEM';
    messageType: MessageType;
    text: string;
    clientMessageId?: string;
    createdAt?: any;
}

export interface MessageDoc {
    conversation_id: string;
    application_id: string;
    sender_id: string;
    sender_role: 'CANDIDATE' | 'EMPLOYER' | 'SYSTEM';
    message_type: MessageType;
    text: string;
    client_message_id?: string;
    created_at?: any;
}

export interface ChatSummary {
    conversationId: string;
    applicationId: string;
    jobId: string;
    counterpartId: string;
    status: ConversationStatus;
    chatPermission: ChatPermission;
    lastMessageText?: string;
    lastMessageAt?: any;
    unreadCount: number;
}

export interface StartConversationInput {
    applicationId: string;
}

export interface SendMessageInput {
    conversationId?: string;
    applicationId?: string;
    text: string;
    clientMessageId: string;
}

export interface ListConversationsParams {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
    limit?: number;
}

export interface ListMessagesParams {
    conversationId: string;
    limit?: number;
}
