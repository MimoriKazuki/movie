'use client'

import { useState } from 'react'
import { Heart, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoDetailsProps {
  video: Video
  isFavorited: boolean
  userId?: string
}

export function VideoDetails({ video, isFavorited: initialFavorited, userId }: VideoDetailsProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const toggleFavorite = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', userId)
      } else {
        await supabase
          .from('favorites')
          .insert({ video_id: video.id, user_id: userId })
      }
      setIsFavorited(!isFavorited)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description || '',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('リンクをコピーしました')
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-gray-600 mt-2">{video.view_count.toLocaleString()} 回視聴</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isFavorited 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {video.description && (
        <div className="prose max-w-none">
          <p className="text-gray-700">{video.description}</p>
        </div>
      )}

      {video.tags && video.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}