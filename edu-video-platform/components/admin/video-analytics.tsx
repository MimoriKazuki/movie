'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, Clock, Users, Calendar, Download, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface VideoAnalytics {
  video_id: string
  video_title: string
  video_thumbnail: string | null
  total_views: number
  unique_viewers: number
  avg_watch_time: number
  completion_rate: number
  last_viewed: string | null
  viewers: Array<{
    user_id: string
    user_name: string
    user_email: string
    progress: number
    last_viewed_at: string
    watch_count: number
  }>
}

export function VideoAnalytics() {
  const [analytics, setAnalytics] = useState<VideoAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // 動画ごとの視聴統計を取得
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          thumbnail_url,
          view_count,
          created_at
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })

      if (videosError) throw videosError

      const analyticsData: VideoAnalytics[] = []

      for (const video of videos || []) {
        // 各動画の詳細な視聴データを取得
        const { data: viewHistory, error: historyError } = await supabase
          .from('view_history')
          .select(`
            user_id,
            progress,
            last_viewed_at,
            profiles:user_id (
              name,
              email
            )
          `)
          .eq('video_id', video.id)

        if (historyError) {
          console.error('Error fetching view history:', historyError)
          continue
        }

        // 視聴者データの処理
        const viewerMap = new Map()
        let totalWatchTime = 0
        let completedViews = 0

        viewHistory?.forEach(view => {
          const userId = view.user_id
          const progress = view.progress || 0
          
          if (!viewerMap.has(userId)) {
            viewerMap.set(userId, {
              user_id: userId,
              user_name: view.profiles?.name || 'Unknown',
              user_email: view.profiles?.email || 'unknown@example.com',
              progress: progress,
              last_viewed_at: view.last_viewed_at,
              watch_count: 1
            })
          } else {
            const existing = viewerMap.get(userId)
            const validProgress = Math.min(Math.max(progress, 0), 3600)
            existing.progress = Math.max(existing.progress, validProgress)
            existing.last_viewed_at = view.last_viewed_at > existing.last_viewed_at 
              ? view.last_viewed_at 
              : existing.last_viewed_at
            existing.watch_count += 1
          }

          // 進捗値を妥当な範囲に制限（0-3600秒、最大1時間）
          const validProgress = Math.min(Math.max(progress, 0), 3600)
          totalWatchTime += validProgress
          if (validProgress > 540) { // 9分以上視聴で完了とみなす
            completedViews += 1
          }
        })

        const viewers = Array.from(viewerMap.values())
        const uniqueViewers = viewers.length
        const avgWatchTime = uniqueViewers > 0 ? totalWatchTime / uniqueViewers : 0
        const completionRate = uniqueViewers > 0 ? (completedViews / uniqueViewers) * 100 : 0
        const lastViewed = viewers.length > 0 
          ? viewers.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime())[0].last_viewed_at
          : null

        analyticsData.push({
          video_id: video.id,
          video_title: video.title,
          video_thumbnail: video.thumbnail_url,
          total_views: video.view_count,
          unique_viewers: uniqueViewers,
          avg_watch_time: avgWatchTime,
          completion_rate: completionRate,
          last_viewed: lastViewed,
          viewers: viewers.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime())
        })
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatWatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const exportAnalytics = () => {
    const csvData = [
      ['動画タイトル', '総視聴回数', 'ユニーク視聴者数', '平均視聴時間', '完了率(%)', '最終視聴日'],
      ...analytics.map(item => [
        item.video_title,
        item.total_views,
        item.unique_viewers,
        formatWatchTime(item.avg_watch_time),
        item.completion_rate.toFixed(1),
        item.last_viewed ? new Date(item.last_viewed).toLocaleString('ja-JP') : 'なし'
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `video_analytics_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredAnalytics = analytics.filter(item =>
    item.video_title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">分析データを読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">動画分析</h1>
          <p className="text-gray-600 mt-1">動画の視聴状況と視聴者の詳細を確認できます</p>
        </div>
        <button
          onClick={exportAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          CSVエクスポート
        </button>
      </div>

      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="動画タイトルで検索..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総視聴回数</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.reduce((sum, item) => sum + item.total_views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総視聴者数</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.reduce((sum, item) => sum + item.unique_viewers, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均視聴時間</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.length > 0 
                  ? formatWatchTime(analytics.reduce((sum, item) => sum + item.avg_watch_time, 0) / analytics.length)
                  : '0:00'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">公開動画数</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 動画一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  動画
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴回数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴者数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均視聴時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完了率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終視聴
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnalytics.map((item) => (
                <tr key={item.video_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.video_thumbnail && (
                        <img
                          src={item.video_thumbnail}
                          alt={item.video_title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {item.video_title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.total_views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unique_viewers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWatchTime(item.avg_watch_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(item.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        {item.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.last_viewed 
                      ? formatDistanceToNow(new Date(item.last_viewed), { addSuffix: true, locale: ja })
                      : 'なし'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/analytics/${item.video_id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      視聴者詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}