'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2 } from 'lucide-react'
import { VideoModal } from './video-modal'

const VimeoPlayer = dynamic(() => import('@/components/video/vimeo-player'), {
  ssr: false,
  loading: () => <div className="aspect-video bg-black rounded-lg animate-pulse" />
})

interface VideoPlayerWithModalProps {
  videoId: string
  initialTime?: number
  onProgress?: (seconds: number) => void
  onPlay?: () => void
}

export function VideoPlayerWithModal({ videoId, initialTime, onProgress, onPlay }: VideoPlayerWithModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTime || 0)

  const handleProgress = (seconds: number) => {
    setCurrentTime(seconds)
    if (onProgress) {
      onProgress(seconds)
    }
  }

  return (
    <>
      <div className="relative group">
        <VimeoPlayer 
          videoId={videoId} 
          initialTime={initialTime}
          onProgress={handleProgress}
          onPlay={onPlay}
        />
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
          title="フルスクリーンで表示"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={videoId}
        initialTime={currentTime}
        onProgress={handleProgress}
        onPlay={onPlay}
      />
    </>
  )
}