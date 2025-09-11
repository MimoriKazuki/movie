'use client'

import { Clock, Calendar, Eye, Tag, Share2, Heart, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

interface VideoSidebarProps {
  video: any
  isFavorited: boolean
  isLiked: boolean
  onShare?: () => void
  onDownload?: () => void
}

export default function VideoSidebar({ 
  video, 
  isFavorited: initialFavorited, 
  isLiked: initialLiked,
  onShare,
  onDownload
}: VideoSidebarProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLiked, setIsLiked] = useState(initialLiked)

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '不明'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
      {/* Video Info */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-4">動画情報</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              動画時間: {formatDuration(video.duration)}
            </span>
          </div>
          {/* 視聴回数は非表示に */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              公開日: {formatDate(video.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            タグ
          </h3>
          <div className="flex flex-wrap gap-2">
            {video.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Genre */}
      {video.genre && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">ジャンル</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {video.genre}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          fullWidth
          variant={isFavorited ? "secondary" : "outline"}
          icon={Heart}
          onClick={() => setIsFavorited(!isFavorited)}
        >
          {isFavorited ? 'お気に入り済み' : 'お気に入りに追加'}
        </Button>
        
        <Button
          fullWidth
          variant="outline"
          icon={Share2}
          onClick={onShare}
        >
          共有する
        </Button>

        {video.downloadable && (
          <Button
            fullWidth
            variant="outline"
            icon={Download}
            onClick={onDownload}
          >
            ダウンロード
          </Button>
        )}
      </div>

      {/* Description */}
      {video.description && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-bold text-gray-900 mb-3">説明</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {video.description}
          </p>
        </div>
      )}
    </div>
  )
}
