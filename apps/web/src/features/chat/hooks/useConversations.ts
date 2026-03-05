import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Conversation } from '@jobnow/types';
import {
  getConversationUnreadCount,
  listConversations,
  subscribeConversations,
} from '../services/chatService';

interface UseConversationsInput {
  userId: string | undefined;
  role: 'CANDIDATE' | 'EMPLOYER' | undefined;
  limit?: number;
}

export function useConversations({ userId, role, limit = 20 }: UseConversationsInput) {
  const queryClient = useQueryClient();

  const queryResult = useQuery<Conversation[]>({
    queryKey: ['chat', 'conversations', userId, role, limit],
    queryFn: async () => {
      if (!userId || !role) return [];
      return listConversations({ userId, role, limit });
    },
    enabled: Boolean(userId && role),
  });

  useEffect(() => {
    if (!userId || !role) return undefined;

    const unsubscribe = subscribeConversations({ userId, role, limit }, (items) => {
      queryClient.setQueryData(['chat', 'conversations', userId, role, limit], items);
    });

    return () => unsubscribe();
  }, [userId, role, limit, queryClient]);

  const unreadCount = useMemo(() => {
    if (!role) return 0;
    const items = queryResult.data ?? [];
    return items.reduce((sum, item) => sum + getConversationUnreadCount(item, role), 0);
  }, [queryResult.data, role]);

  return {
    ...queryResult,
    unreadCount,
  };
}
