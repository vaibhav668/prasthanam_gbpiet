import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/thread-service'
import { queryKeys } from '../lib/query-provider'
import type { Chatroom, ChatMessage } from '../types/api'

export function useChatrooms() {
  return useQuery({
    queryKey: queryKeys.chatrooms.list(),
    queryFn: () => chatService.getChatrooms(),
  })
}

export function useChatHistory(chatroomId: number) {
  return useQuery({
    queryKey: queryKeys.chatrooms.messages(chatroomId),
    queryFn: () => chatService.getChatHistory(chatroomId),
    enabled: !!chatroomId,
    staleTime: 0,
    gcTime: 1000 * 30,
  })
}

export function useCreateChatroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      chatService.createChatroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatrooms.lists() })
    },
  })
}
