import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { Database } from '@/types/database'

type Video = Database['public']['Tables']['videos']['Row']

interface SearchResultsProps {
  query?: string
  genre?: string
  tags?: string
}

export async function SearchResults({ query, genre, tags }: SearchResultsProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let searchQuery = supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (query) {
    searchQuery = searchQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }

  if (genre) {
    searchQuery = searchQuery.eq('genre', genre)
  }

  if (tags) {
    searchQuery = searchQuery.contains('tags', [tags])
  }

  const { data: videos } = await searchQuery
  
  // Get user's view history if logged in
  let viewHistory: Record<string, number> = {}
  if (user && videos) {
    const videoIds = videos.map(v => v.id)
    const { data: history } = await supabase
      .from('view_history')
      .select('video_id, progress')
      .eq('user_id', user.id)
      .in('video_id', videoIds)
    
    if (history) {
      viewHistory = history.reduce((acc, item) => {
        acc[item.video_id] = item.progress
        return acc
      }, {} as Record<string, number>)
    }
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-lg">検索結果が見つかりませんでした</p>
        <p className="text-gray-400 mt-2">別のキーワードやフィルターでお試しください</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <p className="text-gray-600 mb-6">{videos.length}件の動画が見つかりました</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCardWithHistory 
            key={video.id} 
            video={video} 
            progress={viewHistory[video.id] || 0}
          />
        ))}
      </div>
    </div>
  )
}