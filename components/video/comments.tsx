'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Heart } from 'lucide-react'

type Comment = {
  id: string
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
  user_id: string
  profiles: {
    name: string | null
    avatar_url: string | null
  } | null
  user_has_liked?: boolean
  likes_count?: number
  replies?: Comment[]
}

interface CommentsProps {
  videoId: string
  userId?: string
  initialComments?: Comment[]
}

export function Comments({ videoId, userId, initialComments = [] }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from('video_comments')
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .eq('video_id', videoId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })

    if (commentsData && userId) {
      // ユーザーがいいねしたコメントのIDを取得
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', commentsData.map(c => c.id))

      const likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || [])
      
      const commentsWithLikes = commentsData.map(comment => ({
        ...comment,
        user_has_liked: likedCommentIds.has(comment.id)
      }))
      
      setComments(commentsWithLikes as Comment[])
    } else if (commentsData) {
      setComments(commentsData as Comment[])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newComment.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('video_comments')
        .insert({
          video_id: videoId,
          user_id: userId,
          content: newComment.trim()
        })

      if (!error) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!userId) return

    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    if (comment.user_has_liked) {
      // いいねを削除
      await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId)
    } else {
      // いいねを追加
      await supabase
        .from('comment_likes')
        .insert({
          user_id: userId,
          comment_id: commentId
        })
    }

    // コメントを再取得
    fetchComments()
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">コメント ({comments.length})</h2>
      
      {userId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            コメントを投稿
          </button>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {comment.profiles?.avatar_url ? (
                  <img 
                    src={comment.profiles.avatar_url} 
                    alt={comment.profiles.name || ''}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {(comment.profiles?.name || 'U').slice(0,1)}
                  </div>
                )}
                <span className="font-medium">
                  {comment.profiles?.name || '匿名ユーザー'}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja
                })}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => handleLike(comment.id)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  comment.user_has_liked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-gray-700'
                } ${!userId ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={!userId}
              >
                <Heart 
                  className={`w-4 h-4 ${comment.user_has_liked ? 'fill-current' : ''}`} 
                />
                <span>{comment.likes_count || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
