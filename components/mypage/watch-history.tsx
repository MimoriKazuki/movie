import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { ViewHistory } from '@/types/database'

export async function WatchHistory({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  const { data: history } = await supabase
    .from('view_history')
    .select(`
      *,
      video:videos(*)
    `)
    .eq('user_id', userId)
    .order('last_viewed_at', { ascending: false })

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">視聴履歴はまだありません</p>
        <p className="text-gray-400 mt-2">動画を視聴すると、ここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((item: ViewHistory) => (
        <VideoCardWithHistory
          key={item.id}
          video={item.video!}
          progress={item.progress}
        />
      ))}
    </div>
  )
}