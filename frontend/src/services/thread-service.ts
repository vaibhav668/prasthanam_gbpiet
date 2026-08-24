import { localDb } from '../lib/local-db'
import { useAuthStore } from '../stores/auth-store'
import type { Thread, Post, ThreadReaction, ChatMessage, Chatroom } from '../types/api'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const threadService = {
  async getThreads(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<Thread[]> {
    return localDb.getThreads(params?.search)
  },

  async getThread(id: number): Promise<Thread> {
    const thread = localDb.getThreadById(id)
    if (!thread) {
      throw new Error('Thread not found')
    }
    return thread
  },

  async createThread(data: {
    title: string
    content?: string
    images?: File[]
  }): Promise<Thread> {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      throw new Error('You must be logged in to create a thread')
    }

    let uploadedImages: Array<{ url: string; caption?: string }> = []
    if (data.images && data.images.length > 0) {
      uploadedImages = await Promise.all(
        data.images.map(async (img) => ({
          url: await readFileAsDataUrl(img),
          caption: img.name,
        }))
      )
    }

    return localDb.createThread({
      title: data.title,
      content: data.content,
      images: uploadedImages,
      author: currentUser,
    })
  },

  async deleteThread(id: number): Promise<void> {
    const deleted = localDb.deleteThread(id)
    if (!deleted) {
      throw new Error('Thread not found')
    }
  },

  async createPost(threadId: number, content: string): Promise<Post> {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      throw new Error('You must be logged in to reply')
    }

    return localDb.createPost(threadId, content, currentUser)
  },

  async addReaction(threadId: number, emoji: string): Promise<ThreadReaction> {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      throw new Error('You must be logged in to react')
    }

    return localDb.addReaction(threadId, emoji, currentUser)
  },

  async removeReaction(threadId: number, emoji: string): Promise<void> {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) return

    localDb.removeReaction(threadId, emoji, currentUser.id)
  },

  async getReactions(threadId: number): Promise<{
    reactions: ThreadReaction[]
    emoji_counts: Record<string, number>
    emoji_users: Record<string, string[]>
  }> {
    const thread = localDb.getThreadById(threadId)
    const reactions = thread?.reactions || []

    const emoji_counts: Record<string, number> = {}
    const emoji_users: Record<string, string[]> = {}

    for (const r of reactions) {
      emoji_counts[r.emoji] = (emoji_counts[r.emoji] || 0) + 1
      if (!emoji_users[r.emoji]) emoji_users[r.emoji] = []
      if (r.user?.username) {
        emoji_users[r.emoji].push(r.user.username)
      }
    }

    return { reactions, emoji_counts, emoji_users }
  },
}

export const chatService = {
  async getChatrooms(): Promise<Chatroom[]> {
    return localDb.getChatrooms()
  },

  async getChatHistory(chatroomId: number): Promise<ChatMessage[]> {
    return localDb.getChatMessages(chatroomId)
  },

  async createChatroom(data: {
    name: string
    description?: string
  }): Promise<Chatroom> {
    const currentUser = useAuthStore.getState().user
    const userId = currentUser?.id || 1
    return localDb.createChatroom(data.name, data.description || '', userId)
  },
}
