'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VideoCardWithHistory } from '@/components/video/video-card-with-history'
import { ViewHistory } from '@/types/database'

export default function TestViewHistory() {
  const [result, setResult] = useState<any>('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const testConnection = async () => {
    setLoading(true)
    try {
      // 1. 現在のユーザーを確認
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        setResult(`User error: ${userError.message}`)
        return
      }
      
      if (!user) {
        setResult('No user logged in')
        return
      }

      // 2. プロファイルを確認
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        setResult(`Profile error: ${profileError.message}`)
        return
      }

      // 3. 動画を1つ取得
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .limit(1)
        .single()
      
      if (videoError) {
        setResult(`Video error: ${videoError.message}`)
        return
      }

      // 4. 視聴履歴を作成してみる
      const { data: insertData, error: insertError } = await supabase
        .from('view_history')
        .upsert({
          user_id: user.id,
          video_id: video.id,
          progress: 10,
          last_viewed_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        setResult(`Insert error: ${insertError.message}\n${JSON.stringify(insertError, null, 2)}`)
        return
      }

      // 5. 視聴履歴を取得
      const { data: history, error: historyError } = await supabase
        .from('view_history')
        .select('*, video:videos(*)')
        .eq('user_id', user.id)

      if (historyError) {
        setResult(`History error: ${historyError.message}`)
        return
      }

      setResult({
        user: user.id,
        profile,
        testVideo: video.id,
        insertResult: insertData,
        allHistory: history,
        historyComponent: history
      })

    } catch (error) {
      setResult(`Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const hasHistory = result?.historyComponent && result.historyComponent.length > 0

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">視聴履歴デバッグツール</h2>
      <button
        onClick={testConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'テスト中...' : 'テスト実行'}
      </button>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre className="whitespace-pre-wrap text-xs">
          {typeof result === 'object' ? JSON.stringify({
            user: result.user,
            profile: result.profile,
            testVideo: result.testVideo,
            insertResult: result.insertResult,
            historyCount: result.allHistory?.length || 0
          }, null, 2) : result}
        </pre>
      </div>

      {hasHistory && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">視聴履歴カード表示</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.historyComponent.map((history: ViewHistory) => (
              <VideoCardWithHistory
                key={history.id}
                video={history.video!}
                progress={history.progress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}