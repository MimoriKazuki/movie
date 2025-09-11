'use client'

import { useState, useRef } from 'react'
import { PlayCircle, Lock, CheckCircle, Clock, Video, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Script from 'next/script'

interface CourseVideo {
  id: string
  video_id: string
  order_index: number
  videos: {
    id: string
    title: string
    description: string | null
    duration: number
    vimeo_id?: string
    vimeo_video_id?: string
    thumbnail_url: string | null
    view_count?: number
  }
}

interface CoursePrompt {
  id: string
  prompt_id: string
  order_index: number
  prompts: {
    id: string
    title: string
    description: string | null
    category: string
    ai_tool: string
    price: number
    example_images?: string[]
  }
}

interface CourseContentProps {
  courseVideos: CourseVideo[]
  coursePrompts?: CoursePrompt[]
  viewHistory: Record<string, any>
  courseId: string
  userId: string
}

export default function CourseContent({ 
  courseVideos, 
  coursePrompts = [], 
  viewHistory, 
  courseId, 
  userId 
}: CourseContentProps) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Combine and sort all content by order_index
  const allContent = [
    ...courseVideos.map(cv => ({ ...cv, type: 'video' as const })),
    ...coursePrompts.map(cp => ({ ...cp, type: 'prompt' as const }))
  ].sort((a, b) => a.order_index - b.order_index)

  const handleVideoClick = async (video: CourseVideo) => {
    const vimeoId = (video.videos as any).vimeo_id || video.videos.vimeo_video_id
    
    if (vimeoId) {
      // Toggle video expansion
      if (expandedVideo === video.id) {
        setExpandedVideo(null)
      } else {
        setExpandedVideo(video.id)
        setLoadedVideos(prev => new Set(prev).add(vimeoId))
        
        // Update view count
        await supabase
          .from('videos')
          .update({ view_count: (video.videos as any).view_count + 1 })
          .eq('id', video.video_id)
      }
    } else {
      console.error('Vimeo ID not found for video:', video)
      window.location.href = `/video/${video.video_id}`
    }
  }

  const isVideoCompleted = (videoId: string) => {
    const history = viewHistory[videoId]
    if (!history) return false
    return history.progress > (history.duration * 0.8)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const completedVideos = courseVideos.filter(v => isVideoCompleted(v.video_id)).length
  const totalContent = allContent.length

  return (
    <>
      <div className="space-y-6">
        {/* Content List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">コンテンツ一覧</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completedVideos}/{courseVideos.length} 動画完了 • {coursePrompts.length} プロンプト
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {allContent.map((item, index) => {
              if (item.type === 'video') {
                const courseVideo = item as CourseVideo & { type: 'video' }
                const video = courseVideo.videos
                const isCompleted = isVideoCompleted(video.id)
                const isExpanded = expandedVideo === courseVideo.id
                const vimeoId = (video as any).vimeo_id || video.vimeo_video_id

                return (
                  <div
                    key={`video-${courseVideo.id}`}
                    className="group transition-all"
                  >
                    <div 
                      className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleVideoClick(courseVideo)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Video className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>

                        {/* Duration Badge */}
                        {video.duration > 0 && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {formatDuration(video.duration)}
                          </div>
                        )}

                        {/* Progress Bar */}
                        {viewHistory[video.id] && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                              style={{ 
                                width: `${(viewHistory[video.id].progress / video.duration) * 100}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 font-medium">
                                レッスン {index + 1} - 動画
                              </span>
                              {isCompleted && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <CheckCircle className="w-3 h-3" />
                                  完了
                                </div>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {video.title}
                            </h4>
                            {video.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {video.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4 flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <PlayCircle className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(video.duration)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            動画レッスン
                          </div>
                          {viewHistory[video.id] && (
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600">
                                視聴済み {Math.round((viewHistory[video.id].progress / video.duration) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Video Player */}
                    {isExpanded && vimeoId && (
                      <div className="bg-black">
                        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                          {loadedVideos.has(vimeoId) && (
                            <iframe
                              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
                              className="absolute top-0 left-0 w-full h-full"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              } else {
                // Prompt item
                const coursePrompt = item as CoursePrompt & { type: 'prompt' }
                const prompt = coursePrompt.prompts

                return (
                  <Link
                    key={`prompt-${coursePrompt.id}`}
                    href={`/prompts/${prompt.id}`}
                  >
                    <div className="group hover:bg-gray-50 cursor-pointer transition-all">
                      <div className="flex gap-4 p-4">
                        {/* Thumbnail */}
                        <div className="relative w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {prompt.example_images?.[0] ? (
                            <img 
                              src={prompt.example_images[0]} 
                              alt={prompt.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-white/50" />
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-12 h-12 text-white drop-shadow-lg" />
                          </div>

                          {/* Category Badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-purple-600/90 text-white text-xs rounded">
                            {prompt.ai_tool}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-500 font-medium">
                                  レッスン {index + 1} - プロンプト
                                </span>
                                {prompt.price === 0 && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    無料
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {prompt.title}
                              </h4>
                              {prompt.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {prompt.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="ml-4">
                              <Sparkles className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              プロンプト
                            </div>
                            <div className="flex items-center gap-1">
                              {prompt.ai_tool}
                            </div>
                            {prompt.price > 0 && (
                              <div className="text-purple-600 font-medium">
                                ¥{prompt.price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              }
            })}
          </div>
        </div>
      </div>
    </>
  )
}