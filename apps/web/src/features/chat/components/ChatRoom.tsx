import React, { useRef, useState, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import type { Conversation } from '@jobnow/types';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { markConversationRead } from '../services/chatService';
import { MessageBubble } from './MessageBubble';

interface ChatRoomProps {
    conversation: Conversation;
    currentUserId: string;
    onBack: () => void;
}

export function ChatRoom({ conversation, currentUserId, onBack }: ChatRoomProps) {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: messages, isLoading } = useMessages({
        conversationId: conversation.id,
        limit: 50
    });

    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    useEffect(() => {
        // Mark as read when entering or when messages change
        markConversationRead(conversation.id).catch(console.error);
    }, [conversation.id, messages?.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isSending) return;

        const messageText = inputText.trim();
        setInputText(''); // Optimistic clear

        // Generate a temporary client ID
        const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        sendMessage(
            {
                conversationId: conversation.id,
                applicationId: conversation.applicationId,
                text: messageText,
                clientMessageId,
            },
            {
                onError: () => {
                    setInputText(messageText); // Restore on error
                }
            }
        );
    };

    const isEmployer = conversation.employerId === currentUserId;
    const title = isEmployer ? 'Ứng viên' : 'Nhà tuyển dụng';

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 w-full">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-semibold border border-white/50 mr-3">
                    {title.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <h2 className="font-semibold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h2>
                    <span className="text-xs text-blue-500 font-medium">Đang hoạt động</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoading ? (
                    <div className="flex flex-col space-y-4">
                        {[1, 2].map((i) => (
                            <div key={`sk-left-${i}`} className="flex w-full justify-start animate-pulse">
                                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-2xl rounded-tl-sm w-48"></div>
                            </div>
                        ))}
                        <div className="flex w-full justify-end animate-pulse">
                            <div className="h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl rounded-tr-sm w-32"></div>
                        </div>
                    </div>
                ) : !messages || messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">👋</span>
                        </div>
                        <p className="font-medium">Bắt đầu cuộc trò chuyện!</p>
                        <p className="text-sm mt-1">Gửi tin nhắn đầu tiên để kết nối.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isCurrentUser = msg.senderId === currentUserId;
                        const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                        return (
                            <MessageBubble
                                key={msg.id || msg.clientMessageId || idx}
                                message={msg}
                                isCurrentUser={isCurrentUser}
                                showAvatar={showAvatar}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 mb-safe">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-2 relative">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={isSending}
                            className="w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-3xl py-3 pl-4 pr-12 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className={`p-3 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${inputText.trim() && !isSending
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                            }`}
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
}
