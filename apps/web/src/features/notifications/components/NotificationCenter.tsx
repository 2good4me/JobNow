import { useState } from 'react';
import {
    UserPlus, UserCheck, UserX, Briefcase, Clock, Wallet, Shield,
    Megaphone, Bell, Check
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
    useFilteredNotifications,
    useMarkNotificationRead,
    useMarkAllRead,
} from '@/features/notifications/hooks/useNotifications';
import { useNavigate } from '@tanstack/react-router';
import {
    type AppNotification,
    type NotificationType,
    type NotificationCategory,
    CATEGORY_LABELS,
} from '@/features/notifications/services/notificationService';

/* ── Icon + Color mapping ──────────────────────── */

interface IconStyle {
    icon: React.ElementType;
    bg: string;
    color: string;
}

function getIconStyle(type: NotificationType): IconStyle {
    switch (type) {
        case 'NEW_APPLICATION':
            return { icon: UserPlus, bg: 'bg-blue-100', color: 'text-blue-600' };
        case 'APPLICATION_APPROVED':
            return { icon: UserCheck, bg: 'bg-blue-100', color: 'text-blue-600' };
        case 'APPLICATION_REJECTED':
            return { icon: UserX, bg: 'bg-rose-100', color: 'text-rose-600' };
        case 'APPLICATION_UPDATE':
            return { icon: UserCheck, bg: 'bg-blue-100', color: 'text-blue-600' };
        case 'JOB_EXPIRING':
        case 'JOB_CLOSED':
        case 'JOB_RECOMMENDATION':
            return { icon: Briefcase, bg: 'bg-indigo-100', color: 'text-indigo-600' };
        case 'SHIFT_REMINDER':
        case 'SHIFT_CHECKIN':
            return { icon: Clock, bg: 'bg-emerald-100', color: 'text-emerald-600' };
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRM_REQUIRED':
        case 'PAYMENT_REMINDER':
        case 'PAYMENT':
            return { icon: Wallet, bg: 'bg-amber-100', color: 'text-amber-600' };
        case 'VERIFICATION_UPDATE':
            return { icon: Shield, bg: 'bg-slate-100', color: 'text-slate-600' };
        case 'SYSTEM_ANNOUNCEMENT':
            return { icon: Megaphone, bg: 'bg-slate-100', color: 'text-slate-600' };
        default:
            return { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-600' };
    }
}

/* ── Time formatting ───────────────────────────── */

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}

/* ── Filter tabs ───────────────────────────────── */

type FilterTab = 'ALL' | NotificationCategory;

const TABS: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'APPLICATION', label: CATEGORY_LABELS.APPLICATION },
    { key: 'JOB', label: CATEGORY_LABELS.JOB },
    { key: 'SHIFT', label: CATEGORY_LABELS.SHIFT },
    { key: 'PAYMENT', label: CATEGORY_LABELS.PAYMENT },
    { key: 'SYSTEM', label: CATEGORY_LABELS.SYSTEM },
];

/* ── Notification Item ─────────────────────────── */

function NotificationItem({
    notification,
    onClick,
}: {
    notification: AppNotification;
    onClick: (n: AppNotification) => void;
}) {
    const { icon: Icon, bg, color } = getIconStyle(notification.type);
    const isUnread = !notification.isRead;

    return (
        <button
            onClick={() => onClick(notification)}
            className={`w-full flex gap-4 px-5 py-4 text-left transition-colors cursor-pointer active:bg-slate-100
                ${isUnread ? 'bg-sky-50/60' : 'bg-white hover:bg-slate-50'}
            `}
        >
            {/* Icon */}
            <div className={`shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <p className={`text-[15px] leading-snug line-clamp-2 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {notification.title}
                    </p>
                    {isUnread && (
                        <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-sky-500 mt-1.5" />
                    )}
                </div>
                {notification.body && (
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                        {notification.body}
                    </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                </p>
            </div>
        </button>
    );
}

/* ── Main Component ────────────────────────────── */

export function NotificationCenter() {
    const { userProfile, role } = useAuth();
    const userId = userProfile?.uid;
    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

    const { data: notifications, isLoading, unreadCount, allData } = useFilteredNotifications(userId, activeTab);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllRead();
    const navigate = useNavigate();

    const handleNotificationClick = (n: AppNotification) => {
        // 1. Mark as read if unread
        if (!n.isRead) {
            markRead.mutate(n.id);
        }

        // 2. Navigate based on type, role and data
        const data = n.data || {};
        const { applicationId, jobId } = data;

        // --- Employer flows ---
        if (role === 'EMPLOYER') {
            if (n.type === 'NEW_APPLICATION' || jobId) {
                navigate({ 
                    to: '/employer/applicants' as any, 
                    search: { jobId } 
                } as any);
                return;
            }
            
            // Other employer routes can be added here
        }

        // --- Candidate flows (Default) ---
        if (n.type === 'APPLICATION_APPROVED' || 
            n.type === 'APPLICATION_REJECTED' || 
            n.type === 'APPLICATION_UPDATE' ||
            n.type === 'PAYMENT_RECEIVED' ||
            n.type === 'PAYMENT_CONFIRM_REQUIRED' ||
            n.category === 'SHIFT' ||
            n.category === 'PAYMENT' ||
            n.category === 'APPLICATION') {
            
            if (applicationId) {
                navigate({ 
                    to: '/candidate/applications/$applicationId' as any, 
                    params: { applicationId } 
                } as any);
                return;
            }
        }

        // Default or fallbacks
        if (n.category === 'SYSTEM') {
             // Maybe go to profile or home
        }
    };

    const handleMarkAllRead = () => {
        if (userId && unreadCount > 0) {
            markAllRead.mutate(userId);
        }
    };

    const totalUnread = (allData ?? []).filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-white pb-28 flex flex-col">

            {/* ── Header ───────────────────────── */}
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-900">Thông báo</h1>
                {totalUnread > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllRead.isPending}
                        className="text-sm font-semibold text-sky-700 hover:text-sky-800 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        Đánh dấu đã đọc
                    </button>
                )}
            </header>

            {/* ── Filter Tabs ──────────────────── */}
            <div className="px-5 py-3 overflow-x-auto no-scrollbar flex gap-2 border-b border-slate-50">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer
                            ${activeTab === tab.key
                                ? 'bg-sky-700 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Notification List ─────────────── */}
            <main className="flex-1">
                {isLoading ? (
                    /* Loading skeleton */
                    <div className="animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex gap-4 px-5 py-4 border-b border-slate-50">
                                <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-slate-100 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                                    <div className="h-3 w-20 bg-slate-50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                            <Bell className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="font-semibold text-slate-700 text-base mb-1">Chưa có thông báo</p>
                        <p className="text-slate-400 text-sm text-center max-w-xs">
                            {activeTab === 'ALL'
                                ? 'Các thông báo về ứng tuyển, ca làm và thanh toán sẽ xuất hiện ở đây.'
                                : `Không có thông báo nào trong mục "${TABS.find(t => t.key === activeTab)?.label}".`
                            }
                        </p>
                    </div>
                ) : (
                    /* Notification items */
                    <div className="divide-y divide-slate-100">
                        {notifications.map(notification => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={handleNotificationClick}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
