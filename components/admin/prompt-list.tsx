'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Edit, Trash2, Eye, EyeOff, Package, Search, Star, DollarSign, Image, Video, Music, FileText, Code } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Prompt {
  id: string
  title: string
  description: string | null
  category: string
  ai_tool: string
  price: number
  prompt_text: string
  example_output: string | null
  example_images: string[] | null
  tags: string[] | null
  usage_count: number
  rating: number
  is_published: boolean
  is_featured: boolean
  seller_id: string
  created_at: string
  seller?: {
    name: string | null
    email: string
  }
  purchases?: { count: number }[]
  reviews?: { rating: number }[]
}

interface PromptListProps {
  prompts: Prompt[]
}

const categoryIcons = {
  image: Image,
  video: Video,
  music: Music,
  text: FileText,
  code: Code
}

const categoryColors = {
  image: 'text-purple-600 bg-purple-100',
  video: 'text-blue-600 bg-blue-100',
  music: 'text-green-600 bg-green-100',
  text: 'text-gray-600 bg-gray-100',
  code: 'text-orange-600 bg-orange-100'
}

export function PromptList({ prompts: initialPrompts }: PromptListProps) {
  const [prompts, setPrompts] = useState(initialPrompts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const supabase = createClient()
  const router = useRouter()

  // フィルタリング
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.ai_tool.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || prompt.category === filterCategory
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && prompt.is_published) ||
                         (filterStatus === 'draft' && !prompt.is_published)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const togglePublish = async (prompt: Prompt) => {
    const { error } = await supabase
      .from('prompts')
      .update({ is_published: !prompt.is_published })
      .eq('id', prompt.id)

    if (!error) {
      setPrompts(prompts.map(p => 
        p.id === prompt.id ? { ...p, is_published: !p.is_published } : p
      ))
    }
  }

  const toggleFeatured = async (prompt: Prompt) => {
    const { error } = await supabase
      .from('prompts')
      .update({ is_featured: !prompt.is_featured })
      .eq('id', prompt.id)

    if (!error) {
      setPrompts(prompts.map(p => 
        p.id === prompt.id ? { ...p, is_featured: !p.is_featured } : p
      ))
    }
  }

  const deletePrompt = async (id: string) => {
    if (!confirm('このプロンプトを削除してもよろしいですか？')) return

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (!error) {
      setPrompts(prompts.filter(p => p.id !== id))
    }
  }

  const calculateAverageRating = (reviews: { rating: number }[] | undefined) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>プロンプト一覧</CardTitle>
          
          {/* フィルター */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="プロンプトを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全カテゴリー</option>
              <option value="image">画像生成</option>
              <option value="video">動画生成</option>
              <option value="music">音楽生成</option>
              <option value="text">テキスト生成</option>
              <option value="code">コード生成</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                全て ({prompts.length})
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                公開中 ({prompts.filter(p => p.is_published).length})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === 'draft' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                下書き ({prompts.filter(p => !p.is_published).length})
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AIツール
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  販売数
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  評価
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  おすすめ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                      ? '検索条件に一致するプロンプトがありません' 
                      : 'プロンプトがありません'}
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((prompt) => {
                  const Icon = categoryIcons[prompt.category as keyof typeof categoryIcons] || Package
                  const colorClass = categoryColors[prompt.category as keyof typeof categoryColors] || 'text-gray-600 bg-gray-100'
                  
                  return (
                    <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prompt.title}
                          </div>
                          {prompt.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {prompt.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', colorClass)}>
                          <Icon className="w-3 h-3" />
                          {prompt.category === 'image' ? '画像' :
                           prompt.category === 'video' ? '動画' :
                           prompt.category === 'music' ? '音楽' :
                           prompt.category === 'text' ? 'テキスト' :
                           prompt.category === 'code' ? 'コード' : 'その他'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {prompt.ai_tool}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            ¥{prompt.price.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          0
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            -
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublish(prompt)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                            prompt.is_published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          )}
                        >
                          {prompt.is_published ? (
                            <>
                              <Eye className="w-3 h-3" />
                              公開中
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              下書き
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(prompt)}
                          className="transition-colors"
                        >
                          <Star 
                            className={cn(
                              "w-5 h-5",
                              prompt.is_featured 
                                ? "text-yellow-500 fill-current" 
                                : "text-gray-300 hover:text-yellow-400"
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/prompts/${prompt.id}/edit`}>
                            <Button size="sm" variant="ghost" icon={Edit} className="flex-row">
                              <span className="whitespace-nowrap">編集</span>
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            icon={Trash2} 
                            onClick={() => deletePrompt(prompt.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-row"
                          >
                            <span className="whitespace-nowrap">削除</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}