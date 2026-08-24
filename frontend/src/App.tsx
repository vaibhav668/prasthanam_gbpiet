import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AppLayout } from './components/layout/app-layout'
import { ErrorBoundary } from './components/error-boundary'
import { NavigationLoader } from './components/navigation-loader'

const HomePage = lazy(() => import('./pages/home/home-page').then((module) => ({ default: module.HomePage })))
const ThreadListPage = lazy(() => import('./pages/forum/thread-list-page').then((module) => ({ default: module.ThreadListPage })))
const ThreadDetailPage = lazy(() => import('./pages/forum/thread-detail-page').then((module) => ({ default: module.ThreadDetailPage })))
const ChatPage = lazy(() => import('./pages/chat/chat-page').then((module) => ({ default: module.ChatPage })))

function RouteLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function LegacyThreadRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={id ? `/app/forum/threads/${id}` : '/app/forum'} replace />
}

function App() {
  return (
    <ErrorBoundary>
      <NavigationLoader />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Direct Workspace Routes (No login required) */}
          <Route path="/app" element={<AppLayout />}>
            <Route path="forum" element={<ThreadListPage />} />
            <Route path="forum/threads/:id" element={<ThreadDetailPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:id" element={<ChatPage />} />
            <Route index element={<Navigate to="forum" replace />} />
          </Route>

          {/* Quick shortcuts & redirects */}
          <Route path="/login" element={<Navigate to="/app/forum" replace />} />
          <Route path="/forum" element={<Navigate to="/app/forum" replace />} />
          <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
          <Route path="/threads/:id" element={<LegacyThreadRedirect />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
