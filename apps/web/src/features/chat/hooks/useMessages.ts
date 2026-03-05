import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@jobnow/types';
import { listMessages, subscribeMessages } from '../services/chatService';

interface UseMessagesInput {
  conversationId: string | undefined;
  limit?: number;
}

export function useMessages({ conversationId, limit = 50 }: UseMessagesInput) {
  const queryClient = useQueryClient();

  const queryResult = useQuery<Message[]>({
    queryKey: ['chat', 'messages', conversationId, limit],
    queryFn: async () => {
      if (!conversationId) return [];
      return listMessages({ conversationId, limit });
    },
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!conversationId) return undefined;

    const unsubscribe = subscribeMessages({ conversationId, limit }, (items) => {
      queryClient.setQueryData(['chat', 'messages', conversationId, limit], items);
    });

    return () => unsubscribe();
  }, [conversationId, limit, queryClient]);

  return queryResult;
}
