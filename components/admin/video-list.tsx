'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Database } from '@/types/database'
import { Edit, Eye, EyeOff, Trash2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos: initialVideos }: VideoListProps) {
  const [videos, setVideos] = useState(initialVideos)
  const supabase = createClient()
  const router = useRouter()

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              タイトル
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ジャンル
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              視聴回数
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ステータス
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              おすすめ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              作成日
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">アクション</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {videos.map((video) => (
            <tr key={video.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{video.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{video.genre || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{video.view_count.toLocaleString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  video.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {video.is_published ? '公開中' : '非公開'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleRecommend(video)}
                  className={(video as any).is_recommended ? "text-yellow-500" : "text-gray-300"}
                >
                  <Star className="w-5 h-5" fill={(video as any).is_recommended ? "currentColor" : "none"} />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(video.created_at).toLocaleDateString('ja-JP')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/videos/${video.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => togglePublish(video)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {video.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}