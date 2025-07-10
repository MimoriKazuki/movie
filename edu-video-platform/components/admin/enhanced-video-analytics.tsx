'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, Clock, Users, Calendar, Download, Search, PlayCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface EnhancedVideoAnalytics {
  video_id: string
  video_title: string
  video_thumbnail: string | null
  vimeo_id: string
  actual_duration: number | null // Vimeoから取得した実際の長さ
  total_views: number
  unique_viewers: number
  avg_watch_time: number
  completion_rate: number
  engagement_rate: number // 実際の長さに基づく視聴率
  last_viewed: string | null
  viewers: Array<{
    user_id: string
    user_name: string
    user_email: string
    progress: number
    last_viewed_at: string
    watch_count: number
    actual_completion_rate: number // 実際の完了率
  }>
}

export function EnhancedVideoAnalytics() {
  const [analytics, setAnalytics] = useState<EnhancedVideoAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<EnhancedVideoAnalytics | null>(null)
  const [fetchingDurations, setFetchingDurations] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchVideoDuration = async (vimeoId: string): Promise<number | null> => {
    try {
      // Vimeo oEmbed APIを使用して動画の長さを取得
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`)
      if (!response.ok) return null
      
      const data = await response.json()
      return data.duration || null
    } catch (error) {
      console.error('Error fetching video duration:', error)
      return null
    }
  }

  const fetchAnalytics = async () => {
    try {
      // 動画ごとの視聴統計を取得
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          thumbnail_url,
          vimeo_id,
          view_count,
          created_at
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })

      if (videosError) throw videosError

      const analyticsData: EnhancedVideoAnalytics[] = []

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

        viewHistory?.forEach(view => {
          const userId = view.user_id
          const progress = Math.min(Math.max(view.progress || 0, 0), 7200) // 最大2時間に制限
          
          if (!viewerMap.has(userId)) {
            viewerMap.set(userId, {
              user_id: userId,
              user_name: view.profiles?.name || 'Unknown',
              user_email: view.profiles?.email || 'unknown@example.com',
              progress: progress,
              last_viewed_at: view.last_viewed_at,
              watch_count: 1,
              actual_completion_rate: 0
            })
          } else {
            const existing = viewerMap.get(userId)
            existing.progress = Math.max(existing.progress, progress)
            existing.last_viewed_at = view.last_viewed_at > existing.last_viewed_at 
              ? view.last_viewed_at 
              : existing.last_viewed_at
            existing.watch_count += 1
          }

          totalWatchTime += progress
        })

        const viewers = Array.from(viewerMap.values())
        const uniqueViewers = viewers.length
        const avgWatchTime = uniqueViewers > 0 ? totalWatchTime / uniqueViewers : 0
        
        // デフォルトの完了率（10分基準）
        const defaultCompletedViews = viewers.filter(v => v.progress > 600).length
        const defaultCompletionRate = uniqueViewers > 0 ? (defaultCompletedViews / uniqueViewers) * 100 : 0
        
        const lastViewed = viewers.length > 0 
          ? viewers.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime())[0].last_viewed_at
          : null

        analyticsData.push({
          video_id: video.id,
          video_title: video.title,
          video_thumbnail: video.thumbnail_url,
          vimeo_id: video.vimeo_id,
          actual_duration: null, // 後で取得
          total_views: video.view_count,
          unique_viewers: uniqueViewers,
          avg_watch_time: avgWatchTime,
          completion_rate: defaultCompletionRate,
          engagement_rate: 0, // 後で計算
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

  const fetchAllDurations = async () => {
    setFetchingDurations(true)
    
    const updatedAnalytics = await Promise.all(
      analytics.map(async (item) => {
        const duration = await fetchVideoDuration(item.vimeo_id)
        
        if (duration) {
          // 実際の長さに基づいて完了率と視聴率を再計算
          const actualCompletedViews = item.viewers.filter(v => v.progress > duration * 0.8).length // 80%以上で完了
          const actualCompletionRate = item.unique_viewers > 0 ? (actualCompletedViews / item.unique_viewers) * 100 : 0
          const engagementRate = item.avg_watch_time > 0 ? (item.avg_watch_time / duration) * 100 : 0
          
          // 視聴者の個別完了率も更新
          const updatedViewers = item.viewers.map(viewer => ({
            ...viewer,
            actual_completion_rate: (viewer.progress / duration) * 100
          }))
          
          return {
            ...item,
            actual_duration: duration,
            completion_rate: actualCompletionRate,
            engagement_rate: Math.min(engagementRate, 100),
            viewers: updatedViewers
          }
        }
        
        return item
      })
    )
    
    setAnalytics(updatedAnalytics)
    setFetchingDurations(false)
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
          <h1 className="text-3xl font-bold text-gray-900">高度な動画分析</h1>
          <p className="text-gray-600 mt-1">実際の動画の長さに基づく正確な分析</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllDurations}
            disabled={fetchingDurations}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            {fetchingDurations ? '取得中...' : '実際の長さを取得'}
          </button>
        </div>
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
              <p className="text-sm font-medium text-gray-600">平均視聴率</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.length > 0 
                  ? `${(analytics.reduce((sum, item) => sum + item.engagement_rate, 0) / analytics.length).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 動画一覧 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  動画
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  実際の長さ
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
                  視聴率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完了率
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
                    {item.actual_duration ? formatWatchTime(item.actual_duration) : '未取得'}
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
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(item.engagement_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        {item.engagement_rate.toFixed(1)}%
                      </span>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedVideo(item)}
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

      {/* 詳細モーダル */}
      {selectedVideo && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedVideo(null)}
          />
          
          {/* モーダル本体 */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
              {/* ヘッダー */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{selectedVideo.video_title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedVideo.actual_duration && (
                        <span className="inline-flex items-center">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          動画の長さ: {formatWatchTime(selectedVideo.actual_duration)}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* コンテンツ */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>
                {/* 統計サマリー */}
                <div className="px-6 pt-6 pb-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">総視聴者数</p>
                          <p className="text-3xl font-bold text-blue-900 mt-1">{selectedVideo.unique_viewers}</p>
                        </div>
                        <div className="p-3 bg-blue-200 bg-opacity-50 rounded-lg">
                          <Users className="w-6 h-6 text-blue-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">平均視聴時間</p>
                          <p className="text-3xl font-bold text-green-900 mt-1">{formatWatchTime(selectedVideo.avg_watch_time)}</p>
                        </div>
                        <div className="p-3 bg-green-200 bg-opacity-50 rounded-lg">
                          <Clock className="w-6 h-6 text-green-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-700">視聴率</p>
                          <p className="text-3xl font-bold text-yellow-900 mt-1">{selectedVideo.engagement_rate.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-yellow-200 bg-opacity-50 rounded-lg">
                          <Eye className="w-6 h-6 text-yellow-700" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">完了率</p>
                          <p className="text-3xl font-bold text-purple-900 mt-1">{selectedVideo.completion_rate.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-purple-200 bg-opacity-50 rounded-lg">
                          <PlayCircle className="w-6 h-6 text-purple-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* テーブル */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            視聴者
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            視聴時間
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            視聴率
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            視聴回数
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            最終視聴日
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {selectedVideo.viewers.map((viewer, index) => (
                          <tr key={viewer.user_id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-white font-semibold text-sm">
                                    {viewer.user_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {viewer.user_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {viewer.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <div className="w-40 bg-gray-200 rounded-full h-2 mr-3">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                                      style={{ 
                                        width: selectedVideo.actual_duration 
                                          ? `${Math.min((viewer.progress / selectedVideo.actual_duration) * 100, 100)}%`
                                          : `${Math.min((viewer.progress / 600) * 100, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                                    {formatWatchTime(viewer.progress)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {selectedVideo.actual_duration 
                                    ? `${Math.min(viewer.actual_completion_rate, 100).toFixed(1)}%`
                                    : `${Math.min((viewer.progress / 600) * 100, 100).toFixed(1)}%`
                                  }
                                </div>
                                {viewer.actual_completion_rate >= 80 && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                    完了
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                {viewer.watch_count}回
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                {formatDistanceToNow(new Date(viewer.last_viewed_at), {
                                  addSuffix: true,
                                  locale: ja
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}