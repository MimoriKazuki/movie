'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Upload, X } from 'lucide-react'
import { TagInput } from '@/components/ui/tag-input'

type VideoInsert = Database['public']['Tables']['videos']['Insert']

interface VideoFormWithUploadProps {
  video?: VideoInsert & { thumbnail_url?: string | null }
  onSubmit: (data: VideoInsert) => Promise<void>
  isLoading?: boolean
}

export function VideoFormWithUpload({ video, onSubmit, isLoading }: VideoFormWithUploadProps) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    vimeo_id: video?.vimeo_id || '',
    genre: video?.genre || '',
    genre_id: (video as any)?.genre_id || '',
    tags: video?.tags || [],
    is_published: video?.is_published || false,
    is_recommended: (video as any)?.is_recommended || false,
    thumbnail_url: video?.thumbnail_url || null,
  })
  const [genres, setGenres] = useState<Array<{id: string, name: string, slug: string}>>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    video?.thumbnail_url || null
  )
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const supabase = createClient()
  
  // タグの候補
  const tagSuggestions = [
    '初心者向け', '中級者向け', '上級者向け',
    'JavaScript', 'Python', 'React', 'Vue.js', 'Node.js',
    'AI', '機械学習', 'データ分析', 'Web開発', 'モバイル開発',
    'UI/UX', 'デザイン基礎', 'ビジネススキル', 'マーケティング',
    '英語', '日本語', 'TOEIC', '実践的', 'ハンズオン'
  ]
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase
          .from('genres')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('display_order')
        
        if (error) {
          console.error('Error fetching genres:', error)
          throw error
        }
        
        if (data && data.length > 0) {
          console.log('Fetched genres:', data)
          setGenres(data)
        } else {
          console.log('No genres found, using fallback')
          throw new Error('No genres found')
        }
      } catch (error) {
        console.error('Genre fetch failed, using fallback genres')
        // フォールバック: 基本的なジャンルを手動で設定
        const fallbackGenres = [
          { id: 'prog', name: 'プログラミング', slug: 'programming' },
          { id: 'data', name: 'データサイエンス', slug: 'data-science' },
          { id: 'design', name: 'デザイン', slug: 'design' },
          { id: 'business', name: 'ビジネス', slug: 'business' },
          { id: 'language', name: '語学', slug: 'language' },
          { id: 'math', name: '数学', slug: 'mathematics' },
          { id: 'science', name: '科学', slug: 'science' },
          { id: 'music', name: '音楽', slug: 'music' },
          { id: 'art', name: 'アート', slug: 'art' },
          { id: 'others', name: 'その他', slug: 'others' }
        ]
        setGenres(fallbackGenres)
      }
    }
    fetchGenres()
  }, [])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setFormData({ ...formData, thumbnail_url: null })
  }

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return formData.thumbnail_url

    setUploadingThumbnail(true)
    try {
      const fileExt = thumbnailFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('video-thumbnails')
        .upload(fileName, thumbnailFile)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('サムネイルのアップロードに失敗しました')
      return null
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const thumbnailUrl = await uploadThumbnail()
      
      const submitData = {
        title: formData.title,
        description: formData.description || null,
        vimeo_id: formData.vimeo_id,
        thumbnail_url: thumbnailUrl,
        genre: formData.genre || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_published: formData.is_published,
        is_recommended: formData.is_recommended,
      }
      
      console.log('Submitting video data:', submitData)
      
      await onSubmit(submitData as any)
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('動画の保存に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'))
    }
  }

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 bg-white text-gray-900"

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          style={{ backgroundColor: 'white', color: '#111827' }}
        />
      </div>

      <div>
        <label htmlFor="vimeo_id" className="block text-sm font-medium text-gray-700">
          Vimeo ID *
        </label>
        <input
          type="text"
          id="vimeo_id"
          required
          value={formData.vimeo_id}
          onChange={(e) => setFormData({ ...formData, vimeo_id: e.target.value })}
          placeholder="例: 123456789"
          className={inputClass}
          style={{ backgroundColor: 'white', color: '#111827' }}
        />
        <p className="mt-1 text-sm text-gray-500">
          VimeoのURLから数字のIDを抽出してください
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          サムネイル画像
        </label>
        {thumbnailPreview ? (
          <div className="relative w-full max-w-md">
            <img
              src={thumbnailPreview}
              alt="サムネイルプレビュー"
              className="w-full aspect-video object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeThumbnail}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <label 
              htmlFor="thumbnail-upload" 
              className="block cursor-pointer"
            >
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 bg-white">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      クリックして画像を選択
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF 最大10MB</p>
                </div>
              </div>
            </label>
            <input
              id="thumbnail-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={inputClass}
          style={{ backgroundColor: 'white', color: '#111827' }}
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
          ジャンル *
        </label>
        <select
          id="genre"
          value={formData.genre_id || ''}
          onChange={(e) => {
            const selectedGenre = genres.find(g => g.id === e.target.value)
            console.log('Selected genre:', selectedGenre)
            setFormData({ 
              ...formData, 
              genre_id: e.target.value,
              genre: selectedGenre?.name || ''
            })
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          required
        >
          <option value="">ジャンルを選択してください</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            {genres.length > 0 ? `${genres.length}個のジャンルが利用可能` : 'ジャンル情報を読み込み中...'}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          suggestions={tagSuggestions}
          maxTags={10}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_published"
          checked={formData.is_published}
          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
          公開する
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_recommended"
          checked={formData.is_recommended}
          onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
          className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
        />
        <label htmlFor="is_recommended" className="ml-2 block text-sm text-gray-900">
          おすすめ動画に設定する
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading || uploadingThumbnail}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || uploadingThumbnail ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}