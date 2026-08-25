import { useEffect, useCallback, useState, useRef } from 'react'
import { useAuthStore } from '../stores/auth-store'
import { localDb, broadcastChannel } from '../lib/local-db'
import { INITIAL_USERS } from '../lib/mock-data'
import type { ChatMessage } from '../types/api'

interface UseChatWebSocketOptions {
  chatroomId: number
  onMessage?: (message: ChatMessage) => void
  onUserJoined?: (userId: number, username: string) => void
  onUserLeft?: (userId: number) => void
  onTyping?: (userId: number, username: string) => void
  onError?: (error: Event) => void
  onClose?: () => void
}

interface UseChatWebSocketReturn {
  isConnected: boolean
  sendMessage: (content: string) => void
  sendTyping: () => void
}

export function useChatWebSocket({
  chatroomId,
  onMessage,
  onUserJoined,
  onUserLeft,
  onTyping,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [isConnected, setIsConnected] = useState(true)
  const currentUser = useAuthStore((state) => state.user)
  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  const onUserJoinedRef = useRef(onUserJoined)
  const onUserLeftRef = useRef(onUserLeft)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onTypingRef.current = onTyping
  }, [onTyping])

  useEffect(() => {
    onUserJoinedRef.current = onUserJoined
  }, [onUserJoined])

  useEffect(() => {
    onUserLeftRef.current = onUserLeft
  }, [onUserLeft])

  // Listen to cross-tab broadcast channel
  useEffect(() => {
    if (!broadcastChannel || !chatroomId) return

    const handleBroadcast = (event: MessageEvent) => {
      const { type, payload } = event.data || {}
      if (type === 'CHAT_MESSAGE_SENT' && payload?.chatroom_id === chatroomId) {
        onMessageRef.current?.(payload as ChatMessage)
      } else if (type === 'USER_TYPING' && payload?.chatroom_id === chatroomId) {
        onTypingRef.current?.(payload.userId, payload.username)
      }
    }

    broadcastChannel.addEventListener('message', handleBroadcast)
    setIsConnected(true)

    return () => {
      broadcastChannel?.removeEventListener('message', handleBroadcast)
    }
  }, [chatroomId])

  const sendMessage = useCallback(
    (content: string) => {
      if (!chatroomId || !content.trim()) return

      const author = currentUser || INITIAL_USERS[0]
      const newMsg = localDb.addChatMessage(chatroomId, content.trim(), author)

      // Immediately notify the sender
      onMessageRef.current?.(newMsg)

      // Simulate an intelligent peer/bot reply after a short delay
      if (Math.random() > 0.4) {
        const botUser = INITIAL_USERS.find((u) => u.id !== author.id) || INITIAL_USERS[1]
        const responses = [
          'Nice build! Looks very clean.',
          'Awesome progress on this! Keep us updated.',
          'Love the design and performance.',
          'Thanks for sharing with the team!',
          'Let me test this out on my machine.',
        ]
        const replyText = responses[Math.floor(Math.random() * responses.length)]

        window.setTimeout(() => {
          onTypingRef.current?.(botUser.id, botUser.username)
          window.setTimeout(() => {
            const replyMsg = localDb.addChatMessage(chatroomId, replyText, botUser)
            onMessageRef.current?.(replyMsg)
          }, 1500)
        }, 1000)
      }
    },
    [chatroomId, currentUser]
  )

  const sendTyping = useCallback(() => {
    if (!chatroomId || !currentUser) return

    broadcastChannel?.postMessage({
      type: 'USER_TYPING',
      payload: {
        chatroom_id: chatroomId,
        userId: currentUser.id,
        username: currentUser.username,
      },
    })
  }, [chatroomId, currentUser])

  return {
    isConnected,
    sendMessage,
    sendTyping,
  }
}
