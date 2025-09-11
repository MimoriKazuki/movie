import React from 'react'
import { cn } from '@/lib/utils'

interface ContentGridProps {
  children: React.ReactNode
  className?: string
}

export function ContentGrid({ children, className = '' }: ContentGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
      {children}
    </div>
  )
}

