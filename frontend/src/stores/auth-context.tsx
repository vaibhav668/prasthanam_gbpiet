import { createContext, useContext, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from './auth-store'
import type { User } from '../types/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated, isLoading, login, logout, setUser } = useAuthStore()

  const handleLogin = useCallback((user: User, token: string) => {
    login(user, token)
  }, [login])

  const handleLogout = useCallback(() => {
    const queryClient = useQueryClient()
    queryClient.clear()
    logout()
  }, [logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
