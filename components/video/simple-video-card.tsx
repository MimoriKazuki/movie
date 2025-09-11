'use client'

import Link from 'next/link'
import { Database } from '@/types/database'
import { Play, Clock } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceRow } from '@/components/ui/PriceRow'

type Video = Database['public']['Tables']['videos']['Row']

interface SimpleVideoCardProps {
  video: Video
  progress?: number
}

export function SimpleVideoCard({ video, progress }: SimpleVideoCardProps) {
  const progressPercentage = progress ? (progress / 600) * 100 : 0 // Assuming 600s average video

  return (
    <Link href={`/video/${video.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full">
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {video.thumbnail_url ? (
            <SmartImage
              src={video.thumbnail_url}
              alt={video.title}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <div className="bg-white/90 p-4 rounded-full">
                <Play className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          )}
          
          {/* Hover overlay with play button */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="p-4 bg-white/95 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-8 h-8 text-gray-900" fill="currentColor" />
            </div>
          </div>
          
          {/* Progress bar if exists */}
          {progress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {/* Title - exactly 2 lines */}
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 min-h-[2.75rem] mb-3 hover:text-blue-600 transition-colors">
            {video.title}
          </h3>
          
          {/* Metadata - fixed position */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-end text-sm text-gray-500">
              {video.duration && (
                <span className="text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.floor((video.duration || 0) / 60)}:{String((video.duration || 0) % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            
            {/* Tags - fixed height */}
            <div className="h-6">
              {video.tags && video.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {video.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-6" /> // Placeholder for alignment
              )}
            </div>
          </div>
        </div>
        
        {/* Price row - bottom of card */}
        <PriceRow price={video.price} freeLabel="無料で視聴可能" leftLabel="価格" />
      </div>
    </Link>
  )
}
