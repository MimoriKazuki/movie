'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, BarChart, Search, Star } from 'lucide-react'
import { Database } from '@/types/database'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos: initialVideos }: VideoListProps) {
  const [videos, setVideos] = useState(initialVideos)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const supabase = createClient()
  const router = useRouter()

  // フィルタリング
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && video.is_published) ||
                         (filterStatus === 'draft' && !video.is_published)
    
    return matchesSearch && matchesStatus
  })

  const togglePublish = async (video: Video) => {
    const { error } = await supabase
      .from('videos')
      .update({ is_published: !video.is_published })
      .eq('id', video.id)

    if (!error) {
      setVideos(videos.map(v => 
        v.id === video.id ? { ...v, is_published: !v.is_published } : v
      ))
    }
  }

  const toggleRecommend = async (video: Video) => {
    const { error } = await supabase
      .from('videos')
      .update({ is_recommended: !(video as any).is_recommended })
      .eq('id', video.id)

    if (!error) {
      setVideos(videos.map(v => 
        v.id === video.id ? { ...v, is_recommended: !(v as any).is_recommended } : v
      ))
    }
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) return

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)

    if (!error) {
      setVideos(videos.filter(v => v.id !== id))
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>動画一覧</CardTitle>
          
          {/* フィルター */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="動画を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                全て ({videos.length})
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                公開中 ({videos.filter(v => v.is_published).length})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'draft' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                下書き ({videos.filter(v => !v.is_published).length})
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ジャンル
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴回数
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  おすすめ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? '検索条件に一致する動画がありません' 
                      : '動画がありません'}
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {video.title}
                        </div>
                        {video.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {video.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {video.genre || 'その他'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {(video as any).is_free || (video as any).price === 0
                          ? '無料'
                          : `¥${((video as any).price ?? 0).toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {video.view_count.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePublish(video)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                          video.is_published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        )}
                      >
                        {video.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            公開中
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            下書き
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleRecommend(video)}
                        className="transition-colors"
                      >
                        <Star 
                          className={cn(
                            "w-5 h-5",
                            (video as any).is_recommended 
                              ? "text-yellow-500 fill-current" 
                              : "text-gray-300 hover:text-yellow-400"
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(video.created_at).toLocaleDateString('ja-JP')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/analytics/${video.id}`}>
                          <Button size="sm" variant="ghost" icon={BarChart} className="flex-row">
                            <span className="whitespace-nowrap">分析</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/videos/${video.id}/edit`}>
                          <Button size="sm" variant="ghost" icon={Edit} className="flex-row">
                            <span className="whitespace-nowrap">編集</span>
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={Trash2} 
                          onClick={() => deleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-row"
                        >
                          <span className="whitespace-nowrap">削除</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
