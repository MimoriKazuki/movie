import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'

export async function FavoriteVideos({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      *,
      video:videos(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  // Get user's view history for progress
  let viewHistory: Record<string, number> = {}
  if (favorites && favorites.length > 0) {
    const videoIds = favorites.map(f => f.video_id)
    const { data: history } = await supabase
      .from('view_history')
      .select('video_id, progress')
      .eq('user_id', userId)
      .in('video_id', videoIds)
    
    if (history) {
      viewHistory = history.reduce((acc, item) => {
        acc[item.video_id] = item.progress
        return acc
      }, {} as Record<string, number>)
    }
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">お気に入りの動画はまだありません</p>
        <p className="text-gray-400 mt-2">動画をお気に入りに追加すると、ここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => (
        <VideoCardWithHistory 
          key={favorite.id} 
          video={favorite.video} 
          progress={viewHistory[favorite.video_id] || 0}
        />
      ))}
    </div>
  )
}