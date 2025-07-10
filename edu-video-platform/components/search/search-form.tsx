'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SearchFormProps {
  initialQuery?: string
  initialGenre?: string
  initialTags?: string
}

export function SearchForm({ initialQuery = '', initialGenre = '', initialTags = '' }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [genre, setGenre] = useState(initialGenre)
  const [tags, setTags] = useState(initialTags)
  const [genres, setGenres] = useState<Array<{id: string, name: string}>>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    // ジャンルマスタから取得
    const { data: genreData } = await supabase
      .from('genres')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order')
      
    if (genreData) {
      setGenres(genreData)
    }
    
    // 使用されているタグを取得
    const { data: videos } = await supabase
      .from('videos')
      .select('tags')
      .eq('is_published', true)

    if (videos) {
      const uniqueTags = [...new Set(videos.flatMap(v => v.tags || []))]
      setAllTags(uniqueTags)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (query) params.set('q', query)
    if (genre) params.set('genre', genre)
    if (tags) params.set('tags', tags)
    
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setQuery('')
    setGenre('')
    setTags('')
    router.push('/search')
  }

  const hasFilters = query || genre || tags

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="タイトルや説明を検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            検索
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ジャンル
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="">すべてのジャンル</option>
              {genres.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <select
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="">すべてのタグ</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors w-full"
              >
                <X className="w-4 h-4" />
                フィルターをクリア
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}