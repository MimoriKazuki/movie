'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, FileText, Save, Sparkles } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'

// TipTapエディタを動的インポート
const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then(mod => mod.RichTextEditor),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
  }
)

export default function NewPromptPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; type: string }>>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'text',
    ai_tool: 'ChatGPT',
    price: 0,
    content: '',
    instructions: '',
    example_output: '',
    tags: [] as string[],
    is_published: false,
    is_featured: false
  })

  // ファイルアップロード処理
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${file.name}`
          
          const { data, error } = await supabase.storage
            .from('prompt-attachments')
            .upload(fileName, file)
          
          if (error) throw error
          
          const { data: { publicUrl } } = supabase.storage
            .from('prompt-attachments')
            .getPublicUrl(data.path)
          
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            url: publicUrl,
            type: file.type
          }])
          
          // CSVファイルの場合、内容をプレビュー
          if (file.type === 'text/csv') {
            Papa.parse(file, {
              complete: (result) => {
                const preview = result.data.slice(0, 5)
                console.log('CSV Preview:', preview)
              }
            })
          }
        } catch (error) {
          console.error('File upload error:', error)
          alert(`ファイルのアップロードに失敗しました: ${file.name}`)
        }
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('ログインが必要です')
        router.push('/login')
        return
      }

      // 二重チェック: 管理者のみ作成可
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') {
        alert('管理者のみプロンプトを登録できます')
        router.replace('/prompts')
        return
      }

      const promptData = {
        ...formData,
        seller_id: user.id,
        attachments: uploadedFiles.length > 0 ? uploadedFiles : null,
        example_images: uploadedFiles
          .filter(f => f.type.startsWith('image/'))
          .map(f => f.url)
          .slice(0, 3) // 最初の3枚を例として使用
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert([promptData])
        .select()
        .single()

      if (error) throw error

      alert('プロンプトを登録しました！')
      router.push(`/prompts/${data.id}`)
    } catch (error) {
      console.error('Error creating prompt:', error)
      alert('プロンプトの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 初期表示時に権限チェック（クライアント側でもUI制御）
  // 管理者以外は即時リダイレクト
  
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAllowed(false)
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const allowed = profile?.role === 'admin'
      setIsAllowed(allowed)
      if (!allowed) {
        alert('管理者のみアクセスできます')
        router.replace('/prompts')
      }
    })()
  }, [])

  const categories = [
    { value: 'text', label: 'テキスト生成', icon: '📝' },
    { value: 'image', label: '画像生成', icon: '🎨' },
    { value: 'video', label: '動画生成', icon: '🎬' },
    { value: 'code', label: 'コード生成', icon: '💻' },
    { value: 'music', label: '音楽生成', icon: '🎵' }
  ]

  const aiTools = [
    'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Stable Diffusion',
    'DALL-E', 'GitHub Copilot', 'Perplexity AI', 'その他'
  ]

  const tagSuggestions = [
    'ビジネス', 'マーケティング', 'SEO', 'ブログ', 'SNS',
    'プログラミング', 'デザイン', '教育', '創作', '分析',
    '効率化', '自動化', 'レポート作成', 'アイデア生成'
  ]

  if (isAllowed === false) return null
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/prompts"
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                プロンプトを登録
              </h1>
              <p className="text-gray-600 mt-1">
                あなたの優れたプロンプトを共有して収益を得ましょう
              </p>
            </div>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: SEO最適化されたブログ記事を書くプロンプト"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明 *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="このプロンプトの特徴や使い方を説明してください"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリー *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対応AIツール *
                  </label>
                  <select
                    value={formData.ai_tool}
                    onChange={(e) => setFormData({ ...formData, ai_tool: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {aiTools.map(tool => (
                      <option key={tool} value={tool}>{tool}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円） *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0（無料）または 100円単位で設定"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0円の場合は無料プロンプトとして公開されます
                </p>
              </div>
            </div>
          </div>

          {/* プロンプト内容 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">プロンプト内容</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロンプト本文 *
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="実際のプロンプトを入力してください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  使用方法
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="プロンプトの使い方や注意点を記載"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出力例
                </label>
                <textarea
                  value={formData.example_output}
                  onChange={(e) => setFormData({ ...formData, example_output: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="このプロンプトを使った際の出力例"
                />
              </div>
            </div>
          </div>

          {/* ファイルアップロード */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">添付ファイル</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'ファイルをドロップしてください'
                  : 'クリックまたはドラッグ&ドロップでファイルをアップロード'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                対応形式: CSV, PDF, TXT, 画像ファイル
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* タグ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">タグ</h2>
            
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (formData.tags.includes(tag)) {
                      setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
                    } else {
                      setFormData({ ...formData, tags: [...formData.tags, tag] })
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 公開設定 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">公開設定</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-gray-700">すぐに公開する</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                />
                <span className="text-gray-700">おすすめプロンプトとして申請する</span>
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {isLoading ? '登録中...' : 'プロンプトを登録'}
            </button>
            
            <Link
              href="/prompts"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
