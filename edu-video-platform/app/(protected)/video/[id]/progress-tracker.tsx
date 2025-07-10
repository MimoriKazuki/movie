'use client'

import React, { useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProgressTrackerProps {
  videoId: string
  userId: string
  children: React.ReactNode
}

export function ProgressTracker({ videoId, userId, children }: ProgressTrackerProps) {
  const supabase = createClient()
  const lastUpdateRef = useRef<number>(0)

  const updateProgress = useCallback(async (seconds: number) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < 5000) return
    
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
      } else {
        console.log('Progress updated:', Math.floor(seconds))
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }, [videoId, userId, supabase])

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        onProgress: updateProgress
      })}
    </>
  )
}