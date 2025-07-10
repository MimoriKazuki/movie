import { Suspense } from 'react'
import { SearchForm } from '@/components/search/search-form'
import { SearchResults } from '@/components/search/search-results'

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; tags?: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">動画を検索</h1>
          <p className="text-gray-600 mt-2">キーワードやジャンルで動画を探しましょう</p>
        </div>
        
        <SearchForm 
          initialQuery={searchParams.q}
          initialGenre={searchParams.genre}
          initialTags={searchParams.tags}
        />

        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults
            query={searchParams.q}
            genre={searchParams.genre}
            tags={searchParams.tags}
          />
        </Suspense>
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}