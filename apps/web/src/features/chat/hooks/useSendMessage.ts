import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SendMessageInput } from '@jobnow/types';
import { sendMessage } from '../services/chatService';

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput) => sendMessage(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', result.conversationId],
        exact: false,
      });
    },
  });
}
