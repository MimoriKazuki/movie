'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Database } from '@/types/database'
import { Play, Clock, Maximize2 } from 'lucide-react'
import { VideoModal } from './video-modal'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoCardProps {
  video: Video
  progress?: number
  variant?: 'default' | 'compact'
}

export function VideoCard({ video, progress, variant = 'default' }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const progressPercentage = progress ? (progress / 600) * 100 : 0 // Assuming 600s average video

  if (variant === 'compact') {
    return (
      <Link href={`/video/${video.id}`} className="block">
        <div className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="relative w-40 aspect-video bg-gray-200 rounded overflow-hidden flex-shrink-0">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
            <p className="text-gray-500 text-xs mt-1">{video.view_count.toLocaleString()} 回視聴</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
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
          
          {progress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
        <Link href={`/video/${video.id}`}>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{video.view_count.toLocaleString()} 回視聴</span>
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
          </div>
        </Link>
      </div>
      
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={video.vimeo_id}
      />
    </>
  )
}