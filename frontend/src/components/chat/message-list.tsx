import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { ChatMessage } from '../../types/api'
import { MessageItem } from './message-item'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId?: number
  className?: string
}

export function MessageList({ messages, currentUserId, className }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-1 items-center justify-center text-muted-foreground', className)}>
        <div className="text-center">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Be the first to send a message!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex-1 overflow-y-auto py-4', className)}>
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1]
        const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id
        const showUsername = showAvatar

        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.user_id === currentUserId}
            showAvatar={showAvatar}
            showUsername={showUsername}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
