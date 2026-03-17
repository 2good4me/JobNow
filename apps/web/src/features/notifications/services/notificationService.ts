import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, setDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';

/* ── Notification Types ────────────────────────── */

export type NotificationType =
    // Application
    | 'NEW_APPLICATION'
    | 'APPLICATION_APPROVED'
    | 'APPLICATION_REJECTED'
    | 'NEW_FOLLOWER'
    | 'JOB_EXPIRING'
    | 'JOB_CLOSED'
    | 'JOB_RECOMMENDATION'
    // Shift
    | 'SHIFT_REMINDER'
    | 'SHIFT_CHECKIN'
    // Payment
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_CONFIRM_REQUIRED'
    | 'PAYMENT_REMINDER'
    // System
    | 'VERIFICATION_UPDATE'
    | 'SYSTEM_ANNOUNCEMENT'
    // Legacy fallback
    | 'APPLICATION_APPROVED'
    | 'APPLICATION_REJECTED'
    | 'APPLICATION_UPDATE'
    | 'PAYMENT'
    | 'SYSTEM';

export type NotificationCategory =
    | 'APPLICATION'
    | 'JOB'
    | 'SHIFT'
    | 'PAYMENT'
    | 'SYSTEM';

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
    APPLICATION: 'Ứng tuyển',
    JOB: 'Việc làm',
    SHIFT: 'Ca làm',
    PAYMENT: 'Thanh toán',
    SYSTEM: 'Hệ thống',
};

/** Map notification type → category */
export function getNotificationCategory(type: NotificationType): NotificationCategory {
    switch (type) {
        case 'NEW_APPLICATION':
        case 'APPLICATION_APPROVED':
        case 'APPLICATION_REJECTED':
        case 'APPLICATION_UPDATE':
            return 'APPLICATION';
        case 'JOB_EXPIRING':
        case 'JOB_CLOSED':
        case 'JOB_RECOMMENDATION':
            return 'JOB';
        case 'SHIFT_REMINDER':
        case 'SHIFT_CHECKIN':
            return 'SHIFT';
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRM_REQUIRED':
        case 'PAYMENT_REMINDER':
        case 'PAYMENT':
            return 'PAYMENT';
        case 'VERIFICATION_UPDATE':
        case 'SYSTEM_ANNOUNCEMENT':
        case 'SYSTEM':
        default:
            return 'SYSTEM';
    }
}

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    body: string;
    data?: Record<string, string>;
    isRead: boolean;
    createdAt: Date;
}

/* ── Firestore Operations ──────────────────────── */

export async function fetchNotifications(userId: string, pageSize = 50): Promise<AppNotification[]> {
    const notifRef = collection(db, 'notifications');
    const q = query(
        notifRef,
        where('userId', '==', userId),
        orderBy('created_at', 'desc'),
        limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapNotification);
}

export function subscribeToNotifications(
    userId: string,
    onUpdate: (notifications: AppNotification[]) => void
): Unsubscribe {
    const notifRef = collection(db, 'notifications');
    const q = query(
        notifRef,
        where('userId', '==', userId),
        orderBy('created_at', 'desc'),
        limit(50)
    );
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(mapNotification);
        onUpdate(notifications);
    });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
    const notifRef = collection(db, 'notifications');
    const q = query(
        notifRef,
        where('userId', '==', userId),
        where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    const batchPromises = snapshot.docs.map(d => updateDoc(d.ref, { isRead: true }));
    await Promise.all(batchPromises);
}

function mapNotification(docSnap: any): AppNotification {
    const d = docSnap.data({ serverTimestamps: 'estimate' });
    const type: NotificationType = d.type || 'SYSTEM';
    return {
        id: docSnap.id,
        userId: d.userId || d.user_id,
        type,
        category: d.category || getNotificationCategory(type),
        title: d.title || '',
        body: d.body || '',
        data: d.data || {},
        isRead: d.isRead ?? d.is_read ?? false,
        createdAt: d.created_at?.toDate?.() ?? new Date(),
    };
}

/**
 * Add a new notification
 */
export async function addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const notifRef = collection(db, 'notifications');
    const docRef = await setDoc(doc(notifRef), {
        ...notification,
        user_id: notification.userId,
        is_read: false,
        created_at: serverTimestamp()
    });
    return (docRef as any)?.id || '';
}

/* ── Specific Notification Helpers ── */

export async function notifyNewFollower(followerId: string, followerName: string, employerId: string) {
    return addNotification({
        userId: employerId,
        type: 'NEW_FOLLOWER',
        category: 'SYSTEM',
        title: 'Người theo dõi mới',
        body: `${followerName} đã bắt đầu theo dõi bạn.`,
        data: { followerId }
    });
}
