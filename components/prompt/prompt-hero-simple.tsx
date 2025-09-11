'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PromptHeroProps {
  prompt: {
    title: string
    description?: string | null
    category?: string | null
    ai_tool?: string | null
    price: number
  }
}

export default function PromptHeroSimple({ prompt }: PromptHeroProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation */}
        <Link 
          href="/prompts" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          プロンプト一覧に戻る
        </Link>

        <div className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {prompt.title}
          </h1>
          
          {prompt.description && (
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {prompt.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            {prompt.category && (
              <span>カテゴリー: {prompt.category}</span>
            )}
            {prompt.ai_tool && (
              <span>対応AI: {prompt.ai_tool}</span>
            )}
            <span>価格: ¥{prompt.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}