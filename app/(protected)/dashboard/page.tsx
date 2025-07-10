import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContinueWatching from '@/components/dashboard/continue-watching'
import RecommendedVideos from '@/components/dashboard/recommended-videos'
import PopularVideos from '@/components/dashboard/popular-videos'
import NewVideos from '@/components/dashboard/new-videos'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">続きから視聴</h2>
        <ContinueWatching userId={user.id} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">おすすめ動画</h2>
        <RecommendedVideos userId={user.id} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">人気の動画</h2>
        <PopularVideos />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">新着動画</h2>
        <NewVideos />
      </section>
    </div>
  )
}