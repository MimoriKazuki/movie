'use client'

import dynamic from 'next/dynamic'

const VideoPlayerWithModal = dynamic(() => import('@/components/video/video-player-with-modal').then(mod => mod.VideoPlayerWithModal), {
  ssr: false,
  loading: () => <div className="aspect-video bg-black rounded-lg animate-pulse" />
})

interface VideoPlayerWrapperProps {
  videoId: string
  initialTime?: number
  onProgress?: (seconds: number) => void
}

export function VideoPlayerWrapper({ videoId, initialTime, onProgress }: VideoPlayerWrapperProps) {
  return (
    <VideoPlayerWithModal 
      videoId={videoId} 
      initialTime={initialTime}
      onProgress={onProgress}
    />
  )
}