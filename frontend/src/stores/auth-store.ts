import { create } from 'zustand'
import { INITIAL_USERS } from '../lib/mock-data'
import type { User } from '../types/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => void
}

const defaultUser = INITIAL_USERS[0]

export const useAuthStore = create<AuthState>()((set) => ({
  user: defaultUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  setLoading: (isLoading) => set({ isLoading }),

  login: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: defaultUser,
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    }),
}))
