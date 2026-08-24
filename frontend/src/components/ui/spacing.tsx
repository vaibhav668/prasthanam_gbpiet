import React from 'react'
import { cn } from '../../lib/utils'

interface SpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  axis?: 'x' | 'y' | 'both'
  className?: string
}

const spacingSizes = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}

export function Spacing({ size = 'md', axis = 'both', className }: SpacingProps) {
  const style = React.useMemo(() => {
    if (axis === 'both') {
      return { height: spacingSizes[size], width: spacingSizes[size] }
    }
    if (axis === 'x') {
      return { width: spacingSizes[size] }
    }
    return { height: spacingSizes[size] }
  }, [size, axis])

  return <div style={style} className={cn('flex-shrink-0', className)} />
}

export function VStack({ children, gap = 'md', className }: { children: React.ReactNode; gap?: SpacingProps['size']; className?: string }) {
  const gapSize = spacingSizes[gap]
  return (
    <div className={cn('flex flex-col', className)} style={{ gap: gapSize }}>
      {children}
    </div>
  )
}

export function HStack({ children, gap = 'md', className }: { children: React.ReactNode; gap?: SpacingProps['size']; className?: string }) {
  const gapSize = spacingSizes[gap]
  return (
    <div className={cn('flex flex-row', className)} style={{ gap: gapSize }}>
      {children}
    </div>
  )
}
