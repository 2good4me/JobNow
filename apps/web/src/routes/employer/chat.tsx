import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MessageCircleMore, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useMessages } from '@/features/chat/hooks/useMessages';
import { useSendMessage } from '@/features/chat/hooks/useSendMessage';
import { useEnsureConversation } from '@/features/chat/hooks/useEnsureConversation';
import { getConversationUnreadCount, markConversationRead } from '@/features/chat/services/chatService';

export const Route = createFileRoute('/employer/chat')({
  validateSearch: (search: Record<string, unknown>) => {
    const parsed: { applicationId?: string; conversationId?: string } = {};
    if (typeof search.applicationId === 'string') parsed.applicationId = search.applicationId;
    if (typeof search.conversationId === 'string') parsed.conversationId = search.conversationId;
    return parsed;
  },
  component: EmployerChatRoute,
});

function formatMessageTime(value: unknown): string {
  const date = typeof value === 'object' && value && 'toDate' in (value as { toDate?: () => Date })
    ? (value as { toDate: () => Date }).toDate()
    : value instanceof Date
      ? value
      : null;

  if (!date) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function EmployerChatRoute() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { applicationId, conversationId } = Route.useSearch();
  const userId = userProfile?.uid;

  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(conversationId);
  const [messageText, setMessageText] = useState('');
  const [lastEnsuredApplicationId, setLastEnsuredApplicationId] = useState<string | undefined>();

  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations({
    userId,
    role: 'EMPLOYER',
    limit: 30,
  });
  const ensureConversationMutation = useEnsureConversation();
  const sendMessageMutation = useSendMessage();

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const { data: messages = [], isLoading: isLoadingMessages } = useMessages({
    conversationId: selectedConversationId,
    limit: 50,
  });

  useEffect(() => {
    setSelectedConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (selectedConversationId || conversations.length === 0) return;
    const firstConversationId = conversations[0].id;
    setSelectedConversationId(firstConversationId);
    void navigate({
      to: '/employer/chat',
      search: {
        conversationId: firstConversationId,
        applicationId: conversations[0].applicationId,
      },
      replace: true,
    });
  }, [conversations, navigate, selectedConversationId]);

  useEffect(() => {
    if (!applicationId || lastEnsuredApplicationId === applicationId) return;

    let cancelled = false;
    const ensure = async () => {
      try {
        const conversation = await ensureConversationMutation.mutateAsync(applicationId);
        if (cancelled) return;

        setLastEnsuredApplicationId(applicationId);
        setSelectedConversationId(conversation.id);
        await navigate({
          to: '/employer/chat',
          search: {
            applicationId,
            conversationId: conversation.id,
          },
          replace: true,
        });
      } catch {
        if (!cancelled) {
          setLastEnsuredApplicationId(applicationId);
        }
      }
    };

    void ensure();

    return () => {
      cancelled = true;
    };
  }, [applicationId, ensureConversationMutation, lastEnsuredApplicationId, navigate]);

  useEffect(() => {
    if (!selectedConversationId) return;
    void markConversationRead(selectedConversationId).catch(() => undefined);
  }, [selectedConversationId]);

  const canSendMessage = Boolean(
    selectedConversation &&
    selectedConversation.status !== 'BLOCKED' &&
    selectedConversation.status !== 'CLOSED' &&
    selectedConversation.chatPermission !== 'NONE'
  );

  const handleSendMessage = async () => {
    if (!userId || !selectedConversationId) return;

    const text = messageText.trim();
    if (!text) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        applicationId: selectedConversation?.applicationId,
        text,
        clientMessageId: `${userId}_${Date.now()}`,
      });
      setMessageText('');
    } catch {
      // Error UI is shown below.
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Tin nhắn với ứng viên</h1>

        {ensureConversationMutation.isPending && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-700">
            Đang mở hội thoại cho đơn ứng tuyển...
          </div>
        )}

        <section className="rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Hộp thư tuyển dụng</p>
          </div>

          {isLoadingConversations ? (
            <div className="p-4 text-sm text-slate-500">Đang tải danh sách hội thoại...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircleMore className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">Chưa có hội thoại</p>
              <p className="text-xs text-slate-400 mt-1">Mở danh sách ứng viên và bấm Chat để bắt đầu trao đổi.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;
                const unreadCount = getConversationUnreadCount(conversation, 'EMPLOYER');

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      void navigate({
                        to: '/employer/chat',
                        search: {
                          conversationId: conversation.id,
                          applicationId: conversation.applicationId,
                        },
                        replace: true,
                      });
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Đơn #{conversation.applicationId.slice(0, 8)}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{conversation.lastMessageText || 'Chưa có tin nhắn'}</p>
                      </div>
                      <div className="text-right">
                        {unreadCount > 0 && (
                          <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">{formatMessageTime(conversation.lastMessageAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Đoạn chat</p>
            {selectedConversation && (
              <p className="text-xs text-slate-500 mt-1">
                Đơn #{selectedConversation.applicationId.slice(0, 8)} • {selectedConversation.status}
              </p>
            )}
          </div>

          {!selectedConversationId ? (
            <div className="p-6 text-sm text-slate-500">Chọn một hội thoại để xem tin nhắn.</div>
          ) : (
            <>
              <div className="max-h-[360px] overflow-y-auto p-4 space-y-2 bg-slate-50/60">
                {isLoadingMessages ? (
                  <p className="text-sm text-slate-500">Đang tải tin nhắn...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có tin nhắn nào.</p>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === userId;

                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                          <p className={`mt-1 text-[10px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-100 p-3 bg-white">
                {!canSendMessage ? (
                  <p className="text-xs text-amber-600">Hội thoại này đã bị khóa hoặc chưa đủ điều kiện gửi tin nhắn.</p>
                ) : (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      rows={2}
                      placeholder="Nhập nội dung trao đổi..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !messageText.trim()}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:bg-slate-200 disabled:text-slate-400"
                      aria-label="Gửi tin nhắn"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {sendMessageMutation.isError && (
                  <p className="mt-2 text-xs text-rose-600">Gửi tin nhắn thất bại. Vui lòng thử lại.</p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
