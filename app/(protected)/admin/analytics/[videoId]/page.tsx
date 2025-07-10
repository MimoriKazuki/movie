'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Eye, Clock, Users, Calendar, Download } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface VideoDetail {
  id: string
  title: string
  thumbnail_url: string | null
  view_count: number
  created_at: string
}

interface ViewerDetail {
  user_id: string
  user_name: string
  user_email: string
  progress: number
  last_viewed_at: string
  watch_count: number
}

export default function VideoViewersDetailPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.videoId as string
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [viewers, setViewers] = useState<ViewerDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchVideoAndViewers()
  }, [videoId])

  const fetchVideoAndViewers = async () => {
    try {
      // 動画情報を取得
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('id, title, thumbnail_url, view_count, created_at')
        .eq('id', videoId)
        .single()

      if (videoError) throw videoError
      setVideo(videoData)

      // 視聴者情報を取得
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
        .eq('video_id', videoId)

      if (historyError) throw historyError

      // 視聴者データの処理
      const viewerMap = new Map()
      
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
      })

      const viewersArray = Array.from(viewerMap.values())
      viewersArray.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime())
      setViewers(viewersArray)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatWatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const exportViewersData = () => {
    if (!video) return

    const csvData = [
      ['視聴者名', 'メールアドレス', '視聴時間', '進捗率(%)', '視聴回数', '最終視聴日'],
      ...viewers.map(viewer => [
        viewer.user_name,
        viewer.user_email,
        formatWatchTime(viewer.progress),
        Math.min((viewer.progress / 600) * 100, 100).toFixed(1),
        viewer.watch_count,
        new Date(viewer.last_viewed_at).toLocaleString('ja-JP')
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${video.title}_viewers_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredViewers = viewers.filter(viewer =>
    viewer.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    viewer.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 統計データの計算
  const totalViewers = viewers.length
  const avgWatchTime = totalViewers > 0 
    ? viewers.reduce((sum, viewer) => sum + viewer.progress, 0) / totalViewers 
    : 0
  const completionRate = totalViewers > 0 
    ? (viewers.filter(v => v.progress > 540).length / totalViewers) * 100 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">視聴者データを読み込み中...</span>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">動画が見つかりませんでした</p>
        <button
          onClick={() => router.push('/admin/analytics')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          分析ページに戻る
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/analytics')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          動画分析に戻る
        </button>
        
        <div className="flex items-start gap-4">
          {video.thumbnail_url && (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
            <p className="text-gray-600 mt-1">
              視聴者詳細分析 • 公開日: {new Date(video.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <button
            onClick={exportViewersData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSVエクスポート
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">総視聴回数</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{video.view_count.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-200 bg-opacity-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">視聴者数</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{totalViewers}</p>
            </div>
            <div className="p-3 bg-green-200 bg-opacity-50 rounded-lg">
              <Users className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">平均視聴時間</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{formatWatchTime(avgWatchTime)}</p>
            </div>
            <div className="p-3 bg-yellow-200 bg-opacity-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">完了率</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-200 bg-opacity-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="視聴者名またはメールアドレスで検索..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 視聴者テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  進捗
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴回数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終視聴日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredViewers.map((viewer) => (
                <tr key={viewer.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {viewer.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
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
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((viewer.progress / 600) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[60px]">
                          {formatWatchTime(viewer.progress)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {Math.min((viewer.progress / 600) * 100, 100).toFixed(1)}% 完了
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
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
          {filteredViewers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">該当する視聴者が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}