import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PenTool, Video, Code, Image, Mic, Brain, MessageSquare, Sparkles } from 'lucide-react'

interface CategoryCardsProps {
  userId: string
  isAdmin: boolean
}

const categories = [
  {
    title: 'AIライティング',
    subtitle: 'ChatGPT・Claude',
    count: '45万人',
    icon: PenTool,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    href: '/courses?category=writing',
    description: 'ブログ・記事・レポート作成'
  },
  {
    title: 'AI動画生成',
    subtitle: 'Runway・Pika',
    count: '38万人',
    icon: Video,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    href: '/courses?category=video',
    description: '動画制作・編集・アニメーション'
  },
  {
    title: 'AIコーディング',
    subtitle: 'GitHub Copilot・Cursor',
    count: '52万人',
    icon: Code,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
    href: '/courses?category=coding',
    description: 'プログラミング支援・自動化'
  },
  {
    title: 'AI画像生成',
    subtitle: 'Midjourney・DALL-E',
    count: '41万人',
    icon: Image,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    href: '/courses?category=image',
    description: 'イラスト・デザイン・アート'
  },
  {
    title: 'AI音声・音楽',
    subtitle: 'ElevenLabs・Suno',
    count: '28万人',
    icon: Mic,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    href: '/courses?category=audio',
    description: '音声合成・作曲・ナレーション'
  },
  {
    title: 'AIチャット',
    subtitle: 'ChatGPT・Gemini',
    count: '63万人',
    icon: MessageSquare,
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    href: '/courses?category=chat',
    description: '対話・カスタマーサポート'
  },
  {
    title: 'AI分析・予測',
    subtitle: 'TensorFlow・PyTorch',
    count: '31万人',
    icon: Brain,
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    href: '/courses?category=analysis',
    description: 'データ分析・機械学習'
  },
  {
    title: 'AI自動化',
    subtitle: 'Zapier・Make',
    count: '35万人',
    icon: Sparkles,
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    href: '/courses?category=automation',
    description: 'ワークフロー・業務効率化'
  },
]

export default async function CategoryCards({ userId, isAdmin }: CategoryCardsProps) {
  const supabase = await createClient()
  
  // 各カテゴリーのコース数を取得
  const categoryStats = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .ilike('title', `%${category.title.replace('AI', '')}%`)
      
      return {
        ...category,
        courseCount: count || 0
      }
    })
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">生成AIカテゴリー</h2>
          <p className="text-gray-600 mt-1">目的に合わせたAIツールの使い方を学ぼう</p>
        </div>
        <Link 
          href="/courses" 
          className="group inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 border border-blue-200 hover:border-transparent rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          すべて見る
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categoryStats.map((category, index) => {
          const Icon = category.icon
          return (
            <Link
              key={index}
              href={category.href}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:scale-105"
            >
              {/* 背景グラデーション効果 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* 上部のグラデーションライン */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              
              <div className="relative p-6">
                {/* アイコン */}
                <div className="relative mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity duration-500`} />
                  <div className={`relative ${category.bgColor} border border-gray-200/50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-md group-hover:shadow-xl`}>
                    <Icon className={`w-7 h-7 ${category.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </div>
                
                {/* タイトル */}
                <h3 className="font-bold text-gray-900 text-base mb-1.5 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {category.title}
                </h3>
                
                {/* サブタイトル（ツール名） */}
                <p className="text-xs font-medium text-gray-500 mb-2">
                  {category.subtitle}
                </p>
                
                {/* 説明 */}
                <p className="text-xs text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
                
                {/* 統計 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    {category.courseCount > 0 ? `${category.courseCount}コース` : category.count + '学習中'}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150`} />
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} opacity-40 group-hover:opacity-80 transition-all duration-300 delay-75 group-hover:scale-125`} />
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} opacity-20 group-hover:opacity-60 transition-all duration-300 delay-150`} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}