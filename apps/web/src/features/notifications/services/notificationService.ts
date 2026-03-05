import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface AppNotification {
    id: string;
    userId: string;
    type: 'NEW_APPLICATION' | 'APPLICATION_UPDATE' | 'PAYMENT' | 'SYSTEM';
    title: string;
    body: string;
    data?: Record<string, string>;
    isRead: boolean;
    createdAt: Date;
}

/**
 * Fetch notifications for a user, ordered by newest first.
 */
export async function fetchNotifications(userId: string, pageSize = 20): Promise<AppNotification[]> {
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

/**
 * Subscribe to real-time notification updates.
 */
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

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
}

/**
 * Mark all unread notifications as read for a user.
 */
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
    const d = docSnap.data();
    return {
        id: docSnap.id,
        userId: d.userId,
        type: d.type || 'SYSTEM',
        title: d.title || '',
        body: d.body || '',
        data: d.data || {},
        isRead: d.isRead ?? false,
        createdAt: d.created_at?.toDate?.() ?? new Date(),
    };
}
