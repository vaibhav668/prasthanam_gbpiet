import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

interface Reaction {
  emoji: string
  count: number
  hasReacted: boolean
}

interface ReactionButtonProps {
  reactions: Reaction[]
  onAddReaction: (emoji: string) => void
  onRemoveReaction: (emoji: string) => void
  isAuthenticated: boolean
  className?: string
}

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '🔥']

export function ReactionButton({
  reactions,
  onAddReaction,
  onRemoveReaction,
  isAuthenticated,
  className,
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = React.useState(false)

  const handleReactionClick = (emoji: string) => {
    const existing = reactions.find((r) => r.emoji === emoji)
    if (existing?.hasReacted) {
      onRemoveReaction(emoji)
    } else {
      onAddReaction(emoji)
    }
    setShowPicker(false)
  }

  const availableEmojis = DEFAULT_EMOJIS.map((emoji) => {
    const reaction = reactions.find((r) => r.emoji === emoji)
    return {
      emoji,
      count: reaction?.count || 0,
      hasReacted: reaction?.hasReacted || false,
    }
  }).filter((r) => r.count > 0)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {availableEmojis.map(({ emoji, count, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          disabled={!isAuthenticated}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition-colors',
            'hover:bg-accent',
            hasReacted
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground border border-transparent',
            !isAuthenticated && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span>{emoji}</span>
          <span className="text-xs">{count}</span>
        </button>
      ))}

      {isAuthenticated && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPicker(!showPicker)}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Button>

          {showPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-lg border bg-background p-2 shadow-lg">
              {DEFAULT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
