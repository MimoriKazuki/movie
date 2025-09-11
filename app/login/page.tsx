'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ChevronLeft, Rocket, Star, Brain, Video } from 'lucide-react'
import { DiagnosisModal } from '@/components/diagnosis/diagnosis-modal'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Login error:', error)
        alert('ログインに失敗しました')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Back link */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              トップページへ戻る
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                誰でもエンジニア
              </h1>
            </div>

            {/* Welcome message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                AIで最前線を走ろう
              </h2>
              <p className="text-gray-600">
                最新のAIツールを使いこなし、業界の最前線で活躍するスキルを身につけましょう。
              </p>
            </div>

            {/* Login buttons */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700">Googleでログイン</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-500">または</span>
                </div>
              </div>

              <button
                onClick={() => setIsDiagnosisOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Rocket className="w-5 h-5" />
                まずは無料診断を受ける
              </button>
            </div>

            {/* Terms */}
            <p className="mt-8 text-xs text-gray-500 text-center">
              ログインすることで、
              <Link href="/terms" className="text-blue-600 hover:underline">利用規約</Link>
              と
              <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
              に同意したものとみなされます。
            </p>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-8 py-12">
          <div className="max-w-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              なぜ誰でもエンジニアが選ばれるのか？
            </h3>

            <div className="space-y-6">
              {/* メインの価値提案 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">AI時代は鮮度が命</h4>
                    <p className="text-sm text-gray-700 font-medium">最新のAI情報を動画コンテンツで即座に学習。他では得られない鮮度の高い情報を提供します。</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">動画で即座に理解</h4>
                  <p className="text-sm text-gray-600">文章では伝わりにくいAIツールの操作も、動画なら一目瞭然。最速で実践スキルが身につきます。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">毎週更新される最新情報</h4>
                  <p className="text-sm text-gray-600">AIの進化スピードに合わせて、常に最新の情報を更新。時代に取り残されません。</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">独占コンテンツ</h4>
                  <p className="text-sm text-gray-600">他のプラットフォームでは公開されない、実践的なAI活用術を独占配信。</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">毎週</div>
                <div className="text-xs text-gray-600">更新頻度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">500+</div>
                <div className="text-xs text-gray-600">動画コンテンツ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">最新</div>
                <div className="text-xs text-gray-600">AI情報</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Modal */}
      <DiagnosisModal 
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
      />
    </div>
  )
}