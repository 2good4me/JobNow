import { useState, useEffect } from 'react';
import type { Conversation } from '@jobnow/types';
import { ChatList } from './ChatList';
import { ChatRoom } from './ChatRoom';
import { useSearch } from '@tanstack/react-router';
import { useConversations } from '../hooks/useConversations';

interface ChatPageProps {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
}

export function ChatPage({ userId, role }: ChatPageProps) {
    const search = useSearch({ strict: false }) as { applicationId?: string; jobId?: string };
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { data: conversations } = useConversations({ userId, role });

    // Auto-select or initialize conversation based on applicationId or jobId in URL
    useEffect(() => {
        const initChat = async () => {
            if (!conversations || isStarting) return;
            
            // 1. Try to find in existing list
            let found: Conversation | undefined;
            if (search.applicationId) {
                found = conversations.find(c => c.id === search.applicationId || c.applicationId === search.applicationId);
            } 
            
            if (!found && search.jobId) {
                found = conversations.find(c => c.jobId === search.jobId);
            }

            // Fallback: If still not found by ID, try finding by participant pair (Unified Chat)
            // Note: We'd need the other party's ID which might require a bit more context, 
            // but usually startConversation will handle the back-end merge.
            // On the front-end, we can at least ensure we don't start a duplicate.

            if (found) {
                if (selectedConversation?.id !== found.id) {
                    setSelectedConversation(found);
                }
                return;
            }

            // 2. If not found but we have params, start it
            if ((search.applicationId || search.jobId) && !selectedConversation) {
                try {
                    setIsStarting(true);
                    setError(null);
                    const { startConversation, getConversationById } = await import('../services/chatService');
                    const { conversationId } = await startConversation({
                        applicationId: search.applicationId,
                        jobId: search.jobId
                    });
                    
                    const conv = await getConversationById(conversationId);
                    if (conv) {
                        setSelectedConversation(conv);
                    } else {
                        throw new Error('Không thể tải thông tin hội thoại sau khi khởi tạo.');
                    }
                } catch (err: any) {
                    console.error('Failed to start conversation:', err);
                    setError(err.message || 'Không thể bắt đầu trò chuyện. Vui lòng thử lại sau.');
                } finally {
                    setIsStarting(false);
                }
            }
        };

        initChat();
    }, [search.applicationId, search.jobId, conversations, isStarting, selectedConversation?.id]);

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
                {isStarting ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-medium text-lg">Đang kết nối...</p>
                        <p className="text-sm text-gray-400 mt-2">Chúng tôi đang chuẩn bị phòng chat cho bạn</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Lỗi khởi tạo</h3>
                        <p className="max-w-xs">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : selectedConversation ? (
                    <ChatRoom
                        conversation={selectedConversation}
                        currentUserId={userId}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-24 h-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full flex items-center justify-center shadow-sm mb-6 pb-2">
                            <span className="text-4xl translate-y-2">💬</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 font-heading">
                            Chào mừng đến với JobNow Chat
                        </h2>
                        <p className="max-w-md text-center text-gray-500">
                            Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu trò chuyện mới từ trang chi tiết tin tuyển dụng.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
