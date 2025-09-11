import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlayCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface LearningProgressProps {
  userId: string
}

export default async function LearningProgress({ userId }: LearningProgressProps) {
  const supabase = await createClient()
  
  // 視聴履歴から進行中のコースを取得
  const { data: viewHistory } = await supabase
    .from('view_history')
    .select(`
      *,
      video:videos(
        *,
        course_videos(
          courses(*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('last_viewed_at', { ascending: false })
    .limit(3)

  // 購入済みコースの進捗を計算
  const { data: purchases } = await supabase
    .from('course_purchases')
    .select(`
      *,
      courses(*)
    `)
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })
    .limit(3)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">学習を続ける</h2>
          <p className="text-gray-600 mt-1">最近の学習進捗</p>
        </div>
        <Link 
          href="/mypage" 
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          マイページへ →
        </Link>
      </div>

      {/* 進行中のコース */}
      <div className="space-y-4">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase) => {
            // ダミーの進捗率を生成
            const progress = Math.floor(Math.random() * 80) + 10
            
            return (
              <div
                key={purchase.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {purchase.courses?.title || 'コース名'}
                    </h3>
                    
                    {/* 進捗バー */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">進捗状況</span>
                        <span className="text-sm font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 統計 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <PlayCircle className="w-4 h-4" />
                        <span>{Math.floor(Math.random() * 20) + 5}/{Math.floor(Math.random() * 30) + 20} レッスン</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(Math.random() * 10) + 2}時間 / 総{Math.floor(Math.random() * 20) + 10}時間</span>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <Link
                    href={`/courses/${purchase.course_id}`}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    続きを見る
                  </Link>
                </div>

                {/* 最近の達成事項 */}
                {progress > 50 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">
                        最近「セクション{Math.floor(Math.random() * 5) + 1}」を完了しました
                      </span>
                      <TrendingUp className="w-4 h-4 text-orange-500 ml-auto" />
                      <span className="text-orange-600 font-medium">連続{Math.floor(Math.random() * 7) + 1}日学習中！</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">まだコースを受講していません</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              コースを探す
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}