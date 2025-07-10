'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import VimeoPlayer from './vimeo-player'
import { useVideoHistory } from '@/hooks/use-video-history'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  databaseId?: string
  userId?: string
  initialTime?: number
  onProgress?: (seconds: number) => void
  onPlay?: () => void
}

export function VideoModal({ isOpen, onClose, videoId, databaseId, userId, initialTime, onProgress, onPlay }: VideoModalProps) {
  const { recordVideoStart, updateProgress } = useVideoHistory(databaseId || '', userId || '')

  const handlePlay = () => {
    if (databaseId && userId) {
      recordVideoStart()
    }
    if (onPlay) {
      onPlay()
    }
  }

  const handleProgress = (seconds: number) => {
    if (databaseId && userId) {
      updateProgress(seconds)
    }
    if (onProgress) {
      onProgress(seconds)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-7xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="relative">
          <VimeoPlayer 
            videoId={videoId}
            initialTime={initialTime ? Math.min(Math.max(initialTime, 0), 3600) : 0}
            onProgress={handleProgress}
            onPlay={handlePlay}
          />
        </div>
      </div>
    </div>
  )
}