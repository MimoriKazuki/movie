import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 管理者権限チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/admin/login')
  }

  // 収益データを取得
  const { data: videoRevenue } = await supabase
    .from('video_purchases')
    .select('price_paid, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: courseRevenue } = await supabase
    .from('course_purchases')
    .select('price_paid, created_at:purchased_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: promptRevenue } = await supabase
    .from('prompt_purchases')
    .select('price, created_at:purchased_at')
    .order('created_at', { ascending: false })

  // ユーザー数の推移を取得
  const { data: users } = await supabase
    .from('profiles')
    .select('created_at')
    .order('created_at', { ascending: true })

  // 動画視聴データを取得
  const { data: viewHistory } = await supabase
    .from('view_history')
    .select(`
      video_id,
      user_id,
      created_at,
      progress,
      videos(title, duration)
    `)
    .order('created_at', { ascending: false })
    .limit(1000)

  // 人気動画ランキングを取得
  const { data: popularVideos } = await supabase
    .from('videos')
    .select('id, title, view_count, like_count')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(10)

  // アクティブユーザー数を取得（過去30日）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: activeUsers } = await supabase
    .from('view_history')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || [])

  // 集計データ
  const analytics = {
    revenue: {
      video: videoRevenue || [],
      course: courseRevenue || [],
      prompt: promptRevenue || [],
      total: 
        (videoRevenue?.reduce((sum, r) => sum + (r.price_paid || 0), 0) || 0) +
        (courseRevenue?.reduce((sum, r) => sum + (r.price_paid || 0), 0) || 0) +
        (promptRevenue?.reduce((sum, r) => sum + (r.price || 0), 0) || 0)
    },
    users: {
      total: users?.length || 0,
      active: uniqueActiveUsers.size,
      growth: users || []
    },
    videos: {
      popular: popularVideos || [],
      totalViews: viewHistory?.length || 0,
      completionRate: calculateCompletionRate(viewHistory || [])
    },
    viewHistory: viewHistory || []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">分析ダッシュボード</h1>
          <p className="text-gray-600 mt-2">システムの詳細な分析とレポート</p>
        </div>
        
        <AnalyticsDashboard analytics={analytics} />
      </div>
    </div>
  )
}

function calculateCompletionRate(viewHistory: any[]) {
  if (!viewHistory.length) return 0
  
  const completed = viewHistory.filter(v => {
    const duration = v.videos?.duration || 0
    return duration > 0 && v.progress >= duration * 0.8
  })
  
  return (completed.length / viewHistory.length) * 100
}
