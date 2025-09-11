'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react'

interface PurchaseButtonProps {
  productId: string
  productType: 'video' | 'course' | 'prompt'
  productName: string
  price: number
  className?: string
  children?: React.ReactNode
}

// Stripeの公開可能キーを設定
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PurchaseButton({
  productId,
  productType,
  productName,
  price,
  className = '',
  children
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [courseInfo, setCourseInfo] = useState<{ id: string; title: string } | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType,
          productName,
          price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // コースに含まれている動画の場合の警告
        if (data.error === 'already_purchased_in_course') {
          setWarningMessage(data.message)
          setCourseInfo({ id: data.courseId, title: data.courseTitle })
          setShowWarning(true)
          setLoading(false)
          return
        }
        
        // 既に購入済みの場合
        if (data.error === 'already_purchased') {
          setError(data.message)
          setLoading(false)
          return
        }

        throw new Error(data.error || 'Purchase failed')
      }

      // 無料の場合は直接リダイレクト
      if (data.free) {
        window.location.href = data.redirectUrl
        return
      }

      // Stripeのチェックアウトページへリダイレクト
      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionId) {
        const stripe = await stripePromise
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          })
          if (error) {
            throw error
          }
        }
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError('購入処理中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  if (showWarning) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              購入済みコースに含まれています
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              {warningMessage}
            </p>
            {courseInfo && (
              <div className="mt-3 flex gap-2">
                <a
                  href={`/courses/${courseInfo.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700"
                >
                  コースを見る
                </a>
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-3 py-1.5 bg-white border border-yellow-300 text-yellow-700 text-sm font-medium rounded hover:bg-yellow-50"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              {error}
            </p>
            <a
              href={`/${productType}/${productId}`}
              className="inline-block mt-2 text-sm text-green-600 hover:text-green-700 underline"
            >
              コンテンツを見る →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 
        bg-gradient-to-r from-blue-600 to-purple-600 
        text-white font-medium rounded-lg 
        hover:from-blue-700 hover:to-purple-700 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition-all shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          処理中...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          {children || (price === 0 ? '無料で視聴' : `¥${price.toLocaleString()}で購入`)}
        </>
      )}
    </button>
  )
}