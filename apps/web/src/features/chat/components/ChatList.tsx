import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useConversations } from '../hooks/useConversations';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '@jobnow/types';
import { getConversationUnreadCount } from '../services/chatService';

interface ChatListProps {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
    onSelectConversation: (conversation: Conversation) => void;
    selectedConversationId?: string;
}

export function ChatList({ userId, role, onSelectConversation, selectedConversationId }: ChatListProps) {
    const { data: conversations, isLoading, isError } = useConversations({ userId, role });

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200/50 rounded-full dark:bg-gray-700/50" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200/50 rounded w-3/4 dark:bg-gray-700/50" />
                            <div className="h-3 bg-gray-200/50 rounded w-1/2 dark:bg-gray-700/50" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-center text-red-500">
                Đã có lỗi xảy ra khi tải danh sách hội thoại.
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 min-h-[50vh]">
                <div className="w-16 h-16 mb-4 rounded-full bg-blue-50/50 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-blue-400" />
                </div>
                <p className="font-medium">Chưa có cuộc trò chuyện nào</p>
                <p className="text-sm text-gray-400 mt-1 text-center">
                    Khi có tin nhắn mới, chúng sẽ xuất hiện ở đây.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {conversations.map((conversation) => {
                const unreadCount = getConversationUnreadCount(conversation, role);
                const isActive = conversation.id === selectedConversationId;
                const lastMessageAt = conversation.lastMessageAt
                    ? (typeof conversation.lastMessageAt === 'string'
                        ? new Date(conversation.lastMessageAt)
                        : (conversation.lastMessageAt as any).toDate?.() || new Date())
                    : null;

                // Determine title based on role. We don't have user profiles joined here yet,
                // so we'll use a generic title or IDs for now. In a real app, you'd join with the user profile.
                const title = role === 'CANDIDATE' ? 'Nhà tuyển dụng' : 'Ứng viên';
                const subtitle = conversation.lastMessageText || 'Chưa có tin nhắn...';

                return (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`flex items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 text-left w-full ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold text-lg border border-white/50 shadow-sm">
                                {title.charAt(0)}
                            </div>
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1 border-2 border-white shadow-sm transition-transform scale-100 animate-in zoom-in">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate pr-2 ${unreadCount > 0 ? 'font-bold text-black' : ''}`}>
                                    {title}
                                </h3>
                                {lastMessageAt && (
                                    <span className={`text-xs whitespace-nowrap ${unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                        {formatDistanceToNowStrict(lastMessageAt, { addSuffix: false, locale: vi })}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                {subtitle}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
