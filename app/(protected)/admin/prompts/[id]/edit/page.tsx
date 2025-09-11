'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X, Image, Video, Music, FileText, Code } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TagInput } from '@/components/ui/tag-input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { FileUploader } from '@/components/ui/FileUploader'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'image', name: '画像生成', icon: Image, color: 'text-purple-600 bg-purple-100' },
  { id: 'video', name: '動画生成', icon: Video, color: 'text-blue-600 bg-blue-100' },
  { id: 'music', name: '音楽生成', icon: Music, color: 'text-green-600 bg-green-100' },
  { id: 'text', name: 'テキスト生成', icon: FileText, color: 'text-gray-600 bg-gray-100' },
  { id: 'code', name: 'コード生成', icon: Code, color: 'text-orange-600 bg-orange-100' }
]

const aiTools = {
  image: ['Midjourney', 'Stable Diffusion', 'DALL-E 3', 'Leonardo AI', 'Ideogram'],
  video: ['Runway', 'Pika Labs', 'Stable Video', 'Gen-2', 'Kaiber'],
  music: ['Suno AI', 'Udio', 'Soundraw', 'AIVA', 'Mubert'],
  text: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot'],
  code: ['GitHub Copilot', 'Cursor', 'Codeium', 'Tabnine', 'Amazon CodeWhisperer']
}

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exampleImages, setExampleImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; url?: string; type: string }>>([])
  const [articleContent, setArticleContent] = useState('')
  const [isArticleMode, setIsArticleMode] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'image',
    ai_tool: 'Midjourney',
    price: 1000,
    prompt_text: '',
    example_output: '',
    tags: [] as string[],
    is_published: false,
  })

  const normalizeTitle = (raw: string) => {
    if (!raw) return ''
    const base = raw.split('\\').pop()!.split('/').pop()!
    return base.replace(/\.(png|jpe?g|webp|gif|csv|pdf|txt|md)$/i, '')
  }

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        alert('プロンプトが見つかりません')
        router.replace('/admin/prompts')
        return
      }

      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'image',
        ai_tool: data.ai_tool || aiTools[(data.category || 'image') as keyof typeof aiTools][0],
        price: data.price ?? 0,
        prompt_text: data.prompt_text || '',
        example_output: data.example_output || '',
        tags: data.tags || [],
        is_published: !!data.is_published,
      })
      setExampleImages(data.example_images || [])
      setAttachedFiles((data.attachments || []).map((f: any) => ({ name: f.name, url: f.url, type: f.type || 'application/octet-stream' })))
      setArticleContent(data.article_content || '')
      setIsArticleMode(!!data.article_content)
      setLoading(false)
    }
    fetchPrompt()
  }, [id])

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      ai_tool: aiTools[category as keyof typeof aiTools][0]
    })
  }

  const addExampleImage = () => {
    if (imageInput.trim() && !exampleImages.includes(imageInput.trim())) {
      setExampleImages([...exampleImages, imageInput.trim()])
      setImageInput('')
    }
  }

  const removeExampleImage = (index: number) => {
    setExampleImages(exampleImages.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (files: Array<{ name: string; content: string; type: string }>) => {
    const uploadedFiles = [] as Array<{ name: string; url?: string; type: string }>
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('prompt-attachments')
        .upload(fileName, new Blob([file.content], { type: file.type }))
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('prompt-attachments')
          .getPublicUrl(data.path)
        uploadedFiles.push({ name: file.name, url: publicUrl, type: file.type })
      }
    }
    setAttachedFiles(prev => [...prev, ...uploadedFiles])
  }

  const handleRemoveFile = (fileName: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.name !== fileName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const updateData = {
        ...formData,
        price: Number.isFinite(formData.price) ? formData.price : 0,
        example_images: exampleImages.length > 0 ? exampleImages : null,
        attachments: attachedFiles.length > 0 ? attachedFiles : null,
        article_content: isArticleMode ? articleContent : null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('prompts')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      router.push('/admin/prompts')
      router.refresh()
    } catch (error) {
      console.error('Error updating prompt:', error)
      alert('プロンプトの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="プロンプト編集"
          description="登録済みプロンプトの内容を更新"
          actions={
            <Button variant="ghost" icon={ArrowLeft} onClick={() => router.back()}>
              戻る
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, title: normalizeTitle(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                          formData.category === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className={cn('p-2 rounded-lg', cat.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AIツール <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.ai_tool}
                    onChange={(e) => setFormData({ ...formData, ai_tool: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {aiTools[formData.category as keyof typeof aiTools].map(tool => (
                      <option key={tool} value={tool}>{tool}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">価格（円） <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                <TagInput value={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} placeholder="タグを入力してEnterキーで追加" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>プロンプト内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={!isArticleMode} onChange={() => setIsArticleMode(false)} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">シンプルテキスト</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={isArticleMode} onChange={() => setIsArticleMode(true)} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">記事形式（リッチテキスト）</span>
                </label>
              </div>

              {isArticleMode ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">記事内容 <span className="text-red-500">*</span></label>
                  <RichTextEditor content={articleContent} onChange={setArticleContent} placeholder="記事形式でプロンプトの説明を作成..." />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">プロンプト <span className="text-red-500">*</span></label>
                  <textarea
                    required={!isArticleMode}
                    value={formData.prompt_text}
                    onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="実際のプロンプトテキストを入力..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">添付ファイル（CSV、PDF、テキストファイルなど）</label>
                <FileUploader
                  onFileUpload={handleFileUpload}
                  acceptedFormats={['.csv', '.pdf', '.txt', '.json', '.md']}
                  maxFiles={5}
                  currentFiles={attachedFiles.map(f => ({ name: f.name, url: f.url }))}
                  onRemoveFile={handleRemoveFile}
                />
                <p className="mt-2 text-sm text-gray-500">ダウンロード可能なファイルを添付できます（CSV、PDF、テキストファイルなど）</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出力例の説明</label>
                <textarea
                  value={formData.example_output}
                  onChange={(e) => setFormData({ ...formData, example_output: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">出力例の画像URL</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="画像のURLを入力..."
                    />
                    <Button type="button" variant="secondary" icon={Plus} onClick={addExampleImage}>追加</Button>
                  </div>

                  {exampleImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {exampleImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Example ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E画像エラー%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeExampleImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">公開する</span>
              </label>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              キャンセル
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              更新する
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
