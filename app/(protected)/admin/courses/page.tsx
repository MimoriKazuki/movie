import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Plus, Edit, Eye, EyeOff, Video, Users, DollarSign } from 'lucide-react'

export default async function CoursesPage() {
  const supabase = await createClient()
  
  // コース一覧を取得
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      course_videos (count),
      course_purchases (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="コース管理"
          description="学習コースの作成と管理"
          actions={
            <Link href="/admin/courses/new">
              <Button icon={Plus}>
                新規コース作成
              </Button>
            </Link>
          }
        />

        {/* コース一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} hover>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    course.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.is_published ? (
                      <>
                        <Eye className="w-3 h-3" />
                        公開中
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        下書き
                      </>
                    )}
                  </span>
                </div>
                
                {course.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* コース統計 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Video className="w-4 h-4" />
                      動画数
                    </span>
                    <span className="font-medium">
                      {course.course_videos?.[0]?.count || 0} 本
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      受講者数
                    </span>
                    <span className="font-medium">
                      {course.course_purchases?.[0]?.count || 0} 人
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      価格
                    </span>
                    <span className="font-medium">
                      ¥{course.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" icon={Edit} fullWidth>
                      編集
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/videos`} className="flex-1">
                    <Button variant="primary" size="sm" icon={Video} fullWidth>
                      動画管理
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!courses || courses.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">まだコースがありません</p>
              <Link href="/admin/courses/new">
                <Button icon={Plus}>
                  最初のコースを作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}