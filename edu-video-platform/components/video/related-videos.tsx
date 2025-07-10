import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from './video-card-with-history'
import { Database } from '@/types/database'

type Video = Database['public']['Tables']['videos']['Row']

interface RelatedVideosProps {
  currentVideoId: string
  genre?: string | null
  tags?: string[] | null
}

export async function RelatedVideos({ currentVideoId, genre, tags }: RelatedVideosProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let query = supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .neq('id', currentVideoId)
    .limit(5)

  if (genre) {
    query = query.eq('genre', genre)
  }

  const { data: videos } = await query
  
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">関連動画</h2>
      <div className="space-y-3">
        {videos?.map((video) => (
          <VideoCardWithHistory 
            key={video.id} 
            video={video} 
            variant="compact" 
            progress={viewHistory[video.id] || 0}
          />
        ))}
      </div>
    </div>
  )
}