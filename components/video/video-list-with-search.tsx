'use client'

import { useState, useMemo } from 'react'
import { SimpleVideoCard } from './simple-video-card'
import { ContentGrid } from '@/components/ui/ContentGrid'
import { UnifiedSearch } from '@/components/search/unified-search'

interface VideoListWithSearchProps {
  videos: any[]
  viewHistory: Record<string, number>
}

export function VideoListWithSearch({ videos, viewHistory }: VideoListWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // 動画からカテゴリーを抽出してフォーマット
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    videos.forEach(video => {
      if (video.category) {
        categorySet.add(video.category)
      }
    })
    return Array.from(categorySet).sort().map(cat => ({
      value: cat,
      label: cat
    }))
  }, [videos])

  // 動画をフィルタリング
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      // カテゴリーフィルター
      if (selectedCategory && video.category !== selectedCategory) {
        return false
      }

      // キーワード検索
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const titleMatch = video.title?.toLowerCase().includes(query)
        const descriptionMatch = video.description?.toLowerCase().includes(query)
        const categoryMatch = video.category?.toLowerCase().includes(query)
        const tagsMatch = video.tags?.some((tag: string) => 
          tag.toLowerCase().includes(query)
        )
        
        return titleMatch || descriptionMatch || categoryMatch || tagsMatch
      }

      return true
    })
  }, [videos, searchQuery, selectedCategory])

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query)
    setSelectedCategory(category)
  }

  return (
    <div>
      <UnifiedSearch 
        onSearch={handleSearch}
        placeholder="動画を検索..."
        categories={categories}
      />

      {filteredVideos.length > 0 ? (
        <ContentGrid>
          {filteredVideos.map((video) => (
            <SimpleVideoCard 
              key={video.id} 
              video={video} 
              progress={viewHistory[video.id] || 0}
            />
          ))}
        </ContentGrid>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchQuery || selectedCategory 
              ? '検索条件に一致する動画が見つかりませんでした'
              : '動画がまだありません'}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => handleSearch('', '')}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              すべての動画を表示
            </button>
          )}
        </div>
      )}
    </div>
  )
}
