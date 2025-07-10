'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { Play, Clock, Eye, Calendar } from 'lucide-react'
import { VideoModal } from './video-modal'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import styles from './video-card.module.css'
import { createClient } from '@/lib/supabase/client'

type Video = Database['public']['Tables']['videos']['Row']

interface VideoCardWithHistoryProps {
  video: Video
  progress?: number
  variant?: 'default' | 'compact'
}

export function VideoCardWithHistory({ video, progress, variant = 'default' }: VideoCardWithHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  // 進捗値を安全な範囲に制限してパーセンテージを計算
  const safeProgress = Math.min(Math.max(progress || 0, 0), 600)
  const progressPercentage = safeProgress > 0 ? (safeProgress / 600) * 100 : 0
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
    }
    getUser()
  }, [supabase])

  const formatViewCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`
    }
    return count.toLocaleString()
  }

  const isNew = () => {
    // Don't show "New" badge if user has already viewed this video
    if (progress && progress > 0) {
      return false
    }
    
    const createdDate = new Date(video.created_at)
    const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }

  if (variant === 'compact') {
    return (
      <>
        <div 
          className={styles.compactCard}
          onClick={() => setIsModalOpen(true)}
        >
          <div className={styles.compactThumbnail}>
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-700 to-gray-900">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className={styles.compactContent}>
            <h4 className="font-medium text-sm line-clamp-2 text-gray-900">{video.title}</h4>
            <p className="text-xs text-gray-500 mt-1">
              {formatViewCount(video.view_count)} 回視聴
            </p>
          </div>
        </div>
        
        <VideoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoId={video.vimeo_id}
          databaseId={video.id}
          userId={userId}
          initialTime={progress}
        />
      </>
    )
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.thumbnailWrapper}>
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className={styles.thumbnail}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <Play className="w-16 h-16 text-slate-400" />
            </div>
          )}
          
          <div className={styles.playOverlay}>
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsModalOpen(true)
              }}
              className={styles.playButton}
              title="今すぐ視聴"
            >
              <Play className="w-8 h-8 text-gray-900" fill="currentColor" />
            </button>
          </div>
          
          {isNew() && (
            <div className={styles.newBadge}>
              New
            </div>
          )}
          
          {safeProgress > 0 && (
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        <Link href={`/video/${video.id}`}>
          <div className={styles.content}>
            <h3 className={styles.title}>{video.title}</h3>
            
            {video.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {video.description}
              </p>
            )}
            
            <div className={styles.metadata}>
              <div className={styles.metaItem}>
                <Eye className="w-3.5 h-3.5" />
                <span>{formatViewCount(video.view_count)}</span>
              </div>
              <div className={styles.metaItem}>
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {formatDistanceToNow(new Date(video.created_at), {
                    addSuffix: true,
                    locale: ja
                  })}
                </span>
              </div>
            </div>
            
            {video.tags && video.tags.length > 0 && (
              <div className={styles.tags}>
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag}
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
        databaseId={video.id}
        userId={userId}
        initialTime={progress}
      />
    </>
  )
}