'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SetupDatabase() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const supabase = createClient()

  const createGenresTable = async () => {
    setLoading(true)
    setResult('')

    try {
      // 1. genresテーブルを作成
      const { error: tableError } = await supabase.rpc('create_genres_table')
      
      if (tableError) {
        // テーブル作成関数が存在しない場合、直接データを挿入してみる
        console.log('Direct table creation failed, trying direct insert')
        
        // 直接genresテーブルにデータを挿入
        const genres = [
          { name: 'プログラミング', slug: 'programming', description: 'プログラミング言語、開発ツール、フレームワークなど', display_order: 1 },
          { name: 'データサイエンス', slug: 'data-science', description: '機械学習、データ分析、統計学など', display_order: 2 },
          { name: 'デザイン', slug: 'design', description: 'UI/UX、グラフィックデザイン、Webデザインなど', display_order: 3 },
          { name: 'ビジネス', slug: 'business', description: 'マーケティング、経営、プロジェクト管理など', display_order: 4 },
          { name: '語学', slug: 'language', description: '英語、日本語、その他言語学習', display_order: 5 },
          { name: '数学', slug: 'mathematics', description: '基礎数学、応用数学、統計学など', display_order: 6 },
          { name: '科学', slug: 'science', description: '物理、化学、生物学など', display_order: 7 },
          { name: '音楽', slug: 'music', description: '楽器演奏、音楽理論、作曲など', display_order: 8 },
          { name: 'アート', slug: 'art', description: '絵画、彫刻、デジタルアートなど', display_order: 9 },
          { name: 'その他', slug: 'others', description: 'その他のカテゴリー', display_order: 10 }
        ]

        for (const genre of genres) {
          const { error } = await supabase
            .from('genres')
            .upsert(genre, { onConflict: 'slug' })
          
          if (error) {
            console.error('Error inserting genre:', genre.name, error)
          }
        }
      }

      // 2. videosテーブルにis_recommendedカラムを追加（エラーは無視）
      try {
        await supabase.rpc('add_is_recommended_column')
      } catch (e) {
        console.log('Column might already exist')
      }

      // 3. 確認のためにジャンルを取得
      const { data: genres, error: fetchError } = await supabase
        .from('genres')
        .select('*')
        .order('display_order')

      if (fetchError) {
        throw fetchError
      }

      setResult(`✅ セットアップ完了！\n${genres?.length || 0}個のジャンルが作成されました。\n\n` + 
                JSON.stringify(genres, null, 2))

    } catch (error) {
      console.error('Setup error:', error)
      setResult(`❌ エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setLoading(false)
    }
  }

  const checkDatabase = async () => {
    setLoading(true)
    setResult('')

    try {
      // ジャンルテーブルの状況を確認
      const { data: genres, error } = await supabase
        .from('genres')
        .select('*')
        .order('display_order')

      if (error) {
        setResult(`❌ ジャンルテーブルエラー: ${error.message}`)
      } else {
        setResult(`✅ ジャンルテーブル: ${genres?.length || 0}件\n\n` + 
                  JSON.stringify(genres, null, 2))
      }

      // videosテーブルの構造を確認
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .limit(1)

      if (videoError) {
        setResult(prev => prev + `\n\n❌ videosテーブルエラー: ${videoError.message}`)
      } else {
        setResult(prev => prev + `\n\n✅ videosテーブル: アクセス可能`)
      }

    } catch (error) {
      setResult(`❌ エラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">データベースセットアップ</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={checkDatabase}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '確認中...' : 'データベース状況を確認'}
        </button>
        
        <button
          onClick={createGenresTable}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          {loading ? 'セットアップ中...' : 'ジャンルテーブルをセットアップ'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">結果:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}