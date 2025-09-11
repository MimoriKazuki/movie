'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  Users,
  DollarSign,
  PlayCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Award
} from 'lucide-react'

interface AnalyticsData {
  revenue: {
    video: any[]
    course: any[]
    prompt: any[]
    total: number
  }
  users: {
    total: number
    active: number
    growth: any[]
  }
  videos: {
    popular: any[]
    totalViews: number
    completionRate: number
  }
  viewHistory: any[]
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d')

  // 収益データを日付ごとに集計
  const getRevenueByDate = () => {
    const revenueMap = new Map()
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90

    // 初期化
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      revenueMap.set(key, { date: key, video: 0, course: 0, prompt: 0, total: 0 })
    }

    // 動画収益
    analytics.revenue.video.forEach(r => {
      const date = r.created_at.split('T')[0]
      if (revenueMap.has(date)) {
        const data = revenueMap.get(date)
        data.video += r.price_paid || 0
        data.total += r.price_paid || 0
      }
    })

    // コース収益
    analytics.revenue.course.forEach(r => {
      const date = r.created_at.split('T')[0]
      if (revenueMap.has(date)) {
        const data = revenueMap.get(date)
        data.course += r.price_paid || 0
        data.total += r.price_paid || 0
      }
    })

    // プロンプト収益
    analytics.revenue.prompt.forEach(r => {
      const date = r.created_at.split('T')[0]
      if (revenueMap.has(date)) {
        const data = revenueMap.get(date)
        data.prompt += r.price || 0
        data.total += r.price || 0
      }
    })

    return Array.from(revenueMap.values())
  }

  // ユーザー成長データを日付ごとに集計
  const getUserGrowthData = () => {
    const userMap = new Map()
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    let cumulativeCount = 0

    // 全期間のユーザーを日付順にソート
    const sortedUsers = [...analytics.users.growth].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // 初期化と累積計算
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      
      // その日までの累積ユーザー数を計算
      const count = sortedUsers.filter(u => 
        new Date(u.created_at) <= new Date(key + 'T23:59:59')
      ).length

      userMap.set(key, { 
        date: key, 
        total: count,
        new: 0
      })
    }

    // 新規ユーザー数を計算
    sortedUsers.forEach(u => {
      const date = u.created_at.split('T')[0]
      if (userMap.has(date)) {
        userMap.get(date).new++
      }
    })

    return Array.from(userMap.values())
  }

  // 視聴完了率データ
  const getViewMetrics = () => {
    const totalViews = analytics.viewHistory.length
    const completedViews = analytics.viewHistory.filter(v => {
      const duration = v.videos?.duration || 0
      return duration > 0 && v.progress >= duration * 0.8
    }).length

    return {
      total: totalViews,
      completed: completedViews,
      rate: totalViews > 0 ? (completedViews / totalViews * 100).toFixed(1) : 0
    }
  }

  const revenueData = getRevenueByDate()
  const userGrowthData = getUserGrowthData()
  const viewMetrics = getViewMetrics()

  // 収益の前期比較
  const getRevenueComparison = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

    const currentPeriod = [...analytics.revenue.video, ...analytics.revenue.course, ...analytics.revenue.prompt]
      .filter(r => new Date(r.created_at || r.created_at) >= thirtyDaysAgo)
      .reduce((sum, r) => sum + (r.price_paid || r.price || 0), 0)

    const previousPeriod = [...analytics.revenue.video, ...analytics.revenue.course, ...analytics.revenue.prompt]
      .filter(r => {
        const date = new Date(r.created_at || r.created_at)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      })
      .reduce((sum, r) => sum + (r.price_paid || r.price || 0), 0)

    const change = previousPeriod > 0 
      ? ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1)
      : 0

    return { current: currentPeriod, previous: previousPeriod, change }
  }

  const revenueComparison = getRevenueComparison()

  return (
    <div className="space-y-6">
      {/* 日付範囲セレクター */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7日間' : range === '30d' ? '30日間' : '90日間'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            {revenueComparison.change !== 0 && (
              <span className={`flex items-center gap-1 text-sm font-medium ${
                Number(revenueComparison.change) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Number(revenueComparison.change) > 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(Number(revenueComparison.change))}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ¥{analytics.revenue.total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">総収益</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.users.total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">総ユーザー数</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.users.active.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">アクティブユーザー（30日）</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PlayCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {viewMetrics.rate}%
          </p>
          <p className="text-sm text-gray-600 mt-1">動画完了率</p>
        </div>
      </div>

      {/* 収益推移グラフ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">収益推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: any) => `¥${value.toLocaleString()}`}
              labelFormatter={(label) => {
                const date = new Date(label)
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="video"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="動画"
            />
            <Area
              type="monotone"
              dataKey="course"
              stackId="1"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
              name="コース"
            />
            <Area
              type="monotone"
              dataKey="prompt"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="プロンプト"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ユーザー成長グラフ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー成長</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(label) => {
                const date = new Date(label)
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="累計ユーザー数"
            />
            <Line
              type="monotone"
              dataKey="new"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="新規ユーザー"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 人気動画ランキング */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">人気動画TOP10</h3>
          <div className="space-y-3">
            {analytics.videos.popular.map((video, index) => (
              <div key={video.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {video.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Award className="w-3 h-3" />
                        {video.like_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 視聴統計 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">視聴統計</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">総視聴回数</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analytics.videos.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">平均完了率</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analytics.videos.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">アクティブ率</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {analytics.users.total > 0 
                  ? ((analytics.users.active / analytics.users.total) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}