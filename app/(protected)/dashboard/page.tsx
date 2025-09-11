import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HeroSection from '@/components/dashboard/hero-section'
import CategoryCards from '@/components/dashboard/category-cards'
import FeaturedCourses from '@/components/dashboard/featured-courses'
import LearningProgress from '@/components/dashboard/learning-progress'
import RecentActivity from '@/components/dashboard/recent-activity'
import LearningStats from '@/components/dashboard/learning-stats'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <HeroSection userName={profile?.display_name || 'ユーザー'} />
      
      {/* カテゴリーカード - 生成AIカテゴリー */}
      <div className="bg-gray-50 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryCards userId={user.id} isAdmin={profile?.role === 'admin'} />
        </div>
      </div>
      
      {/* 学習データセクション */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <LearningStats userId={user.id} />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: おすすめコースと学習進捗 */}
          <div className="lg:col-span-2 space-y-8">
            <FeaturedCourses userId={user.id} isAdmin={profile?.role === 'admin'} />
            <LearningProgress userId={user.id} />
          </div>
          
          {/* 右側: 最近のアクティビティ */}
          <div>
            <RecentActivity userId={user.id} />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}