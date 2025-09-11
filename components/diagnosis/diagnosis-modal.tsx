'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, Target, Code, Video, PenTool, Image, Mic, Brain, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DiagnosisModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Question {
  id: string
  question: string
  options: {
    value: string
    label: string
    icon?: any
    category: string
  }[]
}

const questions: Question[] = [
  {
    id: 'interest',
    question: 'どんなことにAIを活用したいですか？',
    options: [
      { value: 'writing', label: '文章・コンテンツ作成', icon: PenTool, category: 'AIライティング' },
      { value: 'coding', label: 'プログラミング・開発', icon: Code, category: 'AIコーディング' },
      { value: 'video', label: '動画制作・編集', icon: Video, category: 'AI動画生成' },
      { value: 'image', label: 'イラスト・デザイン', icon: Image, category: 'AI画像生成' },
      { value: 'audio', label: '音声・音楽制作', icon: Mic, category: 'AI音声・音楽' },
      { value: 'analysis', label: 'データ分析・予測', icon: Brain, category: 'AI分析・予測' },
    ]
  },
  {
    id: 'experience',
    question: 'AIツールの使用経験はありますか？',
    options: [
      { value: 'beginner', label: '全く使ったことがない', icon: null, category: '' },
      { value: 'basic', label: 'ChatGPTなど少し使ったことがある', icon: null, category: '' },
      { value: 'intermediate', label: '複数のAIツールを使い分けている', icon: null, category: '' },
      { value: 'advanced', label: '業務で日常的に活用している', icon: null, category: '' },
    ]
  },
  {
    id: 'goal',
    question: '学習の目標は何ですか？',
    options: [
      { value: 'efficiency', label: '業務効率化・生産性向上', icon: Target, category: '' },
      { value: 'career', label: 'キャリアアップ・転職', icon: Rocket, category: '' },
      { value: 'creative', label: 'クリエイティブ活動', icon: Sparkles, category: '' },
      { value: 'business', label: 'ビジネス・起業', icon: Target, category: '' },
    ]
  },
  {
    id: 'time',
    question: '1日にどれくらい学習時間を確保できますか？',
    options: [
      { value: '15min', label: '15分程度', icon: null, category: '' },
      { value: '30min', label: '30分程度', icon: null, category: '' },
      { value: '1hour', label: '1時間程度', icon: null, category: '' },
      { value: '2hours', label: '2時間以上', icon: null, category: '' },
    ]
  }
]

export function DiagnosisModal({ isOpen, onClose }: DiagnosisModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }))

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1)
      }, 300)
    } else {
      // 最後の質問の場合、結果を表示
      setTimeout(() => {
        setShowResult(true)
      }, 300)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true)
    
    try {
      // 診断結果をローカルストレージに保存
      localStorage.setItem('diagnosisAnswers', JSON.stringify(answers))
      localStorage.setItem('diagnosisCompleted', 'true')
      
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
        setIsLoggingIn(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('ログインに失敗しました')
      setIsLoggingIn(false)
    }
  }

  const getRecommendedCategories = () => {
    const interest = answers.interest
    const experience = answers.experience
    
    // メインの興味に基づいてカテゴリーを推薦
    const mainCategory = questions[0].options.find(opt => opt.value === interest)?.category || 'AIライティング'
    
    // 経験レベルに基づいて追加の推薦
    const additionalCategories = experience === 'beginner' 
      ? ['AIチャット', 'AIライティング']
      : experience === 'advanced'
      ? ['AI自動化', 'AI分析・予測']
      : ['AIコーディング', 'AI画像生成']
    
    return [mainCategory, ...additionalCategories.filter(cat => cat !== mainCategory)].slice(0, 3)
  }

  const progress = showResult ? 100 : ((currentQuestion + 1) / questions.length) * 100

  if (showResult) {
    const recommendedCategories = getRecommendedCategories()
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold text-center mb-2">診断完了！</h2>
            <p className="text-center text-white/90 text-sm">あなたにぴったりのAI学習プランが見つかりました</p>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">おすすめのカテゴリー</h3>
            
            <div className="space-y-3 mb-6">
              {recommendedCategories.map((category, index) => {
                const categoryData = [
                  { name: 'AIライティング', icon: PenTool, color: 'from-blue-500 to-cyan-600', description: 'ChatGPT・Claudeで文章作成を効率化' },
                  { name: 'AI動画生成', icon: Video, color: 'from-purple-500 to-pink-600', description: 'Runway・Pikaで動画制作' },
                  { name: 'AIコーディング', icon: Code, color: 'from-green-500 to-emerald-600', description: 'GitHub Copilot・Cursorでコーディング' },
                  { name: 'AI画像生成', icon: Image, color: 'from-orange-500 to-red-600', description: 'Midjourney・DALL-Eでイラスト作成' },
                  { name: 'AI音声・音楽', icon: Mic, color: 'from-pink-500 to-rose-600', description: 'ElevenLabs・Sunoで音声制作' },
                  { name: 'AIチャット', icon: Brain, color: 'from-indigo-500 to-blue-600', description: 'ChatGPT・Geminiで対話' },
                  { name: 'AI分析・予測', icon: Brain, color: 'from-teal-500 to-cyan-600', description: 'データ分析と予測' },
                  { name: 'AI自動化', icon: Sparkles, color: 'from-yellow-500 to-amber-600', description: 'Zapier・Makeで業務自動化' },
                ].find(cat => cat.name === category) || { name: category, icon: Sparkles, color: 'from-gray-500 to-gray-600', description: '' }
                
                const Icon = categoryData.icon
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className={`w-10 h-10 bg-gradient-to-br ${categoryData.color} rounded-lg flex items-center justify-center text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{categoryData.name}</h4>
                      <p className="text-xs text-gray-600">{categoryData.description}</p>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                        おすすめ
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>無料で始める</span>
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isLoggingIn}
              >
                後で始める
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Question Number */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 font-medium">
              質問 {currentQuestion + 1} / {questions.length}
            </span>
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                前の質問
              </button>
            )}
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-150 text-left"
                >
                  {Icon && (
                    <div className="w-9 h-9 bg-gray-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors flex-1">
                    {option.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}