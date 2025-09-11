'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Image, Video, Music, FileText, Code, Star, ShoppingCart, Eye, Filter, Search, TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceRow } from '@/components/ui/PriceRow'
import { ContentGrid } from '@/components/ui/ContentGrid'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { UnifiedSearch } from '@/components/search/unified-search'

interface Prompt {
  id: string
  title: string
  description: string | null
  category: string
  ai_tool: string
  price: number
  example_images: string[] | null
  tags: string[] | null
  usage_count: number
  rating: number
  is_featured: boolean
  created_at: string
  seller?: {
    name: string | null
    avatar_url: string | null
  }
  purchases?: { count: number }[]
  reviews?: { rating: number }[]
}

interface PromptMarketplaceProps {
  prompts: Prompt[]
  purchasedPromptIds: string[]
}

const categoryIcons = {
  image: Image,
  video: Video,
  music: Music,
  text: FileText,
  code: Code
}

const categoryNames = {
  image: '画像生成',
  video: '動画生成',
  music: '音楽生成',
  text: 'テキスト生成',
  code: 'コード生成'
}

export function PromptMarketplace({ prompts, purchasedPromptIds }: PromptMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTool, setSelectedTool] = useState<string>('')
  const [priceRange, setPriceRange] = useState<string>('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating' | 'price-low' | 'price-high'>('newest')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  // フィルタリング
  let filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchTerm || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTool = !selectedTool || prompt.ai_tool === selectedTool
    const matchesFeatured = !showFeaturedOnly || prompt.is_featured
    
    // 価格帯フィルター
    let matchesPrice = true
    if (priceRange) {
      if (priceRange === 'free') {
        matchesPrice = prompt.price === 0
      } else if (priceRange === '0-1000') {
        matchesPrice = prompt.price >= 0 && prompt.price <= 1000
      } else if (priceRange === '1000-5000') {
        matchesPrice = prompt.price > 1000 && prompt.price <= 5000
      } else if (priceRange === '5000-10000') {
        matchesPrice = prompt.price > 5000 && prompt.price <= 10000
      } else if (priceRange === '10000+') {
        matchesPrice = prompt.price > 10000
      }
    }
    
    return matchesSearch && matchesTool && matchesFeatured && matchesPrice
  })

  // ソート
  filteredPrompts = [...filteredPrompts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.purchases?.[0]?.count || 0) - (a.purchases?.[0]?.count || 0)
      case 'rating':
        const avgRatingA = a.reviews?.length ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0
        const avgRatingB = b.reviews?.length ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0
        return avgRatingB - avgRatingA
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const calculateAverageRating = (reviews: { rating: number }[] | undefined) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }

  // 利用可能なAIツールを取得してフォーマット
  const availableTools = [...new Set(prompts.map(p => p.ai_tool))].map(tool => ({
    value: tool,
    label: tool
  }))

  const handleSearch = (query: string, category: string) => {
    setSearchTerm(query)
    setSelectedTool(category)
  }

  return (
    <div>
      {/* 統一された検索UI */}
      <UnifiedSearch
        onSearch={handleSearch}
        placeholder="プロンプトを検索..."
        categories={availableTools}
      />

      {/* ソートとフィルター */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-300"
          >
            <option value="newest">新着順</option>
            <option value="popular">人気順</option>
            <option value="rating">評価順</option>
            <option value="price-low">価格: 安い順</option>
            <option value="price-high">価格: 高い順</option>
          </select>

          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={cn(
              'px-3 py-2 text-sm rounded-xl transition-colors flex items-center gap-1.5',
              showFeaturedOnly
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            )}
          >
            <Star className="w-3.5 h-3.5" />
            おすすめ
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {filteredPrompts.length}件
        </p>
      </div>

      {/* プロンプトグリッド */}
      <ContentGrid>
        {filteredPrompts.map((prompt) => {
          const Icon = categoryIcons[prompt.category as keyof typeof categoryIcons] || FileText
          const categoryName = categoryNames[prompt.category as keyof typeof categoryNames] || 'その他'
          const avgRating = calculateAverageRating(prompt.reviews)
          const isPurchased = purchasedPromptIds.includes(prompt.id)
          
          return (
            <Link key={prompt.id} href={`/prompts/${prompt.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full">
                {/* サムネイル */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                  {prompt.example_images && prompt.example_images[0] ? (
                    <SmartImage
                      src={prompt.example_images[0]}
                      alt={prompt.title}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                      <div className="bg-white/90 p-4 rounded-full">
                        <Icon className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay with icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="p-4 bg-white/95 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-gray-900" />
                    </div>
                  </div>
                  
                  {/* バッジ - 必要な場合のみ表示 */}
                  {(prompt.is_featured || isPurchased) && (
                    <div className="absolute top-3 left-3 flex gap-2">
                      {prompt.is_featured && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                          おすすめ
                        </span>
                      )}
                      {isPurchased && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          購入済み
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* コンテンツ */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* タイトル - exactly 2 lines */}
                  <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 min-h-[2.75rem] mb-3 hover:text-blue-600 transition-colors">
                    {prompt.title}
                  </h3>

                  {/* Metadata - fixed position */}
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{prompt.ai_tool}</span>
                      </div>
                      {avgRating > 0 && (
                        <span className="flex items-center gap-1 text-xs">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                          {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    {/* Tags - fixed height */}
                    <div className="h-6">
                      {prompt.tags && prompt.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="h-6" /> // Placeholder for alignment
                      )}
                    </div>
                  </div>
                </div>
                <PriceRow price={prompt.price} freeLabel="無料で利用可能" leftLabel="価格" />
              </div>
            </Link>
          )
        })}
      </ContentGrid>

      {/* 結果なし */}
      {filteredPrompts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            プロンプトが見つかりません
          </h3>
          <p className="text-gray-600">
            検索条件を変更してもう一度お試しください
          </p>
        </div>
      )}
    </div>
  )
}
