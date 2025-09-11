import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { ViewHistory } from '@/types/database'

export default async function ContinueWatching({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  const isAdmin = profile?.role === 'admin'
  
  let viewHistory = null
  
  if (isAdmin) {
    // 管理者は全ての視聴履歴を見ることができる
    const { data } = await supabase
      .from('view_history')
      .select(`
        *,
        video:videos(*)
      `)
      .eq('user_id', userId)
      .order('last_viewed_at', { ascending: false })
      .limit(4)
    viewHistory = data
  } else {
    // 一般ユーザーは購入したコースの動画の視聴履歴のみ
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
          .from('view_history')
          .select(`
            *,
            video:videos(*)
          `)
          .eq('user_id', userId)
          .in('video_id', videoIds)
          .order('last_viewed_at', { ascending: false })
          .limit(4)
        viewHistory = data
      }
    }
  }

  if (!viewHistory || viewHistory.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        まだ視聴中の動画はありません
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {viewHistory.map((history: ViewHistory) => (
        <VideoCardWithHistory
          key={history.id}
          video={history.video!}
          progress={history.progress}
        />
      ))}
    </div>
  )
}