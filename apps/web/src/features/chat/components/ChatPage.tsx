import { useState, useEffect, useRef } from 'react';
import type { Conversation } from '@jobnow/types';
import { ChatList } from './ChatList';
import { ChatRoom } from './ChatRoom';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useConversations } from '../hooks/useConversations';

interface ChatPageProps {
    userId: string;
    role: 'CANDIDATE' | 'EMPLOYER';
}

export function ChatPage({ userId, role }: ChatPageProps) {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as { applicationId?: string; jobId?: string; employerId?: string };
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to track the last ID we attempted to initialize to avoid redundant calls or loops
    const initialInitRef = useRef<string | null>(null);
    const queryResult = useConversations({ userId, role });
    const conversations = queryResult.data;

    // Auto-select or initialize conversation based on applicationId, jobId or employerId in URL
    useEffect(() => {
        let isAborted = false;

        const initChat = async () => {
            if (!search.applicationId && !search.jobId && !search.employerId) return;
            
            // Wait for conversations to load
            if (!conversations || (conversations.length === 0 && queryResult.isLoading)) return;

            const currentKey = `${search.applicationId || ''}-${search.jobId || ''}-${search.employerId || ''}`;
            if (initialInitRef.current === currentKey) {
                // If we're already selected something matching this key, we're done
                if (selectedConversation) {
                    const isAppMatch = search.applicationId && (selectedConversation.id === search.applicationId || selectedConversation.applicationId === search.applicationId);
                    const isJobMatch = search.jobId && selectedConversation.jobId === search.jobId;
                    const isEmployerMatch = search.employerId && selectedConversation.employerId === search.employerId;
                    if (isAppMatch || isJobMatch || isEmployerMatch) return;
                }
            }

            // Check if already selected matches
            if (selectedConversation) {
                const isAppMatch = search.applicationId && (selectedConversation.id === search.applicationId || selectedConversation.applicationId === search.applicationId);
                const isJobMatch = search.jobId && selectedConversation.jobId === search.jobId;
                const isEmployerMatch = search.employerId && selectedConversation.employerId === search.employerId;
                if (isAppMatch || isJobMatch || isEmployerMatch) {
                   initialInitRef.current = currentKey; // Mark as done for this key
                   return;
                }
            }

            // 1. Try to find in existing list
            let found: Conversation | undefined;
            if (search.applicationId) {
                found = conversations.find(c => c.id === search.applicationId || c.applicationId === search.applicationId);
            } 
            if (!found && search.jobId) {
                found = conversations.find(c => c.jobId === search.jobId);
            }
            if (!found && search.employerId) {
                // Find most recent conversation with this employer that MIGHT not have a jobId (general chat)
                // or just the latest one
                found = conversations.find(c => c.employerId === search.employerId);
            }

             if (found) {
                console.log(`[ChatPage] Found conversation for ${currentKey} in current list.`);
                initialInitRef.current = currentKey;
                setSelectedConversation(found);
                // Clear search params to avoid re-triggering this logic on back/refresh
                navigate({ search: {} as any, replace: true });
                return;
            }

            // 2. Start it
            try {
                initialInitRef.current = currentKey;
                setIsStarting(true);
                setError(null);
                
                const { startConversation, getConversationById } = await import('../services/chatService');
                const result = await startConversation({
                    applicationId: search.applicationId,
                    jobId: search.jobId,
                    employerId: search.employerId
                });
                
                if (isAborted) return;

                const conv = await getConversationById(result.conversationId);
                if (conv && !isAborted) {
                    setSelectedConversation(conv);
                    navigate({ search: {} as any, replace: true });
                } else if (!isAborted) {
                    throw new Error('Đã khởi tạo hội thoại nhưng không thể tải dữ liệu chi tiết.');
                }
            } catch (err: any) {
                console.error('Failed to start conversation:', err);
                if (!isAborted) {
                    setError(err.message || 'Không thể bắt đầu trò chuyện.');
                }
                initialInitRef.current = null; // Allow retry
            } finally {
                setIsStarting(false);
            }
        };

        const timer = setTimeout(initChat, 100); // 100ms debounce
        return () => {
            isAborted = true;
            clearTimeout(timer);
        };
    }, [search.applicationId, search.jobId, search.employerId, conversations, queryResult.isLoading, navigate, selectedConversation]);

    return (
        <div className="flex h-[calc(100dvh-64px)] md:h-[calc(100dvh-70px)] bg-white dark:bg-gray-950 overflow-hidden relative">
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
                    <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-8 text-center" style={{ zIndex: 50 }}>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Lỗi khởi tạo</h3>
                        <p className="max-w-xs">{error}</p>
                        <button 
                            onClick={() => {
                                initialInitRef.current = null;
                                window.location.reload();
                            }}
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
