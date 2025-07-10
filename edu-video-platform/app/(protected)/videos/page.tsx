import { createClient } from '@/lib/supabase/server'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default async function VideosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get videos with user's view history
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">すべての動画</h1>
            <p className="text-gray-600 mt-2">最新の教育動画をチェックしましょう</p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            詳細検索
          </Link>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCardWithHistory 
                key={video.id} 
                video={video} 
                progress={viewHistory[video.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">動画がまだありません</p>
            <p className="text-gray-400 mt-2">新しい動画が追加されるまでお待ちください</p>
          </div>
        )}
      </div>
    </div>
  )
}