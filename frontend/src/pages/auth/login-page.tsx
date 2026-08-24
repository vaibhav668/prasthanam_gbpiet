import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { AuthLayout } from '../../components/layout/app-layout'
import { authService } from '../../services/auth-service'
import { INITIAL_USERS } from '../../lib/mock-data'
import { ArrowRight, UserCheck, Sparkles } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/app/forum'

  const handleDemoLogin = async (userId: number) => {
    try {
      setIsLoggingIn(true)
      setError(null)
      await authService.loginAsDemoUser(userId)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to authenticate')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border-[#222] bg-[#0A0A0A] text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-3xl rounded-full pointer-events-none" />

        <CardHeader className="space-y-2 text-center pb-6 pt-8 border-b border-[#1a1a1a]">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            <Sparkles className="w-4 h-4 text-white" /> Forge Workspace Access
          </div>
          <CardTitle className="text-3xl font-black font-ginto-nord uppercase tracking-tight text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-neutral-400 text-sm font-medium">
            Choose a developer profile or join as a guest builder to enter.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 pb-8">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 w-full text-center">
              {error}
            </div>
          )}

          {/* Quick 1-Click Primary Sign-In */}
          <div className="space-y-3">
            <Button
              onClick={() => handleDemoLogin(1)}
              disabled={isLoggingIn}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm flex items-center justify-between px-6 transition-all"
            >
              <span className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-black" />
                <span>Enter as {INITIAL_USERS[0].name} (President)</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#222] w-full" />
            <span className="bg-[#0A0A0A] px-3 text-[10px] uppercase font-bold tracking-widest text-neutral-500 absolute">
              Or Choose Profile
            </span>
          </div>

          {/* Profile Switcher List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {INITIAL_USERS.slice(1).map((user) => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user.id)}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-neutral-700 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-neutral-700">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-neutral-200">{user.name}</p>
                    <p className="text-xs text-neutral-500">@{user.username}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                  Login →
                </span>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Zero backend required. Sessions and discussions are preserved in your browser storage.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
