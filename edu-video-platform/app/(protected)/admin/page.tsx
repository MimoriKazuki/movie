import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VideoList } from '@/components/admin/video-list'
import { Plus, BarChart } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: stats } = await supabase
    .from('videos')
    .select('view_count')

  const totalViews = stats?.reduce((acc, video) => acc + video.view_count, 0) || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
        <Link
          href="/admin/videos/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新規動画追加
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">総動画数</p>
              <p className="text-3xl font-bold">{videos?.length || 0}</p>
            </div>
            <BarChart className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">総視聴回数</p>
              <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
            </div>
            <BarChart className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">公開中の動画</p>
              <p className="text-3xl font-bold">
                {videos?.filter(v => v.is_published).length || 0}
              </p>
            </div>
            <BarChart className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      <VideoList videos={videos || []} />
    </div>
  )
}