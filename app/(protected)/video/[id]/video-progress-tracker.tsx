'use client'

import React, { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoProgressTrackerProps {
  videoId: string
  userId: string
  children: React.ReactElement
}

export function VideoProgressTracker({ videoId, userId, children }: VideoProgressTrackerProps) {
  const supabase = createClient()
  const lastUpdateRef = useRef<number>(0)
  const [hasStarted, setHasStarted] = useState(false)

  // 動画が再生されたときに呼ばれる
  const handlePlay = useCallback(async () => {
    if (!hasStarted && userId) {
      setHasStarted(true)
      
      try {
        // 視聴履歴を作成または更新
        const { error } = await supabase
          .from('view_history')
          .upsert({
            user_id: userId,
            video_id: videoId,
            progress: 0,
            last_viewed_at: new Date().toISOString()
          })

        if (error) {
          console.error('Error creating view history:', error)
        } else {
          console.log('View history created/updated')
        }
      } catch (error) {
        console.error('Error in handlePlay:', error)
      }
    }
  }, [videoId, userId, hasStarted, supabase])

  // 進捗を更新
  const updateProgress = useCallback(async (seconds: number) => {
    if (!userId) return

    const now = Date.now()
    // 3秒ごとに更新
    if (now - lastUpdateRef.current < 3000) return
    
    lastUpdateRef.current = now

    try {
      const { error } = await supabase
        .from('view_history')
        .upsert({
          user_id: userId,
          video_id: videoId,
          progress: Math.floor(seconds),
          last_viewed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating progress:', error)
      }
    } catch (error) {
      console.error('Error in updateProgress:', error)
    }
  }, [videoId, userId, supabase])

  return (
    <>
      {React.cloneElement(children, {
        onProgress: updateProgress,
        onPlay: handlePlay
      })}
    </>
  )
}