import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { ViewHistory } from '@/types/database'

export default async function ViewHistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // すべての視聴履歴を取得
  const { data: allHistory, error } = await supabase
    .from('view_history')
    .select(`
      *,
      video:videos(*)
    `)
    .eq('user_id', user.id)
    .order('last_viewed_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">視聴履歴</h1>
          <p className="text-gray-600 mt-2">最近視聴した動画の一覧です</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">エラーが発生しました: {error.message}</p>
          </div>
        )}

        {!allHistory || allHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">まだ視聴履歴がありません</p>
            <p className="text-gray-400 mt-2">動画を視聴すると、ここに履歴が表示されます</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allHistory.map((history: ViewHistory) => (
              <VideoCardWithHistory
                key={history.id}
                video={history.video!}
                progress={history.progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}