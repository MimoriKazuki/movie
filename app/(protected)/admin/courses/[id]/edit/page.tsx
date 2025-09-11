'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Save, X, Video, Check, Trash2, Search, Calendar, Tag, Eye, Sparkles } from 'lucide-react'
import { Database } from '@/types/database'

type VideoType = Database['public']['Tables']['videos']['Row']
type PromptType = {
  id: string
  title: string
  category: string
  ai_tool: string
  price: number
  tags: string[] | null
}

export default function EditCoursePage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [activeTab, setActiveTab] = useState<'videos' | 'prompts'>('videos')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 動画関連
  const [videos, setVideos] = useState<VideoType[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [videoSearchTerm, setVideoSearchTerm] = useState('')
  
  // プロンプト関連
  const [prompts, setPrompts] = useState<PromptType[]>([])
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [promptSearchTerm, setPromptSearchTerm] = useState('')
  const [promptCategory, setPromptCategory] = useState<string>('all')
  
  const router = useRouter()
  const supabase = createClient()

  // コース情報とコンテンツを取得
  useEffect(() => {
    const fetchData = async () => {
      // コース情報を取得
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (course) {
        setTitle(course.title)
        setDescription(course.description || '')
        setPrice(course.price.toString())
        setThumbnailUrl(course.thumbnail_url || '')
        setIsPublished(course.is_published)
      }

      // 全動画を取得
      const { data: allVideos } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (allVideos) {
        setVideos(allVideos)
      }

      // 全プロンプトを取得
      const { data: allPrompts } = await supabase
        .from('prompts')
        .select('id, title, category, ai_tool, price, tags')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      if (allPrompts) {
        setPrompts(allPrompts)
      }

      // コースに含まれる動画を取得
      const { data: courseVideos } = await supabase
        .from('course_videos')
        .select('video_id')
        .eq('course_id', courseId)

      if (courseVideos) {
        setSelectedVideos(courseVideos.map(cv => cv.video_id))
      }

      // コースに含まれるプロンプトを取得
      const { data: coursePrompts } = await supabase
        .from('course_prompts')
        .select('prompt_id')
        .eq('course_id', courseId)

      if (coursePrompts) {
        setSelectedPrompts(coursePrompts.map(cp => cp.prompt_id))
      }
    }

    fetchData()
  }, [courseId])

  // 動画のフィルタリング
  const filteredVideos = videos.filter(video => {
    return videoSearchTerm === '' || 
      video.title.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(videoSearchTerm.toLowerCase())
  })

  // プロンプトのフィルタリング
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = promptSearchTerm === '' || 
      prompt.title.toLowerCase().includes(promptSearchTerm.toLowerCase()) ||
      prompt.ai_tool.toLowerCase().includes(promptSearchTerm.toLowerCase())
    
    const matchesCategory = promptCategory === 'all' || prompt.category === promptCategory
    
    return matchesSearch && matchesCategory
  })

  // 動画の選択/解除
  const toggleVideo = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  // プロンプトの選択/解除
  const togglePrompt = (promptId: string) => {
    setSelectedPrompts(prev => 
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (selectedVideos.length === 0 && selectedPrompts.length === 0) {
      setError('少なくとも1つの動画またはプロンプトを選択してください')
      setLoading(false)
      return
    }

    try {
      // コースを更新
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          title,
          description,
          price: parseInt(price) || 0,
          thumbnail_url: thumbnailUrl || null,
          is_published: isPublished
        })
        .eq('id', courseId)

      if (updateError) throw updateError

      // 既存のコース動画を削除
      const { error: deleteVideoError } = await supabase
        .from('course_videos')
        .delete()
        .eq('course_id', courseId)

      if (deleteVideoError) throw deleteVideoError

      // 既存のコースプロンプトを削除
      const { error: deletePromptError } = await supabase
        .from('course_prompts')
        .delete()
        .eq('course_id', courseId)

      if (deletePromptError) throw deletePromptError

      // 新しい動画を関連付け
      if (selectedVideos.length > 0) {
        const courseVideos = selectedVideos.map((videoId, index) => ({
          course_id: courseId,
          video_id: videoId,
          order_index: index
        }))

        const { error: videoError } = await supabase
          .from('course_videos')
          .insert(courseVideos)

        if (videoError) throw videoError
      }

      // 新しいプロンプトを関連付け
      if (selectedPrompts.length > 0) {
        const startIndex = selectedVideos.length
        const coursePrompts = selectedPrompts.map((promptId, index) => ({
          course_id: courseId,
          prompt_id: promptId,
          order_index: startIndex + index
        }))

        const { error: promptError } = await supabase
          .from('course_prompts')
          .insert(coursePrompts)

        if (promptError) throw promptError
      }

      router.push('/admin/courses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このコースを削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      router.push('/admin/courses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader
          title="コース編集"
          description="コース情報を編集します"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>コース基本情報</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  削除
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    コースタイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例: AIプロンプトエンジニアリング基礎"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    価格（円）
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    無料コースの場合は0を入力
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="コースの概要を入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サムネイル画像
                </label>
                <ImageUpload
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  bucket="thumbnails"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="published"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  公開する
                </label>
              </div>
            </CardContent>
          </Card>

          {/* コンテンツ選択 */}
          <Card>
            <CardHeader>
              <CardTitle>コースコンテンツ</CardTitle>
            </CardHeader>
            <CardContent>
              {/* タブ */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('videos')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'videos'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  動画を選択 ({selectedVideos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prompts')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'prompts'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  プロンプトを選択 ({selectedPrompts.length})
                </button>
              </div>

              {/* 動画選択タブ */}
              {activeTab === 'videos' && (
                <div>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="動画を検索..."
                        value={videoSearchTerm}
                        onChange={(e) => setVideoSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto p-4">
                    {filteredVideos.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>動画が見つかりません</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredVideos.map((video) => (
                          <div
                            key={video.id}
                            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                              selectedVideos.includes(video.id) 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleVideo(video.id)}
                          >
                            <div className="relative aspect-video bg-gray-100">
                              {video.thumbnail_url ? (
                                <img 
                                  src={video.thumbnail_url} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-500 to-purple-600">
                                  <Video className="w-12 h-12 text-white opacity-50" />
                                </div>
                              )}
                              
                              {selectedVideos.includes(video.id) && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                              
                              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {video.view_count}
                              </div>
                            </div>
                            
                            <div className="p-3">
                              <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                {video.title}
                              </h4>
                              {video.genre && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded mt-2">
                                  <Tag className="w-3 h-3" />
                                  {video.genre}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* プロンプト選択タブ */}
              {activeTab === 'prompts' && (
                <div>
                  <div className="mb-4 flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="プロンプトを検索..."
                        value={promptSearchTerm}
                        onChange={(e) => setPromptSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={promptCategory}
                      onChange={(e) => setPromptCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">全カテゴリー</option>
                      <option value="image">画像生成</option>
                      <option value="video">動画生成</option>
                      <option value="music">音楽生成</option>
                      <option value="text">テキスト生成</option>
                      <option value="code">コード生成</option>
                    </select>
                  </div>

                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto p-4">
                    {filteredPrompts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>プロンプトが見つかりません</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPrompts.map((prompt) => (
                          <div
                            key={prompt.id}
                            className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg p-4 ${
                              selectedPrompts.includes(prompt.id) 
                                ? 'border-purple-500 ring-2 ring-purple-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => togglePrompt(prompt.id)}
                          >
                            {selectedPrompts.includes(prompt.id) && (
                              <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                                  {prompt.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {prompt.ai_tool}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {prompt.category === 'image' ? '画像' :
                                 prompt.category === 'video' ? '動画' :
                                 prompt.category === 'music' ? '音楽' :
                                 prompt.category === 'text' ? 'テキスト' :
                                 prompt.category === 'code' ? 'コード' : 'その他'}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                ¥{prompt.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  選択中: 動画 {selectedVideos.length}件、プロンプト {selectedPrompts.length}件
                </p>
                {(selectedVideos.length > 0 || selectedPrompts.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVideos([])
                      setSelectedPrompts([])
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    選択をクリア
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 送信ボタン */}
          <div className="flex gap-3">
            <Button
              type="submit"
              icon={Save}
              loading={loading}
              disabled={!title || (selectedVideos.length === 0 && selectedPrompts.length === 0) || loading}
            >
              変更を保存
            </Button>
            <Button
              type="button"
              variant="ghost"
              icon={X}
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}