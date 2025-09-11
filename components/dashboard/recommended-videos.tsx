import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { Video } from '@/types/database'

export default async function RecommendedVideos({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  const isAdmin = profile?.role === 'admin'
  
  let videos = null
  
  if (isAdmin) {
    // 管理者は全てのおすすめ動画を見ることができる
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .eq('is_recommended', true)
      .order('created_at', { ascending: false })
      .limit(4)
    videos = data
  } else {
    // 一般ユーザーは購入したコースのおすすめ動画のみ
    const { data: purchasedCourses } = await supabase
      .from('course_purchases')
      .select('course_id')
      .eq('user_id', userId)
    
    if (purchasedCourses && purchasedCourses.length > 0) {
      const courseIds = purchasedCourses.map(p => p.course_id)
      
      const { data: courseVideos } = await supabase
        .from('course_videos')
        .select('video_id')
        .in('course_id', courseIds)
      
      if (courseVideos && courseVideos.length > 0) {
        const videoIds = [...new Set(courseVideos.map(cv => cv.video_id))]
        
        const { data } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds)
          .eq('is_published', true)
          .eq('is_recommended', true)
          .order('created_at', { ascending: false })
          .limit(4)
        videos = data
      }
    }
  }
  
  // Get user's view history for progress
  let viewHistory: Record<string, number> = {}
  if (videos && videos.length > 0) {
    const videoIds = videos.map(v => v.id)
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

  if (!videos || videos.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        おすすめの動画が見つかりませんでした
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {videos.map((video: Video) => (
        <VideoCardWithHistory 
          key={video.id} 
          video={video} 
          progress={viewHistory[video.id] || 0}
        />
      ))}
    </div>
  )
}