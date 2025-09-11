'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'

export default function VideoPurchasePage({ params }: { params: { id: string } }) {
  const [customPrice, setCustomPrice] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadVideo()
  }, [params.id])

  const loadVideo = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', params.id)
        .eq('is_published', true)
        .single()

      if (videoError || !videoData) {
        router.push('/videos')
        return
      }

      setVideo(videoData)
      
      // Set initial price from video
      if (videoData.price) {
        setCustomPrice(videoData.price.toString())
      }
    } catch (err) {
      console.error('Error loading video:', err)
      router.push('/videos')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!customPrice || parseInt(customPrice) < 0) {
      setError('有効な金額を入力してください')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const price = parseInt(customPrice)

      // 0円の場合は無料で視聴可能にする
      if (price === 0) {
        // 無料視聴の記録を作成
        const { error: purchaseError } = await supabase
          .from('video_purchases')
          .insert({
            video_id: params.id,
            user_id: user.id,
            price_paid: 0,
            status: 'active'
          })

        if (purchaseError) throw purchaseError

        // 動画ページへリダイレクト
        router.push(`/video/${params.id}`)
      } else {
        // 有料の場合は決済処理（実装は後で）
        alert(`¥${price.toLocaleString()}の決済処理を実装予定です`)
        
        // テスト用：一時的に購入済みとして記録
        const { error: purchaseError } = await supabase
          .from('video_purchases')
          .insert({
            video_id: params.id,
            user_id: user.id,
            price_paid: price,
            status: 'active'
          })

        if (purchaseError) throw purchaseError

        router.push(`/video/${params.id}`)
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError('購入処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href={`/video/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            動画に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{video.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              動画購入
            </h2>
            <p className="text-gray-600">
              金額を入力して購入してください
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                購入金額
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ¥
                </span>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="100"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="金額を入力"
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                0円の場合は無料で視聴できます
              </p>
              {video.price && video.price > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  定価: ¥{video.price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">即座に視聴可能</p>
                  <p className="text-sm text-gray-600">購入後すぐに動画を視聴できます</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">永久アクセス権</p>
                  <p className="text-sm text-gray-600">一度購入すれば、いつでも視聴可能</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">高画質動画</p>
                  <p className="text-sm text-gray-600">最高品質の動画コンテンツ</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={isProcessing || !customPrice}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isProcessing ? '処理中...' : 
                customPrice === '0' ? '無料で視聴する' : 
                customPrice ? `¥${parseInt(customPrice).toLocaleString()}で購入する` : 
                '金額を入力してください'
              }
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                購入後のキャンセルはできません
              </p>
            </div>
          </div>
        </div>

        {/* Video Description */}
        {video.description && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="font-bold mb-4">動画について</h3>
            <p className="text-gray-700">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}