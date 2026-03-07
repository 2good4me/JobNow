import React, { useState } from 'react';
import type { Conversation } from '@jobnow/types';
import { ChatList } from './ChatList';
import { ChatRoom } from './ChatRoom';

interface ChatPageProps {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
}

export function ChatPage({ userId, role }: ChatPageProps) {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-70px)] bg-white dark:bg-gray-950 overflow-hidden relative">
            {/* Mobile view changes based on selection */}
            <div
                className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950 absolute md:static inset-0 z-10 transition-transform duration-300 ${selectedConversation ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
                    }`}
            >
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-gray-100">
                        Tin nhắn
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Trao đổi trực tiếp công việc của bạn
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <ChatList
                        userId={userId}
                        role={role}
                        onSelectConversation={setSelectedConversation}
                        selectedConversationId={selectedConversation?.id}
                    />
                </div>
            </div>

            <div
                className={`w-full md:w-2/3 lg:w-3/4 flex flex-col bg-gray-50/50 dark:bg-gray-900/30 absolute md:static inset-0 z-20 transition-transform duration-300 pattern-isometric pattern-blue-500/5 pattern-size-4 ${selectedConversation ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
                    }`}
            >
                {selectedConversation ? (
                    <ChatRoom
                        conversation={selectedConversation}
                        currentUserId={userId}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400">
                        <div className="w-24 h-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full flex items-center justify-center shadow-sm mb-6 pb-2">
                            <span className="text-4xl translate-y-2">💬</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Chào mừng đến với JobNow Chat
                        </h2>
                        <p className="max-w-md text-center">
                            Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu trò chuyện mới từ trang chi tiết tin tuyển dụng.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
