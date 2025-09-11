'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

interface VideoSearchProps {
  onSearch: (query: string, category: string) => void
  categories?: string[]
}

export function VideoSearch({ onSearch, categories = [] }: VideoSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(searchQuery, selectedCategory)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    onSearch('', '')
  }

  // デフォルトのAIカテゴリー
  const defaultCategories = [
    '動画生成AI',
    'ライティングAI',
    '画像生成AI',
    'プログラミングAI',
    '音声AI',
    'チャットボット',
    '分析AI',
    'デザインAI',
    'その他'
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
              placeholder="キーワードで検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* フィルターボタン（モバイル） */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          フィルター
          {selectedCategory && (
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
              1
            </span>
          )}
        </button>

        {/* カテゴリー選択（デスクトップ） */}
        <div className="hidden lg:flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">すべてのカテゴリー</option>
            {displayCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          検索
        </button>

        {/* クリアボタン */}
        {(searchQuery || selectedCategory) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* モバイル用フィルター */}
      {showFilters && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリー
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">すべてのカテゴリー</option>
            {displayCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* アクティブフィルター表示 */}
      {(searchQuery || selectedCategory) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              検索: {searchQuery}
              <button
                onClick={() => {
                  setSearchQuery('')
                  onSearch('', selectedCategory)
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              カテゴリー: {selectedCategory}
              <button
                onClick={() => {
                  setSelectedCategory('')
                  onSearch(searchQuery, '')
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