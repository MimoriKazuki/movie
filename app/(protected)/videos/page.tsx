import { createClient } from '@/lib/supabase/server'
import { VideoListWithSearch } from '@/components/video/video-list-with-search'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function VideosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 全ての公開動画を取得（カテゴリーとタグも含む）
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  // Get user's view history if logged in
  let viewHistory: Record<string, number> = {}
  if (user) {
    const { data: history } = await supabase
      .from('view_history')
      .select('video_id, progress')
      .eq('user_id', user.id)
    
    if (history) {
      viewHistory = history.reduce((acc, item) => {
        acc[item.video_id] = item.progress
        return acc
      }, {} as Record<string, number>)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="動画一覧"
          description="AIの種類やキーワードで動画を検索できます"
          variant="simple"
        />

        <VideoListWithSearch 
          videos={videos || []}
          viewHistory={viewHistory}
        />
      </div>
    </div>
  )
}
