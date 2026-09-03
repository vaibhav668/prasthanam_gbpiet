import {
  INITIAL_CLUB_CONFIG,
  INITIAL_TEAM,
  INITIAL_EVENTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_THREADS,
  INITIAL_CHATROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_USERS,
} from './mock-data'
import type {
  ClubConfig,
  TeamMember,
  Event,
  Announcement,
  Achievement,
  Thread,
  Post,
  ThreadReaction,
  Chatroom,
  ChatMessage,
  User,
  HomepageData,
} from '../types/api'

const STORAGE_KEYS = {
  CLUB: 'prasthanam_club_config',
  TEAM: 'prasthanam_team_members_v12',
  EVENTS: 'prasthanam_events_v2',
  ACHIEVEMENTS: 'prasthanam_achievements',
  ANNOUNCEMENTS: 'prasthanam_announcements_v2',
  THREADS: 'prasthanam_threads',
  CHATROOMS: 'prasthanam_chatrooms',
  CHAT_MESSAGES: 'prasthanam_chat_messages',
  USERS: 'prasthanam_users',
  CURRENT_USER: 'prasthanam_current_user',
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue))
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage, using default`, e)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e)
  }
}

// Channel for cross-tab live updates
export const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('prasthanam_sync_channel')
  : null

export const localDb = {
  getClubConfig(): ClubConfig {
    const config = loadFromStorage<ClubConfig>(STORAGE_KEYS.CLUB, INITIAL_CLUB_CONFIG)
    if (config.description && config.description.includes('We are the official robotics club of GBPIET')) {
      config.description = INITIAL_CLUB_CONFIG.description
      config.logo_url = INITIAL_CLUB_CONFIG.logo_url
      saveToStorage(STORAGE_KEYS.CLUB, config)
    }
    return config
  },

  getTeamMembers(): TeamMember[] {
    return loadFromStorage<TeamMember[]>(STORAGE_KEYS.TEAM, INITIAL_TEAM)
  },

  getEvents(): Event[] {
    return loadFromStorage<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS)
  },

  getAchievements(): Achievement[] {
    return loadFromStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS)
  },

  getAnnouncements(): Announcement[] {
    return loadFromStorage<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  },

  getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS)
  },

  getUserById(id: number): User | undefined {
    const users = this.getUsers()
    return users.find((u) => u.id === id)
  },

  updateUserProfile(userId: number, updates: Partial<User>): User {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) {
      const newUser: User = {
        id: userId,
        username: updates.username || 'user',
        email: updates.email || 'member@prasthanam.gbpiet.ac.in',
        name: updates.name || 'Member',
        bio: updates.bio || '',
        avatar: updates.avatar || '',
      }
      users.push(newUser)
      saveToStorage(STORAGE_KEYS.USERS, users)
      return newUser
    }

    users[index] = { ...users[index], ...updates }
    saveToStorage(STORAGE_KEYS.USERS, users)
    return users[index]
  },

  getHomepageBundle(): HomepageData {
    const club = this.getClubConfig()
    const team = this.getTeamMembers().filter((t) => t.is_active)
    const events = this.getEvents().filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
    const achievements = this.getAchievements()
    const announcements = this.getAnnouncements()
    const threads = this.getThreads()
    const chatrooms = this.getChatrooms()
    const users = this.getUsers()

    return {
      club,
      team,
      events,
      achievements,
      announcements,
      stats: {
        total_members: users.length + 50,
        total_threads: threads.length,
        total_chatrooms: chatrooms.length,
        total_events: events.length,
      },
    }
  },

  getThreads(search?: string): Thread[] {
    let threads = loadFromStorage<Thread[]>(STORAGE_KEYS.THREADS, INITIAL_THREADS)
    if (search && search.trim()) {
      const term = search.toLowerCase()
      threads = threads.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.posts?.some((p) => p.content.toLowerCase().includes(term))
      )
    }
    return threads.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },

  getThreadById(id: number): Thread | null {
    const threads = this.getThreads()
    return threads.find((t) => t.id === id) || null
  },

  createThread(data: {
    title: string
    content?: string
    images?: Array<{ url: string; caption?: string }>
    author: User
  }): Thread {
    const threads = this.getThreads()
    const newId = Date.now()
    const nowIso = new Date().toISOString()

    const newThread: Thread = {
      id: newId,
      title: data.title,
      user_id: data.author.id,
      user: data.author,
      created_at: nowIso,
      updated_at: nowIso,
      images: (data.images || []).map((img, i) => ({
        id: newId * 10 + i,
        thread_id: newId,
        url: img.url,
        caption: img.caption,
      })),
      reactions: [],
      posts: data.content
        ? [
            {
              id: newId + 1,
              content: data.content,
              thread_id: newId,
              user_id: data.author.id,
              user: data.author,
              created_at: nowIso,
              updated_at: nowIso,
            },
          ]
        : [],
    }

    threads.unshift(newThread)
    saveToStorage(STORAGE_KEYS.THREADS, threads)

    broadcastChannel?.postMessage({
      type: 'THREAD_CREATED',
      payload: newThread,
    })

    return newThread
  },

  deleteThread(id: number): boolean {
    let threads = this.getThreads()
    const beforeLen = threads.length
    threads = threads.filter((t) => t.id !== id)
    saveToStorage(STORAGE_KEYS.THREADS, threads)
    return threads.length < beforeLen
  },

  createPost(threadId: number, content: string, author: User): Post {
    const threads = this.getThreads()
    const threadIndex = threads.findIndex((t) => t.id === threadId)
    if (threadIndex === -1) {
      throw new Error('Thread not found')
    }

    const postId = Date.now()
    const nowIso = new Date().toISOString()

    const newPost: Post = {
      id: postId,
      content,
      thread_id: threadId,
      user_id: author.id,
      user: author,
      created_at: nowIso,
      updated_at: nowIso,
    }

    if (!threads[threadIndex].posts) {
      threads[threadIndex].posts = []
    }
    threads[threadIndex].posts.push(newPost)
    threads[threadIndex].updated_at = nowIso
    saveToStorage(STORAGE_KEYS.THREADS, threads)

    broadcastChannel?.postMessage({
      type: 'POST_CREATED',
      payload: { threadId, post: newPost },
    })

    return newPost
  },

  addReaction(threadId: number, emoji: string, author: User): ThreadReaction {
    const threads = this.getThreads()
    const threadIndex = threads.findIndex((t) => t.id === threadId)
    if (threadIndex === -1) {
      throw new Error('Thread not found')
    }

    const thread = threads[threadIndex]
    if (!thread.reactions) {
      thread.reactions = []
    }

    const existingIndex = thread.reactions.findIndex(
      (r) => r.emoji === emoji && (r.user_id === author.id || r.user?.id === author.id)
    )

    if (existingIndex !== -1) {
      return thread.reactions[existingIndex]
    }

    const reaction: ThreadReaction = {
      id: Date.now(),
      thread_id: threadId,
      user_id: author.id,
      user: author,
      emoji,
      created_at: new Date().toISOString(),
    }

    thread.reactions.push(reaction)
    saveToStorage(STORAGE_KEYS.THREADS, threads)

    broadcastChannel?.postMessage({
      type: 'REACTION_ADDED',
      payload: { threadId, reaction },
    })

    return reaction
  },

  removeReaction(threadId: number, emoji: string, authorId: number): void {
    const threads = this.getThreads()
    const threadIndex = threads.findIndex((t) => t.id === threadId)
    if (threadIndex === -1) return

    const thread = threads[threadIndex]
    if (!thread.reactions) return

    thread.reactions = thread.reactions.filter(
      (r) => !(r.emoji === emoji && (r.user_id === authorId || r.user?.id === authorId))
    )

    saveToStorage(STORAGE_KEYS.THREADS, threads)

    broadcastChannel?.postMessage({
      type: 'REACTION_REMOVED',
      payload: { threadId, emoji, authorId },
    })
  },

  getChatrooms(): Chatroom[] {
    return loadFromStorage<Chatroom[]>(STORAGE_KEYS.CHATROOMS, INITIAL_CHATROOMS)
  },

  createChatroom(name: string, description: string = '', authorId: number): Chatroom {
    const chatrooms = this.getChatrooms()
    const newRoom: Chatroom = {
      id: Date.now(),
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      created_by: authorId,
      created_at: new Date().toISOString(),
      active_users: 1,
    }

    chatrooms.push(newRoom)
    saveToStorage(STORAGE_KEYS.CHATROOMS, chatrooms)

    broadcastChannel?.postMessage({
      type: 'CHATROOM_CREATED',
      payload: newRoom,
    })

    return newRoom
  },

  getChatMessages(chatroomId: number): ChatMessage[] {
    const allMessages = loadFromStorage<Record<number, ChatMessage[]>>(
      STORAGE_KEYS.CHAT_MESSAGES,
      INITIAL_CHAT_MESSAGES
    )
    return allMessages[chatroomId] || []
  },

  addChatMessage(chatroomId: number, content: string, author: User): ChatMessage {
    const allMessages = loadFromStorage<Record<number, ChatMessage[]>>(
      STORAGE_KEYS.CHAT_MESSAGES,
      INITIAL_CHAT_MESSAGES
    )

    if (!allMessages[chatroomId]) {
      allMessages[chatroomId] = []
    }

    const newMsg: ChatMessage = {
      id: Date.now(),
      chatroom_id: chatroomId,
      user_id: author.id,
      user: author,
      content,
      created_at: new Date().toISOString(),
      reactions: [],
    }

    allMessages[chatroomId].push(newMsg)
    saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, allMessages)

    broadcastChannel?.postMessage({
      type: 'CHAT_MESSAGE_SENT',
      payload: newMsg,
    })

    return newMsg
  },
}
