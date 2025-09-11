import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CourseHeroSimple from '@/components/course/course-hero-simple'
import CourseContent from '@/components/course/course-content'
import CourseSidebar from '@/components/course/course-sidebar'
import CourseReviews from '@/components/course/course-reviews'
import Script from 'next/script'

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Await params in Next.js 15
  const { id: courseId } = await params

  // Get user profile to check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) {
    redirect('/courses')
  }

  // Check if user has purchased the course (skip for admin)
  if (!isAdmin) {
    const { data: purchase } = await supabase
      .from('course_purchases')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .single()

    if (!purchase) {
      // Show purchase page if not purchased
      redirect(`/courses/${courseId}/purchase`)
    }
  }

  // Get course videos
  const { data: courseVideos } = await supabase
    .from('course_videos')
    .select(`
      *,
      videos (*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  // Get course prompts
  const { data: coursePrompts } = await supabase
    .from('course_prompts')
    .select(`
      *,
      prompts (*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  // Get user's progress
  const { data: progress } = await supabase
    .from('course_progress')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single()

  // Get view history for each video
  const videoIds = courseVideos?.map(cv => cv.video_id) || []
  const { data: viewHistory } = await supabase
    .from('view_history')
    .select('*')
    .eq('user_id', user.id)
    .in('video_id', videoIds)

  const viewHistoryMap = viewHistory?.reduce((acc, vh) => {
    acc[vh.video_id] = vh
    return acc
  }, {} as Record<string, any>) || {}

  // Get course reviews
  const { data: reviews } = await supabase
    .from('course_reviews')
    .select(`
      *,
      user:profiles(name, avatar_url)
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id={`ld-product-course-${course.id}`} type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: course.title,
          description: course.description || '',
          image: course.thumbnail_url || undefined,
          brand: { '@type': 'Brand', name: '誰でもエンジニア' },
          offers: {
            '@type': 'Offer',
            price: course.price || 0,
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock'
          }
        })}
      </Script>
      {/* Course Hero Section */}
      <CourseHeroSimple course={course} progress={progress} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content (Videos & Prompts) */}
          <div className="lg:col-span-2">
            <CourseContent 
              courseVideos={courseVideos || []} 
              coursePrompts={coursePrompts || []}
              viewHistory={viewHistoryMap}
              courseId={courseId}
              userId={user.id}
            />
            
            {/* Course Reviews */}
            <div className="mt-8">
              <CourseReviews 
                courseId={courseId}
                userId={user.id}
                initialReviews={reviews || []}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CourseSidebar 
              course={course}
              totalVideos={courseVideos?.length || 0}
              completedVideos={Object.keys(viewHistoryMap).length}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
