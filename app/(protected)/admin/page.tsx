import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { VideoList } from '@/components/admin/video-list'
import { Plus, TrendingUp, Video, Eye, CheckCircle, BookOpen, DollarSign, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // データ取得
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: stats } = await supabase
    .from('videos')
    .select('view_count')

  // 収益データ取得
  const { data: videoRevenue } = await supabase
    .from('video_purchases')
    .select('video_id, price_paid, created_at')
    .eq('status', 'active')

  const { data: courseRevenue } = await supabase
    .from('course_purchases')
    .select('course_id, price_paid, created_at:purchased_at')
    .eq('status', 'active')

  const { data: promptRevenue } = await supabase
    .from('prompt_purchases')
    .select('prompt_id, price, created_at:purchased_at')

  // 統計情報の計算
  const totalViews = stats?.reduce((acc, video) => acc + video.view_count, 0) || 0
  const totalVideos = videos?.length || 0
  const publishedVideos = videos?.filter(v => v.is_published).length || 0
  
  // 直近7日間の動画数を計算
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentVideos = videos?.filter(v => 
    new Date(v.created_at) > sevenDaysAgo
  ).length || 0

  // 収益集計
  const totalRevenue =
    (videoRevenue?.reduce((s, r) => s + (r.price_paid || 0), 0) || 0) +
    (courseRevenue?.reduce((s, r) => s + (r.price_paid || 0), 0) || 0) +
    (promptRevenue?.reduce((s, r) => s + (r.price || 0), 0) || 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0,0,0,0)
  const monthlyRevenue =
    (videoRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price_paid || 0), 0) || 0) +
    (courseRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price_paid || 0), 0) || 0) +
    (promptRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price || 0), 0) || 0)

  // 内訳集計
  const videoRevenueTotal = videoRevenue?.reduce((s, r) => s + (r.price_paid || 0), 0) || 0
  const courseRevenueTotal = courseRevenue?.reduce((s, r) => s + (r.price_paid || 0), 0) || 0
  const promptRevenueTotal = promptRevenue?.reduce((s, r) => s + (r.price || 0), 0) || 0

  const videoRevenueMonthly = videoRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price_paid || 0), 0) || 0
  const courseRevenueMonthly = courseRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price_paid || 0), 0) || 0
  const promptRevenueMonthly = promptRevenue?.filter(r => new Date(r.created_at) >= startOfMonth).reduce((s, r) => s + (r.price || 0), 0) || 0

  // ランキング用データ取得
  const videoIds = Array.from(new Set((videoRevenue || []).map(v => v.video_id).filter(Boolean)))
  const courseIds = Array.from(new Set((courseRevenue || []).map(c => c.course_id).filter(Boolean)))
  const promptIds = Array.from(new Set((promptRevenue || []).map(p => p.prompt_id).filter(Boolean)))

  const { data: videoTitles } = videoIds.length > 0
    ? await supabase.from('videos').select('id, title').in('id', videoIds)
    : { data: [] as Array<{ id: string; title: string }>, error: null } as const

  const { data: courseTitles } = courseIds.length > 0
    ? await supabase.from('courses').select('id, title').in('id', courseIds)
    : { data: [] as Array<{ id: string; title: string }>, error: null } as const

  const { data: promptTitles } = promptIds.length > 0
    ? await supabase.from('prompts').select('id, title').in('id', promptIds)
    : { data: [] as Array<{ id: string; title: string }>, error: null } as const

  const videoTitleMap = new Map((videoTitles || []).map(v => [v.id, v.title]))
  const courseTitleMap = new Map((courseTitles || []).map(c => [c.id, c.title]))
  const promptTitleMap = new Map((promptTitles || []).map(p => [p.id, p.title]))

  const rankVideos = Object.values(
    (videoRevenue || []).reduce((acc: any, r: any) => {
      if (!r.video_id) return acc
      const key = r.video_id
      if (!acc[key]) acc[key] = { id: key, title: videoTitleMap.get(key) || '(不明な動画)', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price_paid || 0
      return acc
    }, {})
  ).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5)

  const rankCourses = Object.values(
    (courseRevenue || []).reduce((acc: any, r: any) => {
      if (!r.course_id) return acc
      const key = r.course_id
      if (!acc[key]) acc[key] = { id: key, title: courseTitleMap.get(key) || '(不明なコース)', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price_paid || 0
      return acc
    }, {})
  ).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5)

  const rankPrompts = Object.values(
    (promptRevenue || []).reduce((acc: any, r: any) => {
      if (!r.prompt_id) return acc
      const key = r.prompt_id
      if (!acc[key]) acc[key] = { id: key, title: promptTitleMap.get(key) || '(不明なプロンプト)', count: 0, revenue: 0 }
      acc[key].count += 1
      acc[key].revenue += r.price || 0
      return acc
    }, {})
  ).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <PageHeader
          title="管理者ダッシュボード"
          description="動画コンテンツの管理と分析"
          actions={
            <>
              <Link href="/admin/courses">
                <Button variant="secondary" icon={BookOpen}>
                  コース管理
                </Button>
              </Link>
              <Link href="/admin/prompts">
                <Button variant="secondary" icon={Plus}>
                  プロンプト管理
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="success" icon={TrendingUp}>
                  分析
                </Button>
              </Link>
              <Link href="/admin/videos/new">
                <Button icon={Plus}>
                  新規動画追加
                </Button>
              </Link>
            </>
          }
        />

        {/* 売上サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <StatCard
            title="総売上"
            value={`¥${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            description="動画・コース・プロンプト合計"
          />
          <StatCard
            title="今月の売上"
            value={`¥${monthlyRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="yellow"
            description="当月の確定売上"
          />
        </div>

        {/* CSVエクスポート */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/api/admin/export/revenue?category=all&range=30d"
            className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm hover:bg-gray-900"
          >
            CSVエクスポート（全体・30日）
          </a>
          <a
            href="/api/admin/export/revenue-breakdown?range=30d"
            className="px-3 py-2 rounded-lg bg-gray-600 text-white text-sm hover:bg-gray-700"
          >
            内訳（日次）CSV（30日）
          </a>
          <a
            href="/api/admin/export/revenue-ranking?category=all&range=30d&limit=100"
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            ランキングCSV（全体・30日）
          </a>
          <a
            href="/api/admin/export/revenue?category=video&range=30d"
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            動画のみ（30日）
          </a>
          <a
            href="/api/admin/export/revenue?category=course&range=30d"
            className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
          >
            コースのみ（30日）
          </a>
          <a
            href="/api/admin/export/revenue?category=prompt&range=30d"
            className="px-3 py-2 rounded-lg bg-yellow-600 text-white text-sm hover:bg-yellow-700"
          >
            プロンプトのみ（30日）
          </a>
        </div>

        {/* 売上内訳 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="動画売上（総額）"
            value={`¥${videoRevenueTotal.toLocaleString()}`}
            icon={Video}
            color="blue"
            description={`今月: ¥${videoRevenueMonthly.toLocaleString()}`}
          />
          <StatCard
            title="コース売上（総額）"
            value={`¥${courseRevenueTotal.toLocaleString()}`}
            icon={BookOpen}
            color="purple"
            description={`今月: ¥${courseRevenueMonthly.toLocaleString()}`}
          />
          <StatCard
            title="プロンプト売上（総額）"
            value={`¥${promptRevenueTotal.toLocaleString()}`}
            icon={Sparkles}
            color="yellow"
            description={`今月: ¥${promptRevenueMonthly.toLocaleString()}`}
          />
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総動画数"
            value={totalVideos}
            icon={Video}
            color="blue"
            description="全ての動画コンテンツ"
            trend={recentVideos > 0 ? {
              value: Math.round((recentVideos / totalVideos) * 100),
              isPositive: true
            } : undefined}
          />
          
          <StatCard
            title="総視聴回数"
            value={totalViews}
            icon={Eye}
            color="green"
            description="累計視聴数"
          />
          
          <StatCard
            title="公開中の動画"
            value={publishedVideos}
            icon={CheckCircle}
            color="purple"
            description={`${Math.round((publishedVideos / totalVideos) * 100)}% が公開中`}
          />
          
          <StatCard
            title="今週の新規"
            value={recentVideos}
            icon={TrendingUp}
            color="yellow"
            description="過去7日間に追加"
          />
        </div>

        {/* 動画リスト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ランキング: 動画 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">売上ランキング（動画）</h3>
            {rankVideos.length === 0 ? (
              <p className="text-gray-500">データがありません</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-2">タイトル</th>
                    <th className="text-right py-2">本数</th>
                    <th className="text-right py-2">売上</th>
                  </tr>
                </thead>
                <tbody>
                  {rankVideos.map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-2 pr-2">
                        <a className="text-blue-600 hover:underline" href={`/admin/videos/${item.id}/edit`}>
                          {item.title}
                        </a>
                      </td>
                      <td className="py-2 text-right">{item.count.toLocaleString()}</td>
                      <td className="py-2 text-right">¥{item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ランキング: プロンプト */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">売上ランキング（プロンプト）</h3>
            {rankPrompts.length === 0 ? (
              <p className="text-gray-500">データがありません</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-2">タイトル</th>
                    <th className="text-right py-2">本数</th>
                    <th className="text-right py-2">売上</th>
                  </tr>
                </thead>
                <tbody>
                  {rankPrompts.map((item: any) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-2 pr-2">
                        <a className="text-blue-600 hover:underline" href={`/admin/prompts/${item.id}/edit`}>
                          {item.title}
                        </a>
                      </td>
                      <td className="py-2 text-right">{item.count.toLocaleString()}</td>
                      <td className="py-2 text-right">¥{item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ランキング: コース */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold mb-4">売上ランキング（コース）</h3>
          {rankCourses.length === 0 ? (
            <p className="text-gray-500">データがありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-2">タイトル</th>
                  <th className="text-right py-2">本数</th>
                  <th className="text-right py-2">売上</th>
                </tr>
              </thead>
              <tbody>
                {rankCourses.map((item: any) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-2 pr-2">
                      <a className="text-blue-600 hover:underline" href={`/admin/courses/${item.id}`}>{item.title}</a>
                    </td>
                    <td className="py-2 text-right">{item.count.toLocaleString()}</td>
                    <td className="py-2 text-right">¥{item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 動画リスト */}
        <VideoList videos={videos || []} />
      </div>
    </div>
  )
}
