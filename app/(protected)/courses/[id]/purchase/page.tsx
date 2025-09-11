import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Video, Clock, User, CheckCircle, Sparkles, ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CoursePurchasePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // コース情報を取得
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      creator:profiles!courses_created_by_fkey(name, avatar_url),
      course_videos(
        id,
        video:videos(
          id,
          title,
          description,
          duration,
          thumbnail_url
        ),
        order_index
      )
    `)
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (!course) {
    notFound()
  }

  // プロンプトIDがmetadataに含まれている場合、プロンプト情報を取得
  let prompts = []
  if (course.metadata?.prompt_ids && course.metadata.prompt_ids.length > 0) {
    const { data: promptData } = await supabase
      .from('prompts')
      .select('*')
      .in('id', course.metadata.prompt_ids)
    
    prompts = promptData || []
  }

  // 既に購入済みかチェック
  if (user) {
    const { data: purchase } = await supabase
      .from('course_purchases')
      .select('*')
      .eq('course_id', params.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (purchase) {
      redirect(`/courses/${params.id}`)
    }
  }

  // 動画を順番にソート
  const sortedVideos = course.course_videos
    ?.sort((a: any, b: any) => a.order_index - b.order_index)
    .map((cv: any) => cv.video)
    .filter(Boolean) || []

  // 合計時間を計算（分単位）
  const totalDuration = sortedVideos.reduce((acc: number, video: any) => {
    return acc + (video.duration || 0)
  }, 0)

  const handlePurchase = async () => {
    'use server'
    
    if (!user) {
      redirect('/login')
    }

    const supabase = await createClient()
    
    // 購入処理（無料の場合も購入レコードを作成）
    const { error } = await supabase
      .from('course_purchases')
      .insert({
        course_id: params.id,
        user_id: user.id,
        status: 'active'
      })
    
    if (!error) {
      redirect(`/courses/${params.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>

        {/* メインコンテンツ */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* 左側: コース詳細 */}
          <div className="lg:col-span-3 space-y-6">
            {/* サムネイルとタイトル */}
            <div>
              {course.thumbnail_url && (
                <div className="rounded-xl overflow-hidden shadow-lg mb-6">
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-48 lg:h-64 object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-gray-600 leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>

            {/* 統計情報 */}
            <div className="flex flex-wrap gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>{sortedVideos.length}</strong> 本の動画
                </span>
              </div>
              {prompts.length > 0 && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">
                    <strong>{prompts.length}</strong> 個のAIプロンプト
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>{Math.floor(totalDuration / 60)}時間{totalDuration % 60}分</strong>
                </span>
              </div>
            </div>

            {/* カリキュラム */}
            <Card>
              <CardHeader>
                <CardTitle>カリキュラム</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedVideos.slice(0, 5).map((video: any, index: number) => (
                    <div 
                      key={video.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {video.title}
                        </h4>
                      </div>
                      {video.duration && (
                        <span className="text-sm text-gray-500">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  ))}
                  {sortedVideos.length > 5 && (
                    <p className="text-center text-gray-500 text-sm pt-2">
                      他 {sortedVideos.length - 5} 本の動画
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AIプロンプト */}
            {prompts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    含まれるAIプロンプト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {prompts.slice(0, 3).map((prompt: any) => (
                      <div 
                        key={prompt.id}
                        className="border border-purple-200 rounded-lg p-3 bg-purple-50"
                      >
                        <h4 className="font-medium text-gray-900 mb-1">
                          {prompt.title}
                        </h4>
                        {prompt.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {prompt.description}
                          </p>
                        )}
                      </div>
                    ))}
                    {prompts.length > 3 && (
                      <p className="text-center text-gray-500 text-sm">
                        他 {prompts.length - 3} 個のプロンプト
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側: 購入カード */}
          <div className="lg:col-span-2">
            <Card className="sticky top-4 shadow-xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-xl">コースを始める</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* 価格表示 */}
                <div className="text-center py-4 border-b">
                  {course.price > 0 ? (
                    <>
                      <p className="text-4xl font-bold text-gray-900">
                        ¥{course.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">税込み・買い切り</p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-green-600">
                        無料
                      </p>
                      <p className="text-sm text-gray-500 mt-1">今すぐ始められます</p>
                    </>
                  )}
                </div>

                {/* 購入ボタン */}
                <form action={handlePurchase}>
                  {user ? (
                    <Button 
                      type="submit"
                      className="w-full" 
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {course.price > 0 ? '購入して始める' : '無料で始める'}
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full" size="lg">
                        ログインして始める
                      </Button>
                    </Link>
                  )}
                </form>
                <p className="mt-2 text-xs text-gray-500 flex items-center justify-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-600"><path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6A2.25 2.25 0 003.75 11.25v8.25A2.25 2.25 0 006 21.75h12a2.25 2.25 0 002.25-2.25v-8.25A2.25 2.25 0 0018 9H16.5V6A4.5 4.5 0 0012 1.5zm-3 7.5V6a3 3 0 116 0v3H9z" clipRule="evenodd" /></svg>
                  安全な決済 — Stripeにより保護されています
                </p>

                {/* 含まれる内容 */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-gray-900">このコースに含まれるもの</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{sortedVideos.length} 本の高品質ビデオ</span>
                    </div>
                    {prompts.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{prompts.length} 個の実践的AIプロンプト</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">無制限の視聴アクセス</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">モバイル・タブレット対応</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">学習進捗の自動保存</span>
                    </div>
                  </div>
                </div>

                {/* 講師情報 */}
                {course.creator && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">講師</p>
                    <div className="flex items-center gap-3">
                      {course.creator.avatar_url ? (
                        <img 
                          src={course.creator.avatar_url} 
                          alt={course.creator.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {course.creator.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* 安心保証 */}
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-800 font-medium">
                    安心の学習環境
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    いつでもどこでも学習可能
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
