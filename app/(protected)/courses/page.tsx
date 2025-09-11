import { createClient } from '@/lib/supabase/server'
import { CourseListWithSearch } from '@/components/courses/course-list-with-search'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function CoursesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 公開中のコース一覧を取得
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  // 各コースの動画数と受講生数を取得
  let courseStats: Record<string, { videoCount: number; studentCount: number }> = {}
  
  if (courses) {
    for (const course of courses) {
      // 動画数を取得
      const { count: videoCount } = await supabase
        .from('course_videos')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)
      
      // 受講生数を取得
      const { count: studentCount } = await supabase
        .from('course_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)
        .eq('status', 'active')
      
      courseStats[course.id] = {
        videoCount: videoCount || 0,
        studentCount: studentCount || 0
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader
          title="コース一覧"
          description="体系的に学習できるコースを選びましょう"
          variant="simple"
        />

        <CourseListWithSearch 
          courses={courses || []}
          courseStats={courseStats}
        />
      </div>
    </div>
  )
}
