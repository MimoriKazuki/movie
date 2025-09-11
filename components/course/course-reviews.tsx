'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Send, ThumbsUp, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface CourseReviewsProps {
  courseId: string
  userId?: string
  initialReviews?: any[]
}

export default function CourseReviews({ courseId, userId, initialReviews = [] }: CourseReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !comment.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          course_id: courseId,
          user_id: userId,
          rating,
          comment: comment.trim()
        })
        .select(`
          *,
          user:profiles(name, avatar_url)
        `)
        .single()

      if (error) throw error

      setReviews([data, ...reviews])
      setComment('')
      setRating(5)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('レビューの投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (reviewId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('review_likes')
        .insert({
          review_id: reviewId,
          user_id: userId
        })

      if (!error) {
        setReviews(reviews.map(review => {
          if (review.id === reviewId) {
            return { ...review, likes_count: (review.likes_count || 0) + 1 }
          }
          return review
        }))
      }
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-xl mb-4">コース評価・レビュー</h3>
        
        {/* Average Rating */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {reviews.length}件のレビュー
            </p>
          </div>
        </div>

        {/* Review Form */}
        {userId && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                評価
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="このコースの感想を教えてください..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              レビューを投稿
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user?.avatar_url ? (
                      <img
                        src={review.user.avatar_url}
                        alt={review.user.name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.user?.name || '匿名ユーザー'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.created_at), {
                              addSuffix: true,
                              locale: ja
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(review.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              まだレビューがありません。最初のレビューを投稿してください！
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
