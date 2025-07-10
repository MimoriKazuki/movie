'use client'

import { useEffect, useRef } from 'react'
import Player from '@vimeo/player'
import styles from './vimeo-player.module.css'

interface VimeoPlayerProps {
  videoId: string
  onProgress?: (seconds: number) => void
  onPlay?: () => void
  initialTime?: number
}

export default function VimeoPlayer({ videoId, onProgress, onPlay, initialTime = 0 }: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const player = new Player(containerRef.current, {
      id: parseInt(videoId),
      responsive: true,
      playsinline: true,
      autopause: false,
      byline: false,
      portrait: false,
      title: false,
      background: false,
      controls: true,
      quality: 'auto',
    })

    playerRef.current = player

    // 動画の長さを取得してからinitialTimeを設定
    player.ready().then(() => {
      return player.getDuration()
    }).then((duration) => {
      if (initialTime > 0) {
        // initialTimeが動画の長さを超えないように制限
        const safeInitialTime = Math.min(Math.max(initialTime, 0), duration - 1)
        if (safeInitialTime > 0) {
          player.setCurrentTime(safeInitialTime)
        }
      }
    }).catch((error) => {
      console.error('Error setting initial time:', error)
    })

    if (onProgress) {
      player.on('timeupdate', (data) => {
        onProgress(data.seconds)
      })
    }

    if (onPlay) {
      player.on('play', () => {
        onPlay()
      })
    }

    return () => {
      player.destroy()
    }
  }, [videoId, initialTime, onProgress, onPlay])

  return (
    <div className={styles.playerContainer}>
      <div className={styles.playerWrapper}>
        <div ref={containerRef} className={styles.player} />
      </div>
    </div>
  )
}