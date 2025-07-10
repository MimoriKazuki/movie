import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'

export default async function NewVideos() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4)
  
  // Get user's view history for progress
  let viewHistory: Record<string, number> = {}
  if (user && videos && videos.length > 0) {
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
      <div className="text-gray-500 text-center py-8">
        新着動画はまだありません
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCardWithHistory 
          key={video.id} 
          video={video} 
          progress={viewHistory[video.id] || 0}
        />
      ))}
    </div>
  )
}