'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVideoHistory(databaseVideoId: string, userId: string | undefined) {
  const supabase = createClient()
  const lastUpdateRef = useRef<number>(0)
  const [hasStarted, setHasStarted] = useState(false)

  const recordVideoStart = useCallback(async () => {
    if (!userId || hasStarted) return
    
    setHasStarted(true)
    
    try {
      const { error } = await supabase
        .from('view_history')
        .upsert({
          user_id: userId,
          video_id: databaseVideoId,
          progress: 0,
          last_viewed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating view history:', error)
      } else {
        console.log('View history created for video:', databaseVideoId)
      }
    } catch (error) {
      console.error('Error in recordVideoStart:', error)
    }
  }, [databaseVideoId, userId, hasStarted, supabase])

  const updateProgress = useCallback(async (seconds: number) => {
    if (!userId) return

    const now = Date.now()
    if (now - lastUpdateRef.current < 3000) return
    
    lastUpdateRef.current = now

    try {
      const { error } = await supabase
        .from('view_history')
        .upsert({
          user_id: userId,
          video_id: databaseVideoId,
          progress: Math.floor(seconds),
          last_viewed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating progress:', error)
      }
    } catch (error) {
      console.error('Error in updateProgress:', error)
    }
  }, [databaseVideoId, userId, supabase])

  return {
    recordVideoStart,
    updateProgress
  }
}