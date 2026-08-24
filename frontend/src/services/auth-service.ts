import { useAuthStore } from '../stores/auth-store'
import { localDb } from '../lib/local-db'
import { INITIAL_USERS } from '../lib/mock-data'
import type { AuthResponse, User } from '../types/api'

const SESSION_STORAGE_KEY = 'forge_auth_session'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const authService = {
  async loginWithGoogle(_credential: string): Promise<AuthResponse> {
    // Demo fallback for Google login: pick default user or create from mock
    const defaultUser = localDb.getUsers()[0] || INITIAL_USERS[0]
    const token = 'mock-jwt-token-' + Date.now()

    useAuthStore.getState().login(defaultUser, token)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: defaultUser, token }))

    return { token, user: defaultUser }
  },

  async loginAsDemoUser(userId?: number): Promise<AuthResponse> {
    const users = localDb.getUsers()
    const targetUser = users.find((u) => u.id === userId) || users[0] || INITIAL_USERS[0]
    const token = 'mock-jwt-token-' + Date.now()

    useAuthStore.getState().login(targetUser, token)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: targetUser, token }))

    return { token, user: targetUser }
  },

  async getCurrentUser(): Promise<User> {
    const user = useAuthStore.getState().user
    if (user) return user
    throw new Error('No user session')
  },

  async checkSession(): Promise<User | null> {
    useAuthStore.getState().setLoading(true)
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.user && parsed.token) {
          // Re-fetch latest profile from localDb in case of updates
          const freshUser = localDb.getUserById(parsed.user.id) || parsed.user
          useAuthStore.getState().login(freshUser, parsed.token)
          return freshUser
        }
      }
      useAuthStore.getState().logout()
      return null
    } catch {
      useAuthStore.getState().logout()
      return null
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    useAuthStore.getState().logout()
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const currentUser = useAuthStore.getState().user
    if (!currentUser) {
      throw new Error('No active session to update')
    }

    const updatedUser = localDb.updateUserProfile(currentUser.id, data)
    const token = useAuthStore.getState().token || 'mock-token'

    useAuthStore.getState().login(updatedUser, token)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user: updatedUser, token }))

    return updatedUser
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const dataUrl = await readFileAsDataUrl(file)
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      this.updateProfile({ avatar: dataUrl })
    }
    return { url: dataUrl }
  },
}
