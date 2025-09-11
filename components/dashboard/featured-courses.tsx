import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star, Users, Clock, PlayCircle, ChevronRight, TrendingUp } from 'lucide-react'
import { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']

interface FeaturedCoursesProps {
  userId: string
  isAdmin: boolean
}

export default async function FeaturedCourses({ userId, isAdmin }: FeaturedCoursesProps) {
  const supabase = await createClient()
  
  let courses: Course[] = []
  
  if (isAdmin) {
    // 管理者は全てのコースを見ることができる
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    courses = data || []
  } else {
    // 一般ユーザーは購入可能なコースを表示
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    courses = data || []
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">おすすめのコース</h2>
        <p className="text-gray-500">現在、利用可能なコースはありません。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">おすすめのコース</h2>
          <p className="text-gray-600 mt-1">あなたにぴったりの学習コンテンツ</p>
        </div>
        <Link 
          href="/courses" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          すべて見る
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="flex">
              {/* サムネイル */}
              <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative flex-shrink-0">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/50" />
                  </div>
                )}
                
                {/* ベストセラーバッジ */}
                {Math.random() > 0.5 && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                    ベストセラー
                  </div>
                )}
              </div>

              {/* コンテンツ */}
              <div className="flex-1 p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                
                {course.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* 統計情報 */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-700">4.5</span>
                    <span>(1,234)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>5,678人</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>10時間</span>
                  </div>
                </div>

                {/* 価格 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {course.price === 0 ? (
                      <span className="text-lg font-bold text-green-600">無料</span>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          ¥{course.price.toLocaleString()}
                        </span>
                        {Math.random() > 0.5 && (
                          <span className="text-sm text-gray-500 line-through">
                            ¥{(course.price * 1.5).toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  {Math.random() > 0.7 && (
                    <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      人気急上昇
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}