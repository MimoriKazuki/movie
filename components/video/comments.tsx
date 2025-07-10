'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: {
    name: string | null
    email: string | null
  } | null
}

interface CommentsProps {
  videoId: string
  userId?: string
}

export function Comments({ videoId, userId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('video_id', videoId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })

    if (data) {
      setComments(data as Comment[])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newComment.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
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
              <span className="font-medium">
                {comment.profiles?.name || comment.profiles?.email || '匿名ユーザー'}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja
                })}
              </span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}