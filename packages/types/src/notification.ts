export type NotificationType =
    | 'NEW_APPLICATION'
    | 'APPLICATION_UPDATE'
    | 'CHECKIN'
    | 'PAYMENT'
    | 'SYSTEM'
    | 'JOB_EXPIRED';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>; // Deep-link metadata (jobId, applicationId, etc.)
    isRead: boolean;
    createdAt?: any;
}
