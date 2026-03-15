import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Message, Conversation } from '@jobnow/types';
import { useNavigate } from '@tanstack/react-router';

interface MessageBubbleProps {
    message: Message;
    conversation: Conversation;
    isCurrentUser: boolean;
    showAvatar?: boolean;
}

export function MessageBubble({ message, conversation, isCurrentUser, showAvatar = false }: MessageBubbleProps) {
    const navigate = useNavigate();
    const createdAt = message.createdAt
        ? (typeof message.createdAt === 'string'
            ? new Date(message.createdAt)
            : (message.createdAt as any).toDate?.() || new Date())
        : new Date();

    const avatar = message.senderRole === 'EMPLOYER' ? conversation.employerAvatar : conversation.candidateAvatar;
    const displayName = message.senderRole === 'EMPLOYER' ? conversation.employerName : conversation.candidateName;

    const handleNavigateToProfile = () => {
        if (message.senderRole === 'EMPLOYER') {
            navigate({ to: `/candidate/employer/${conversation.employerId}` as any });
        } else {
            navigate({ to: `/employer/candidate/${conversation.candidateId}` as any });
        }
    };

    return (
        <div className={`flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {!isCurrentUser && showAvatar && (
                <div 
                    className="w-8 h-8 rounded-full bg-slate-100 mr-2 flex-shrink-0 flex items-center justify-center text-slate-600 font-semibold text-xs border border-white/50 shadow-sm mt-auto mb-1 overflow-hidden cursor-pointer"
                    onClick={handleNavigateToProfile}
                >
                    {avatar ? (
                        <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        displayName?.charAt(0).toUpperCase() || (message.senderRole === 'EMPLOYER' ? 'N' : 'Ư')
                    )}
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${!isCurrentUser && !showAvatar ? 'ml-10' : ''}`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${isCurrentUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                        }`}
                    style={{
                        wordBreak: 'break-word',
                    }}
                >
                    {message.text}
                </div>
                <span
                    className={`text-[11px] text-gray-400 mt-1 ${isCurrentUser ? 'text-right mr-1' : 'text-left ml-1'
                        }`}
                >
                    {format(createdAt, 'HH:mm', { locale: vi })}
                </span>
            </div>
        </div>
    );
}

