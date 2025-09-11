'use client'

import { useState, useEffect } from 'react'
import { Cpu, Brain, Sparkles, Bot, Zap, Database, GitBranch, Activity, Code, Layers, Network, ChevronRight, Rocket } from 'lucide-react'
import { DiagnosisModal } from '@/components/diagnosis/diagnosis-modal'

interface HeroSectionProps {
  userName: string
}

export default function HeroSection({ userName }: HeroSectionProps) {
  const [greeting, setGreeting] = useState('')
  const [typedText, setTypedText] = useState('')
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false)
  const fullText = 'AIで最前線を走ろう'

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('おはようございます')
    } else if (hour < 18) {
      setGreeting('こんにちは')
    } else {
      setGreeting('こんばんは')
    }

    // タイピングアニメーション
    let index = 0
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden min-h-screen">
      {/* AIグリッド背景 */}
      <div className="absolute inset-0 w-full">
        {/* ニューラルネットワーク風の背景 */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1" fill="#6366f1" className="animate-pulse" />
              <line x1="50" y1="50" x2="100" y2="50" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="50" y2="100" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="#6366f1" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>

        {/* 浮遊する図形 */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-40 right-40 w-48 h-48 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative w-full px-8 lg:px-16 py-20 pb-32 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-[1920px] mx-auto">
          {/* 左側: テキストコンテンツ */}
          <div>
            
            <p className="text-gray-600 mb-3 text-lg">
              {greeting}、{userName}さん
            </p>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {typedText}
              </span>
              <span className="text-gray-400 animate-blink">|</span>
            </h1>
            
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              <span className="font-semibold">ChatGPT</span>、
              <span className="font-semibold">Claude</span>、
              <span className="font-semibold">GitHub Copilot</span>など
              最新のAIツールを使いこなし、
              業界の最前線で活躍するスキルを身につけましょう。
            </p>


          </div>

          {/* 右側: AIビジュアライゼーション */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px]">
              {/* 中央のAIカード群 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* メインカード */}
                  <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-80 transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-400">AI CORE</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      最前線のAI学習
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      業界トップレベルのAI技術を、実践的に学べるプラットフォーム
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Machine Learning
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Deep Learning
                      </span>
                    </div>
                  </div>

                  {/* サブカード */}
                  <div className="absolute -top-10 -left-20 bg-white rounded-xl shadow-lg p-4 w-48 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Code className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Python</p>
                        <p className="text-xs text-gray-500">基礎から応用まで</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-10 -right-20 bg-white rounded-xl shadow-lg p-4 w-48 animate-float-delayed">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Neural Network</p>
                        <p className="text-xs text-gray-500">実践的な構築</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-20 -right-32 bg-white rounded-xl shadow-lg p-4 w-48 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Big Data</p>
                        <p className="text-xs text-gray-500">データ分析入門</p>
                      </div>
                    </div>
                  </div>

                  {/* 装飾的な要素 */}
                  <div className="absolute -z-10 inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96">
                      <div className="absolute inset-0 border-2 border-gray-200 rounded-full opacity-20 animate-spin-slow" />
                      <div className="absolute inset-8 border-2 border-gray-200 rounded-full opacity-20 animate-spin-reverse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        .animate-blink {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
      
      {/* Diagnosis Modal */}
      <DiagnosisModal 
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
      />
    </div>
  )
}