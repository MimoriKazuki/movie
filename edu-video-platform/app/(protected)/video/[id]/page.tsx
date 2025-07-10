import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoProgressTracker } from './video-progress-tracker'
import { VideoPlayerWrapper } from '@/components/video/video-player-wrapper'
import { VideoDetails } from '@/components/video/video-details'
import { Comments } from '@/components/video/comments'
import { RelatedVideos } from '@/components/video/related-videos'
import { use } from 'react'

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_published', true)
    .single()

  if (error || !video) {
    notFound()
  }

  const { data: viewHistory } = await supabase
    .from('view_history')
    .select('progress')
    .eq('video_id', resolvedParams.id)
    .eq('user_id', user?.id)
    .single()

  const { data: isFavorited } = await supabase
    .from('favorites')
    .select('id')
    .eq('video_id', resolvedParams.id)
    .eq('user_id', user?.id)
    .single()

  await supabase
    .from('videos')
    .update({ view_count: video.view_count + 1 })
    .eq('id', resolvedParams.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <VideoProgressTracker videoId={resolvedParams.id} userId={user?.id || ''}>
          <VideoPlayerWrapper 
            videoId={video.vimeo_id} 
            initialTime={viewHistory?.progress || 0}
          />
        </VideoProgressTracker>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VideoDetails 
              video={video} 
              isFavorited={!!isFavorited}
              userId={user?.id}
            />
            <Comments videoId={resolvedParams.id} userId={user?.id} />
          </div>
          <div>
            <RelatedVideos 
              currentVideoId={resolvedParams.id} 
              genre={video.genre}
              tags={video.tags}
            />
          </div>
        </div>
      </div>
    </div>
  )
}