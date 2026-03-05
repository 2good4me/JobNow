import { useMutation } from '@tanstack/react-query';
import { ensureConversationForApplication } from '../services/chatService';

export function useEnsureConversation() {
  return useMutation({
    mutationFn: async (applicationId: string) => ensureConversationForApplication(applicationId),
  });
}
