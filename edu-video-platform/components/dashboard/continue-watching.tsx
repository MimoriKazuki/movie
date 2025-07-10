import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { ViewHistory } from '@/types/database'

export default async function ContinueWatching({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  const { data: viewHistory } = await supabase
    .from('view_history')
    .select(`
      *,
      video:videos(*)
    `)
    .eq('user_id', userId)
    .order('last_viewed_at', { ascending: false })
    .limit(4)

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