import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  threads: {
    all: ['threads'] as const,
    lists: () => [...queryKeys.threads.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.threads.lists(), filters] as const,
    details: () => [...queryKeys.threads.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.threads.details(), id] as const,
  },
  posts: {
    all: ['posts'] as const,
    byThread: (threadId: number) => ['posts', 'thread', threadId] as const,
  },
  chatrooms: {
    all: ['chatrooms'] as const,
    lists: () => [...queryKeys.chatrooms.all, 'list'] as const,
    list: () => [...queryKeys.chatrooms.lists()] as const,
    detail: (id: number) => [...queryKeys.chatrooms.all, 'detail', id] as const,
    messages: (id: number) => [...queryKeys.chatrooms.all, 'messages', id] as const,
  },
  emojis: {
    all: ['emojis'] as const,
    custom: () => [...queryKeys.emojis.all, 'custom'] as const,
  },
} as const
