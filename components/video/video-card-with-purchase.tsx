'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Database } from '@/types/database'
import { Play, Clock, Lock, Eye } from 'lucide-react'
import { VideoModal } from './video-modal'
import { Button } from '@/components/ui/Button'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoCardWithPurchaseProps {
  video: Video
  progress?: number
  hasPurchased?: boolean
  userId?: string
}

export function VideoCardWithPurchase({ 
  video, 
  progress, 
  hasPurchased = false,
  userId
}: VideoCardWithPurchaseProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const progressPercentage = progress ? (progress / 600) * 100 : 0 // Assuming 600s average video
  
  const isFree = video.is_free || video.price === 0

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden group">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* 有料動画で未購入の場合はロックアイコン表示 */}
          {!isFree && !hasPurchased && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>
          )}
          
          {/* 無料または購入済みの場合は再生ボタン */}
          {(isFree || hasPurchased) && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsModalOpen(true)
                }}
                className="p-3 bg-white bg-opacity-90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100"
                title="今すぐ視聴"
              >
                <Play className="w-8 h-8 text-gray-900" />
              </button>
            </div>
          )}
          
          {progress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          
          {/* 価格バッジ */}
          <div className="absolute top-2 right-2">
            {isFree ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                無料
              </span>
            ) : (
              <span className="bg-gray-800 text-white px-2 py-1 rounded-md text-sm font-medium">
                ¥{video.price?.toLocaleString() || '0'}
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {/* 閲覧数は非表示に */}
          </div>
          
          {video.tags && video.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* アクションボタン */}
          <div className="mt-4">
            {isFree ? (
              <Link href={`/video/${video.id}`}>
                <Button fullWidth variant="primary">
                  無料で動画を閲覧
                </Button>
              </Link>
            ) : hasPurchased ? (
              <Link href={`/video/${video.id}`}>
                <Button fullWidth variant="primary" icon={Play}>
                  動画を視聴
                </Button>
              </Link>
            ) : (
              <div className="space-y-2">
                <Link href={`/video/${video.id}/purchase`}>
                  <Button fullWidth variant="gradient" glow>
                    購入する
                  </Button>
                </Link>
                <Link href={`/video/${video.id}`}>
                  <Button fullWidth variant="secondary" icon={Eye}>
                    詳細を見る
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {(isFree || hasPurchased) && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={video.vimeo_id}
        />
      )}
    </>
  )
}
