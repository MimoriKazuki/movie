'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Clock, Eye, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface UserActivity {
  user_id: string
  user_name: string
  user_email: string
  total_watch_time: number
  videos_watched: number
  last_activity: string
  avg_session_length: number
  completion_rate: number
  recent_videos: Array<{
    video_title: string
    progress: number
    last_viewed_at: string
  }>
}

export function UserActivity() {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserActivities()
  }, [])

  const fetchUserActivities = async () => {
    try {
      // 全ユーザーのプロファイルを取得
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const activities: UserActivity[] = []

      for (const profile of profiles || []) {
        // 各ユーザーの視聴履歴を取得
        const { data: viewHistory, error: historyError } = await supabase
          .from('view_history')
          .select(`
            progress,
            last_viewed_at,
            videos:video_id (
              title
            )
          `)
          .eq('user_id', profile.id)
          .order('last_viewed_at', { ascending: false })

        if (historyError) {
          console.error('Error fetching user history:', historyError)
          continue
        }

        if (!viewHistory || viewHistory.length === 0) {
          // 視聴履歴がないユーザーも含める
          activities.push({
            user_id: profile.id,
            user_name: profile.name || 'Unknown',
            user_email: profile.email || 'unknown@example.com',
            total_watch_time: 0,
            videos_watched: 0,
            last_activity: profile.created_at,
            avg_session_length: 0,
            completion_rate: 0,
            recent_videos: []
          })
          continue
        }

        // 統計計算（進捗値を妥当な範囲に制限）
        const totalWatchTime = viewHistory.reduce((sum, item) => {
          const progress = Math.min(Math.max(item.progress || 0, 0), 3600)
          return sum + progress
        }, 0)
        const videosWatched = new Set(viewHistory.map(item => item.videos?.title)).size
        const lastActivity = viewHistory[0].last_viewed_at
        const avgSessionLength = totalWatchTime / viewHistory.length
        const completedVideos = viewHistory.filter(item => {
          const progress = Math.min(Math.max(item.progress || 0, 0), 3600)
          return progress > 540
        }).length
        const completionRate = videosWatched > 0 ? (completedVideos / videosWatched) * 100 : 0

        // 最近の動画（重複除去）
        const recentVideosMap = new Map()
        viewHistory.forEach(item => {
          const videoTitle = item.videos?.title
          if (videoTitle && !recentVideosMap.has(videoTitle)) {
            recentVideosMap.set(videoTitle, {
              video_title: videoTitle,
              progress: item.progress || 0,
              last_viewed_at: item.last_viewed_at
            })
          }
        })
        const recentVideos = Array.from(recentVideosMap.values()).slice(0, 3)

        activities.push({
          user_id: profile.id,
          user_name: profile.name || 'Unknown',
          user_email: profile.email || 'unknown@example.com',
          total_watch_time: totalWatchTime,
          videos_watched: videosWatched,
          last_activity: lastActivity,
          avg_session_length: avgSessionLength,
          completion_rate: completionRate,
          recent_videos: recentVideos
        })
      }

      // アクティビティでソート
      activities.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
      setUserActivities(activities)

    } catch (error) {
      console.error('Error fetching user activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">ユーザーアクティビティを読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ユーザーアクティビティ</h2>
        <p className="text-gray-600 mt-1">全ユーザーの学習状況と進捗を確認できます</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">{userActivities.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
              <p className="text-2xl font-bold text-gray-900">
                {userActivities.filter(user => user.videos_watched > 0).length}
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
              <p className="text-sm font-medium text-gray-600">総学習時間</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatWatchTime(userActivities.reduce((sum, user) => sum + user.total_watch_time, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学習時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴動画数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均セッション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完了率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終アクティビティ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最近の動画
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userActivities.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWatchTime(user.total_watch_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.videos_watched}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWatchTime(user.avg_session_length)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(user.completion_rate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        {user.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(user.last_activity), {
                      addSuffix: true,
                      locale: ja
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {user.recent_videos.length > 0 ? (
                        <div className="space-y-1">
                          {user.recent_videos.map((video, index) => (
                            <div key={index} className="text-xs text-gray-600 truncate">
                              • {video.video_title} ({formatWatchTime(video.progress)})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">視聴履歴なし</span>
                      )}
                    </div>
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