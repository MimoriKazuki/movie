'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Video, CheckCircle, ShoppingCart, Play, Eye } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'

interface Course {
  id: string
  title: string
  description: string | null
  price: number
  thumbnail_url: string | null
  course_videos?: { count: number }[]
}

interface CourseCardProps {
  course: Course
  isPurchased: boolean
  userId?: string
}

export function CourseCard({ course, isPurchased, userId }: CourseCardProps) {
  const [purchasing, setPurchasing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePurchase = async () => {
    if (!userId) {
      router.push('/login')
      return
    }

    setPurchasing(true)
    
    try {
      // 購入処理（実際の決済処理はここに実装）
      // 今回はデモのため、直接購入履歴に追加
      const { error } = await supabase
        .from('course_purchases')
        .insert({
          user_id: userId,
          course_id: course.id,
          price_paid: course.price,
          status: 'active'
        })

      if (!error) {
        // 購入成功後、コース詳細ページへ
        router.push(`/courses/${course.id}`)
        router.refresh()
      } else {
        alert('購入処理に失敗しました')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('購入処理中にエラーが発生しました')
    } finally {
      setPurchasing(false)
    }
  }

  const videoCount = course.course_videos?.[0]?.count || 0

  return (
    <Card hover variant="glass" shadow="lg" padding="none" borderGlow>
      <CardContent className="p-0">
        {/* サムネイル */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group">
          {course.thumbnail_url ? (
            <>
              <SmartImage
                src={course.thumbnail_url}
                alt={course.title}
                className="transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <Video className="w-16 h-16 text-white opacity-50 group-hover:scale-125 transition-transform duration-500" />
            </div>
          )}
          
          {isPurchased && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm bg-opacity-90">
              <CheckCircle className="w-3.5 h-3.5" />
              購入済み
            </div>
          )}
          
          {/* Hover play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
              <Play className="w-8 h-8 text-gray-900" />
            </div>
          </div>
        </div>

        {/* コース情報 */}
        <div className="p-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
            {course.title}
          </h3>
          
          {course.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{videoCount} 本の動画</span>
            </div>
            
            <div className="text-lg font-bold">
              {course.price === 0 ? (
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">無料</span>
              ) : (
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">¥{course.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          {isPurchased ? (
            <Link href={`/courses/${course.id}`}>
              <Button fullWidth variant="gradient" icon={Play} glow>
                コースを開始
              </Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Link href={`/courses/${course.id}`}>
                <Button fullWidth variant="secondary" icon={Eye}>
                  詳細を見る
                </Button>
              </Link>
              {course.price === 0 ? (
                <Button 
                  fullWidth 
                  variant="primary"
                  icon={Play}
                  onClick={handlePurchase}
                  loading={purchasing}
                  glow
                >
                  無料で始める
                </Button>
              ) : (
                <Button 
                  fullWidth 
                  variant="success"
                  icon={ShoppingCart}
                  onClick={handlePurchase}
                  loading={purchasing}
                  glow
                >
                  購入する
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
