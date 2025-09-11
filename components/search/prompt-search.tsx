'use client'

import { useState } from 'react'
import { Search, Filter, X, Sparkles } from 'lucide-react'

interface PromptSearchProps {
  onSearch: (query: string, category: string, priceRange: string) => void
  categories?: string[]
}

export function PromptSearch({ onSearch, categories = [] }: PromptSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(searchQuery, selectedCategory, priceRange)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceRange('')
    onSearch('', '', '')
  }

  // プロンプト用のAIカテゴリー
  const defaultCategories = [
    'ChatGPT',
    'Claude',
    'Gemini',
    'Midjourney',
    'Stable Diffusion',
    'DALL-E',
    'GitHub Copilot',
    'Perplexity AI',
    'ライティング支援',
    'コード生成',
    '画像生成',
    '動画生成',
    'データ分析',
    'マーケティング',
    'SEO対策',
    'その他'
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  const priceRanges = [
    { value: 'free', label: '無料' },
    { value: '0-1000', label: '¥0 - ¥1,000' },
    { value: '1000-5000', label: '¥1,000 - ¥5,000' },
    { value: '5000-10000', label: '¥5,000 - ¥10,000' },
    { value: '10000+', label: '¥10,000以上' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">プロンプトを検索</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* 検索バー */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="用途やキーワードで検索..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* フィルターボタン（モバイル） */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          フィルター
          {(selectedCategory || priceRange) && (
            <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-xs">
              {[selectedCategory, priceRange].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* カテゴリー選択（デスクトップ） */}
        <div className="hidden lg:flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">すべてのAI</option>
            <optgroup label="主要AI">
              {displayCategories.slice(0, 8).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </optgroup>
            <optgroup label="用途別">
              {displayCategories.slice(8).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </optgroup>
          </select>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">価格帯</option>
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
        >
          検索
        </button>

        {/* クリアボタン */}
        {(searchQuery || selectedCategory || priceRange) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* モバイル用フィルター */}
      {showFilters && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI/用途
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">すべてのAI</option>
              {displayCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              価格帯
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">すべての価格</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* アクティブフィルター表示 */}
      {(searchQuery || selectedCategory || priceRange) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              検索: {searchQuery}
              <button
                onClick={() => {
                  setSearchQuery('')
                  onSearch('', selectedCategory, priceRange)
                }}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              AI: {selectedCategory}
              <button
                onClick={() => {
                  setSelectedCategory('')
                  onSearch(searchQuery, '', priceRange)
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priceRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              価格: {priceRanges.find(r => r.value === priceRange)?.label}
              <button
                onClick={() => {
                  setPriceRange('')
                  onSearch(searchQuery, selectedCategory, '')
                }}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}