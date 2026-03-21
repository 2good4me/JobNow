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

  const conversations = queryResult.data ?? [];

  // 1. Deduplicate in UI (Group by Participant)
  // This ensures that even if there are legacy duplicates or per-job threads, 
  // the sidebar list only shows ONE entry per person, favoring the most recent.
  const deduplicated = useMemo(() => {
    const map = new Map<string, { conv: Conversation, maxTime: number }>();
    
    const getMs = (date: any) => {
      if (!date) return 0;
      if (typeof date === 'number') return date;
      if (typeof date === 'string') return new Date(date).getTime() || 0;
      if (date && typeof date.toDate === 'function') return date.toDate().getTime();
      if (date && typeof date.seconds === 'number') return date.seconds * 1000;
      return new Date(date).getTime() || 0;
    };

    conversations.forEach((conv) => {
      const participantId = role === 'CANDIDATE' ? conv.employerId : conv.candidateId;
      const key = participantId || conv.id; 
      
      const convTime = Math.max(getMs(conv.lastMessageAt), getMs(conv.updatedAt), getMs(conv.createdAt));
      const existing = map.get(key);
      
      if (!existing || convTime > existing.maxTime) {
        map.set(key, { conv, maxTime: convTime });
      }
    });
    
    return Array.from(map.values())
      .sort((a, b) => b.maxTime - a.maxTime)
      .map(entry => entry.conv);
  }, [conversations, role]);

  const unreadCountQuery = useQuery({
    queryKey: ['chat', 'unreadCount', userId],
    queryFn: () => {
      if (!conversations) return 0;
      return deduplicated.reduce((sum, item) => sum + getConversationUnreadCount(item, userId ?? ''), 0);
    },
    enabled: !!userId && !!conversations,
  });

  const unreadCount = unreadCountQuery.data ?? 0;

  return {
    ...queryResult,
    data: deduplicated,
    unreadCount,
  };
}
