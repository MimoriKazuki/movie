import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Package, TrendingUp, DollarSign, Star } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { PromptList } from '@/components/admin/prompt-list'

export default async function AdminPromptsPage() {
  const supabase = await createClient()
  
  // データ取得
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })

  // 統計情報の計算
  const totalPrompts = prompts?.length || 0
  const publishedPrompts = prompts?.filter(p => p.is_published).length || 0
  const totalSales = 0 // 一時的に0に設定
  const totalRevenue = 0 // 一時的に0に設定

  // 直近7日間のプロンプト数
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentPrompts = prompts?.filter(p => 
    new Date(p.created_at) > sevenDaysAgo
  ).length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <PageHeader
          title="プロンプト管理"
          description="AIプロンプトの販売と管理"
          actions={
            <Link href="/admin/prompts/new">
              <Button icon={Plus}>
                新規プロンプト追加
              </Button>
            </Link>
          }
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総プロンプト数"
            value={totalPrompts}
            icon={Package}
            color="blue"
            description="登録済みプロンプト"
            trend={recentPrompts > 0 ? {
              value: Math.round((recentPrompts / totalPrompts) * 100),
              isPositive: true
            } : undefined}
          />
          
          <StatCard
            title="公開中"
            value={publishedPrompts}
            icon={TrendingUp}
            color="green"
            description={`${Math.round((publishedPrompts / totalPrompts) * 100)}% が公開中`}
          />
          
          <StatCard
            title="総販売数"
            value={totalSales}
            icon={Star}
            color="purple"
            description="累計販売数"
          />
          
          <StatCard
            title="総売上"
            value={`¥${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="yellow"
            description="累計売上金額"
          />
        </div>

        {/* プロンプトリスト */}
        <PromptList prompts={prompts || []} />
      </div>
    </div>
  )
}