'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestGenres() {
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        console.log('Fetching genres...')
        
        // まずテーブルが存在するか確認
        const { data: tables, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'genres')
          
        console.log('Tables check:', tables, tableError)
        
        const { data, error } = await supabase
          .from('genres')
          .select('*')
          .order('display_order')
        
        console.log('Genres fetch result:', { data, error })
        
        if (error) {
          setError(error.message)
        } else {
          setGenres(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('予期しないエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  const createSampleGenres = async () => {
    try {
      const sampleGenres = [
        { name: 'プログラミング', slug: 'programming', description: 'プログラミング言語、開発ツール、フレームワークなど', display_order: 1 },
        { name: 'データサイエンス', slug: 'data-science', description: '機械学習、データ分析、統計学など', display_order: 2 },
        { name: 'デザイン', slug: 'design', description: 'UI/UX、グラフィックデザイン、Webデザインなど', display_order: 3 },
        { name: 'ビジネス', slug: 'business', description: 'マーケティング、経営、プロジェクト管理など', display_order: 4 },
        { name: 'その他', slug: 'others', description: 'その他のカテゴリー', display_order: 5 }
      ]

      for (const genre of sampleGenres) {
        const { error } = await supabase
          .from('genres')
          .insert(genre)
        
        if (error) {
          console.error('Error inserting genre:', genre.name, error)
        }
      }
      
      // 再取得
      const { data } = await supabase
        .from('genres')
        .select('*')
        .order('display_order')
      
      setGenres(data || [])
      
    } catch (error) {
      console.error('Error creating sample genres:', error)
    }
  }

  if (loading) {
    return <div className="p-4">ジャンルを読み込み中...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ジャンルテスト</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          エラー: {error}
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={createSampleGenres}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          サンプルジャンルを作成
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">取得されたジャンル ({genres.length}件):</h3>
        {genres.length > 0 ? (
          <ul className="space-y-2">
            {genres.map((genre, index) => (
              <li key={genre.id || index} className="bg-white p-2 rounded">
                <strong>{genre.name}</strong> (ID: {genre.id}, Slug: {genre.slug})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">ジャンルが見つかりません</p>
        )}
      </div>
    </div>
  )
}