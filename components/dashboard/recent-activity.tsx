import { createClient } from '@/lib/supabase/server'
import { Trophy, Target, Flame, Star, Award, TrendingUp, Calendar, BookOpen } from 'lucide-react'

interface RecentActivityProps {
  userId: string
}

export default async function RecentActivity({ userId }: RecentActivityProps) {
  const supabase = await createClient()
  
  // ユーザーの統計情報を取得
  const { data: viewHistory } = await supabase
    .from('view_history')
    .select('*')
    .eq('user_id', userId)
  
  const totalWatchTime = viewHistory?.reduce((acc, v) => acc + (v.progress || 0), 0) || 0
  const totalVideos = viewHistory?.length || 0
  
  // 今週の学習時間（ダミーデータ）
  const weeklyProgress = [
    { day: '月', hours: 2 },
    { day: '火', hours: 1.5 },
    { day: '水', hours: 3 },
    { day: '木', hours: 2.5 },
    { day: '金', hours: 1 },
    { day: '土', hours: 4 },
    { day: '日', hours: 2 },
  ]
  
  const maxHours = Math.max(...weeklyProgress.map(d => d.hours))

  return (
    <div className="space-y-6">
      {/* 学習統計カード */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          学習統計
        </h3>
        
        <div className="space-y-4">
          {/* 連続学習日数 */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">連続学習</p>
                <p className="text-xl font-bold text-gray-900">7日間</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">最高記録</p>
              <p className="text-sm font-medium text-orange-600">15日</p>
            </div>
          </div>

          {/* 今月の学習時間 */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">今月の学習</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor(totalWatchTime / 60)}時間</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">先月比</p>
              <p className="text-sm font-medium text-green-600">+25%</p>
            </div>
          </div>

          {/* 完了したレッスン */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">完了レッスン</p>
                <p className="text-xl font-bold text-gray-900">{totalVideos}本</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">今週</p>
              <p className="text-sm font-medium text-green-600">+12本</p>
            </div>
          </div>
        </div>
      </div>

      {/* 今週の学習グラフ */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          今週の学習時間
        </h3>
        
        <div className="space-y-2">
          {weeklyProgress.map((day, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-8">{day.day}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(day.hours / maxHours) * 100}%` }}
                />
                <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-gray-700">
                  {day.hours}h
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">週間合計</span>
            <span className="text-lg font-bold text-gray-900">
              {weeklyProgress.reduce((acc, d) => acc + d.hours, 0)}時間
            </span>
          </div>
        </div>
      </div>

      {/* 達成バッジ */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          最近の達成
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Star, color: 'text-yellow-500 bg-yellow-50', label: '初心者' },
            { icon: Target, color: 'text-blue-500 bg-blue-50', label: '5日連続' },
            { icon: Trophy, color: 'text-purple-500 bg-purple-50', label: '10本完了' },
          ].map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full ${badge.color.split(' ')[1]} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-8 h-8 ${badge.color.split(' ')[0]}`} />
                </div>
                <p className="text-xs text-gray-600">{badge.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* モチベーションメッセージ */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="font-bold mb-2">今日も頑張りましょう！</h3>
        <p className="text-sm text-white/90">
          継続は力なり。毎日少しずつでも学習を続けることで、確実にスキルアップできます。
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-yellow-300" />
          </div>
          <span className="text-sm">今日の目標: 2レッスン完了</span>
        </div>
      </div>
    </div>
  )
}