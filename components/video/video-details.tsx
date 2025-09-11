'use client'

import { useState } from 'react'
import { Heart, Share2, ThumbsUp, MessageCircle, Eye, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoDetailsProps {
  video: Video & {
    like_count?: number
    comment_count?: number
  }
  isFavorited: boolean
  isLiked?: boolean
  userId?: string
}

export function VideoDetails({ video, isFavorited: initialFavorited, isLiked: initialLiked = false, userId }: VideoDetailsProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(video.like_count || 0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const toggleLike = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', video.id)
          .eq('user_id', userId)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await supabase
          .from('video_likes')
          .insert({ video_id: video.id, user_id: userId })
        setLikeCount(prev => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          {/* 視聴回数は非表示に */}
        </div>
      </div>

      <div className="flex gap-2 border-t border-b py-3">
        <button
          onClick={toggleLike}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likeCount > 0 ? likeCount.toLocaleString() : ''} いいね</span>
        </button>
        <button
          onClick={toggleFavorite}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isFavorited 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          <span>保存</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>共有</span>
        </button>
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
