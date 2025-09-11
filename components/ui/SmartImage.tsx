'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
}

export function SmartImage({ src, alt, className = '', ...rest }: SmartImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn('w-full h-full object-cover', className)}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
      {...rest}
    />
  )
}

