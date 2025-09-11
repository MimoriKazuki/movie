import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoProgressTracker } from './video-progress-tracker'
import { VideoPlayerWrapper } from '@/components/video/video-player-wrapper'
import { Comments } from '@/components/video/comments'
import { RelatedVideos } from '@/components/video/related-videos'
import VideoHeroSimple from '@/components/video/video-hero-simple'
import VideoSidebar from '@/components/video/video-sidebar'
import Link from 'next/link'
import Script from 'next/script'

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

  // Check purchase status
  let hasPurchased = false
  let isAdmin = false
  
  if (user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    isAdmin = profile?.role === 'admin'
    
    if (!isAdmin && !video.is_free && video.price && video.price > 0) {
      // Check if user has purchased
      const { data: purchase } = await supabase
        .from('video_purchases')
        .select('*')
        .eq('video_id', resolvedParams.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      if (purchase) {
        hasPurchased = true
      } else {
        // Check course access
        const { data: courseAccess } = await supabase
          .from('course_videos')
          .select(`
            course_id,
            course_purchases!inner(user_id, status)
          `)
          .eq('video_id', resolvedParams.id)
          .eq('course_purchases.user_id', user.id)
          .eq('course_purchases.status', 'active')
          .single()
        
        hasPurchased = !!courseAccess
      }
    }
  }
  
  const canWatch = video.is_free || video.price === 0 || hasPurchased || isAdmin

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

  // Check if user has liked the video
  const { data: isLiked } = await supabase
    .from('video_likes')
    .select('id')
    .eq('video_id', resolvedParams.id)
    .eq('user_id', user?.id)
    .single()

  // Get comments with user info
  const { data: comments } = await supabase
    .from('video_comments')
    .select(`
      *,
      user:profiles(name, avatar_url),
      likes:comment_likes(count)
    `)
    .eq('video_id', resolvedParams.id)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })

  await supabase
    .from('videos')
    .update({ view_count: video.view_count + 1 })
    .eq('id', resolvedParams.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id={`ld-product-video-${video.id}`} type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: video.title,
          description: video.description || '',
          image: video.thumbnail_url || undefined,
          brand: { '@type': 'Brand', name: '誰でもエンジニア' },
          offers: {
            '@type': 'Offer',
            price: video.price || 0,
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock'
          }
        })}
      </Script>
      {/* Video Hero Section */}
      <VideoHeroSimple video={video} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player or Purchase Prompt */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden">
        {canWatch ? (
          <VideoProgressTracker videoId={resolvedParams.id} userId={user?.id || ''}>
            <VideoPlayerWrapper 
              videoId={video.vimeo_id} 
              initialTime={viewHistory?.progress || 0}
            />
          </VideoProgressTracker>
        ) : (
          <div className="relative aspect-video bg-gray-900">
            {/* Blurred thumbnail background */}
            {video.thumbnail_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                style={{ backgroundImage: `url(${video.thumbnail_url})` }}
              />
            )}
            
            {/* Purchase overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">この動画は有料です</h3>
                  <p className="text-gray-600">
                    視聴するには購入が必要です
                  </p>
                </div>
                
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900">
                    ¥{video.price?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">買い切り価格</p>
                </div>
                
                {user ? (
                  <Link href={`/video/${resolvedParams.id}/purchase`}>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg">
                      購入して視聴する
                    </button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <button className="w-full px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
                      ログインして購入
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
            </div>
            
            {/* Comments Section */}
            <div className="mt-8">
              <Comments 
                videoId={resolvedParams.id} 
                userId={user?.id}
                initialComments={comments || []}
              />
            </div>
            
            {/* Related Videos (Mobile) */}
            <div className="mt-8 lg:hidden">
              <RelatedVideos 
                currentVideoId={resolvedParams.id} 
                genre={video.genre}
                tags={video.tags}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <VideoSidebar 
              video={video}
              isFavorited={!!isFavorited}
              isLiked={!!isLiked}
            />
            
            {/* Related Videos (Desktop) */}
            <div className="mt-8 hidden lg:block">
              <RelatedVideos 
                currentVideoId={resolvedParams.id} 
                genre={video.genre}
                tags={video.tags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
