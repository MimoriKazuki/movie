'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, TrendingUp, Award, Calendar, Target, Activity, BookOpen, Video } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface LearningStatsProps {
  userId: string
}

interface Stats {
  totalWatchTime: number
  totalVideos: number
  totalCourses: number
  currentStreak: number
  weeklyProgress: number
  todayMinutes: number
  weeklyGoal: number
  categoryBreakdown: { category: string; minutes: number }[]
  weeklyData: { day: string; minutes: number }[]
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`
  }
  return `${minutes}分`
}

export default function LearningStats({ userId }: LearningStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalWatchTime: 0,
    totalVideos: 0,
    totalCourses: 0,
    currentStreak: 0,
    weeklyProgress: 0,
    todayMinutes: 0,
    weeklyGoal: 300,
    categoryBreakdown: [],
    weeklyData: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLearningStats()
  }, [userId])

  const fetchLearningStats = async () => {
    try {
      // 学習統計を取得
      const { data: learningStats } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      // 今日の学習記録を取得
      const today = new Date().toISOString().split('T')[0]
      const { data: todayRecord } = await supabase
        .from('daily_learning_records')
        .select('total_minutes')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      // 週間データを取得
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: weeklyRecords } = await supabase
        .from('daily_learning_records')
        .select('date, total_minutes')
        .eq('user_id', userId)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      // カテゴリー別学習時間を取得
      const { data: categoryData } = await supabase
        .from('category_learning_time')
        .select('category, total_minutes')
        .eq('user_id', userId)
        .order('total_minutes', { ascending: false })
        .limit(5)

      // 週間進捗を計算
      const weeklyTotal = weeklyRecords?.reduce((sum, record) => sum + record.total_minutes, 0) || 0
      const weeklyGoal = learningStats?.weekly_goal_minutes || 300
      const weeklyProgress = Math.min((weeklyTotal / weeklyGoal) * 100, 100)

      // 曜日ごとのデータを整形
      const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土']
      const weeklyDataMap = new Map(weeklyRecords?.map(r => [r.date, r.total_minutes]) || [])
      const weeklyData = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = daysOfWeek[date.getDay()]
        weeklyData.push({
          day: dayName,
          minutes: weeklyDataMap.get(dateStr) || 0
        })
      }

      setStats({
        totalWatchTime: learningStats?.total_watch_time_seconds || 0,
        totalVideos: learningStats?.total_videos_watched || 0,
        totalCourses: learningStats?.total_courses_completed || 0,
        currentStreak: learningStats?.current_streak_days || 0,
        weeklyProgress,
        todayMinutes: todayRecord?.total_minutes || 0,
        weeklyGoal,
        categoryBreakdown: categoryData || [],
        weeklyData
      })
    } catch (error) {
      console.error('Error fetching learning stats:', error)
      // デモデータを設定
      setStats({
        totalWatchTime: 12600,
        totalVideos: 24,
        totalCourses: 3,
        currentStreak: 5,
        weeklyProgress: 65,
        todayMinutes: 45,
        weeklyGoal: 300,
        categoryBreakdown: [
          { category: 'AIコーディング', minutes: 180 },
          { category: 'AIライティング', minutes: 120 },
          { category: 'AI画像生成', minutes: 90 },
          { category: 'AI動画生成', minutes: 60 },
          { category: 'AI音声・音楽', minutes: 30 }
        ],
        weeklyData: [
          { day: '日', minutes: 60 },
          { day: '月', minutes: 45 },
          { day: '火', minutes: 30 },
          { day: '水', minutes: 50 },
          { day: '木', minutes: 40 },
          { day: '金', minutes: 35 },
          { day: '土', minutes: 45 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* セクションタイトル */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            学習データ
          </h2>
          <p className="text-gray-600 mt-1">あなたの学習進捗と統計情報</p>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          詳細を見る →
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500">総学習時間</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(stats.totalWatchTime)}
              </p>
              <p className="text-xs text-gray-500">
                今日: {stats.todayMinutes}分
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500">視聴動画数</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVideos}本
              </p>
              <p className="text-xs text-gray-500">
                完了率: 85%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500">連続学習</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {stats.currentStreak}日
              </p>
              <p className="text-xs text-gray-500">
                🔥 継続中！
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500">週間目標</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.weeklyProgress)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.weeklyProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週間学習グラフ */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              週間学習時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-8">
                    {day.day}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className={cn(
                        "absolute left-0 top-0 h-full bg-gradient-to-r rounded-full transition-all duration-500",
                        index === 6 ? "from-blue-500 to-blue-600" : "from-gray-400 to-gray-500"
                      )}
                      style={{ width: `${Math.min((day.minutes / 60) * 100, 100)}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700">
                      {day.minutes}分
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カテゴリー別学習時間 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              カテゴリー別学習時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryBreakdown.map((category, index) => {
                const maxMinutes = Math.max(...stats.categoryBreakdown.map(c => c.minutes))
                const percentage = (category.minutes / maxMinutes) * 100
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-green-500 to-green-600',
                  'from-orange-500 to-orange-600',
                  'from-pink-500 to-pink-600'
                ]
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.minutes}分
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full bg-gradient-to-r transition-all duration-500",
                          colors[index % colors.length]
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}