import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
    fetchNotifications,
    subscribeToNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AppNotification,
} from '../services/notificationService';

/**
 * Hook to fetch notifications with optional real-time updates.
 */
export function useNotifications(userId: string | undefined) {
    const queryClient = useQueryClient();
    const [realtimeData, setRealtimeData] = useState<AppNotification[] | null>(null);

    // Initial fetch via React Query
    const queryResult = useQuery<AppNotification[]>({
        queryKey: ['notifications', userId],
        queryFn: () => fetchNotifications(userId!),
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 minute
    });

    // Real-time listener
    useEffect(() => {
        if (!userId) return;
        const unsubscribe = subscribeToNotifications(userId, (data) => {
            setRealtimeData(data);
            // Also update the query cache
            queryClient.setQueryData(['notifications', userId], data);
        });
        return () => unsubscribe();
    }, [userId, queryClient]);

    const notifications = realtimeData ?? queryResult.data ?? [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
        ...queryResult,
        data: notifications,
        unreadCount,
    };
}

/**
 * Hook to get unread notification count (lightweight).
 */
export function useUnreadCount(userId: string | undefined) {
    const { unreadCount } = useNotifications(userId);
    return unreadCount;
}

/**
 * Hook to mark a notification as read.
 */
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Hook to mark all notifications as read.
 */
export function useMarkAllRead() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
