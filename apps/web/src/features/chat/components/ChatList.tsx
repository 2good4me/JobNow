import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useConversations } from '../hooks/useConversations';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '@jobnow/types';
import { getConversationUnreadCount } from '../services/chatService';

import { useUserProfile } from '../hooks/useUserProfile';
import { useState } from 'react';

function ChatAvatar({ avatar, displayName, isSelected }: { avatar?: string | null; displayName: string; isSelected: boolean }) {
    const [imgError, setImgError] = useState(false);
    const hasAvatar = avatar && avatar !== 'not found' && !imgError;

    return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${isSelected ? 'bg-blue-600' : 'bg-slate-700'}`}>
            {hasAvatar ? (
                <img 
                    src={avatar} 
                    alt={displayName} 
                    className="w-full h-full rounded-full object-cover" 
                    onError={() => setImgError(true)}
                />
            ) : (
                displayName.charAt(0).toUpperCase()
            )}
        </div>
    );
}

interface ChatListProps {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
    onSelectConversation: (conversation: Conversation) => void;
    selectedConversationId?: string;
}

function ChatListItem({ 
    conversation, 
    role, 
    onSelectConversation, 
    isSelected 
}: { 
    conversation: Conversation; 
    role: 'CANDIDATE' | 'EMPLOYER'; 
    onSelectConversation: (conversation: Conversation) => void; 
    isSelected: boolean;
}) {
    const isCandidate = role === 'CANDIDATE';
    const participantId = isCandidate ? conversation.employerId : conversation.candidateId;
    const { data: profile } = useUserProfile(participantId);

    const lastMessageAt = conversation.lastMessageAt
        ? (typeof conversation.lastMessageAt === 'string'
            ? new Date(conversation.lastMessageAt)
            : (conversation.lastMessageAt as any).toDate?.() || new Date())
        : null;

    const displayName = profile?.fullName || (isCandidate
        ? (conversation.employerName || 'Nhà tuyển dụng')
        : (conversation.candidateName || 'Ứng viên'));
    const avatar = profile?.avatarUrl || (isCandidate ? conversation.employerAvatar : conversation.candidateAvatar);
    const unreadCount = getConversationUnreadCount(conversation, role);
    const subtitle = conversation.lastMessageText || 'Chưa có tin nhắn...';

    return (
        <div
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 flex items-center cursor-pointer transition-all duration-200 border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${isSelected ? 'bg-blue-50/80 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-100 dark:ring-blue-900/30 shadow-sm' : ''
                }`}
        >
            <div className="relative group">
                <ChatAvatar avatar={avatar} displayName={displayName} isSelected={isSelected} />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1 border-2 border-white shadow-sm transition-transform scale-100 animate-in zoom-in">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                )}
            </div>

            <div className="flex-1 ml-4 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm truncate pr-2 transition-colors ${unreadCount > 0 ? 'font-bold text-gray-950 dark:text-white' : 'font-medium text-gray-900 dark:text-gray-100'
                        }`}>
                        {displayName}
                    </h4>
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
        </div>
    );
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
            {conversations.map((conversation) => (
                <ChatListItem
                    key={conversation.id}
                    conversation={conversation}
                    role={role}
                    onSelectConversation={onSelectConversation}
                    isSelected={selectedConversationId === conversation.id}
                />
            ))}
        </div>
    );
}

