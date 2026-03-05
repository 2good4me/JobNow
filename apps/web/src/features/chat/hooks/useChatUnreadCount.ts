import { useConversations } from './useConversations';

export function useChatUnreadCount(userId: string | undefined, role: 'CANDIDATE' | 'EMPLOYER' | undefined) {
  const { unreadCount } = useConversations({ userId, role, limit: 30 });
  return unreadCount;
}
