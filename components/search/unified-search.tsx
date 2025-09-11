'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface UnifiedSearchProps {
  onSearch: (query: string, category: string) => void
  placeholder?: string
  categories?: Array<{ value: string; label: string }>
  showCategories?: boolean
}

export function UnifiedSearch({ 
  onSearch, 
  placeholder = '検索...',
  categories = [],
  showCategories = true
}: UnifiedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    onSearch(searchQuery, selectedCategory)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSelectedCategory('')
    onSearch('', '')
  }

  const hasFilters = searchQuery || selectedCategory

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center bg-white rounded-2xl shadow-sm border transition-all ${
          isFocused ? 'border-gray-300 shadow-md' : 'border-gray-200'
        }`}>
          {/* 検索アイコン */}
          <div className="pl-5 pr-2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          {/* 検索入力 */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 py-3.5 pr-2 text-gray-900 placeholder-gray-500 bg-transparent outline-none"
          />

          {/* カテゴリー選択 */}
          {showCategories && categories.length > 0 && (
            <>
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm text-gray-700 bg-transparent outline-none cursor-pointer hover:text-gray-900"
              >
                <option value="">すべて</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* クリアボタン */}
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* 検索ボタン */}
          <button
            type="submit"
            className="px-6 py-2 m-1.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            検索
          </button>
        </div>
      </form>

      {/* アクティブフィルター */}
      {hasFilters && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">検索中:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
              {searchQuery}
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
              {categories.find(c => c.value === selectedCategory)?.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}