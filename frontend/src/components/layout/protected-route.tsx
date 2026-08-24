import * as React from "react"
import { cn } from "../../lib/utils"

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  return <>{children}</>
}

interface AuthGuardProps {
  children: React.ReactNode
  isAuthenticated?: boolean
}

export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>
}

interface LoadingStateProps {
  className?: string
}

export function LoadingState({ className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  className?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  className,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium",
              "text-primary-foreground hover:bg-primary/90",
              "transition-colors"
            )}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "No data",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        )}
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}
