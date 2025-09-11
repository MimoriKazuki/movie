import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  variant?: 'default' | 'glass' | 'gradient' | 'elevated'
  borderGlow?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-2xl',
}

const variantStyles = {
  default: 'bg-white border border-gray-200/50',
  glass: 'bg-white/80 backdrop-blur-xl border border-gray-200/30',
  gradient: 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200/50',
  elevated: 'bg-white border border-gray-100',
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = false,
  variant = 'default',
  borderGlow = false
}: CardProps) {
  return (
    <div className="relative group">
      {/* Glow effect on hover */}
      {borderGlow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur transition-opacity duration-500" />
      )}
      
      <div 
        className={cn(
          'relative rounded-2xl overflow-hidden transition-shadow duration-200',
          variantStyles[variant],
          paddingStyles[padding],
          shadowStyles[shadow],
          hover && 'hover:shadow-xl',
          className
        )}
      >
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={cn('border-b border-gray-200/50 pb-4 mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}