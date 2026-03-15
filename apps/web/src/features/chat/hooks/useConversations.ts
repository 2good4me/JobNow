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
    const map = new Map<string, Conversation>();
    
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
      const key = participantId || conv.id; // Use participant ID as key
      
      const existing = map.get(key);
      if (!existing) {
        map.set(key, conv);
      } else {
        // Keep the one with the most recent activity
        const convTime = Math.max(getMs(conv.updatedAt), getMs(conv.lastMessageAt), getMs(conv.createdAt));
        const existingTime = Math.max(getMs(existing.updatedAt), getMs(existing.lastMessageAt), getMs(existing.createdAt));
        
        if (convTime > existingTime) {
          map.set(key, conv);
        }
      }
    });
    
    return Array.from(map.values()).sort((a, b) => {
      const timeA = Math.max(getMs(a.updatedAt), getMs(a.lastMessageAt), getMs(a.createdAt));
      const timeB = Math.max(getMs(b.updatedAt), getMs(b.lastMessageAt), getMs(b.createdAt));
      return timeB - timeA;
    });
  }, [conversations, role]);

  const unreadCount = useMemo(() => {
    if (!role) return 0;
    return deduplicated.reduce((sum, item) => sum + getConversationUnreadCount(item, role), 0);
  }, [deduplicated, role]);

  return {
    ...queryResult,
    data: deduplicated,
    unreadCount,
  };
}
