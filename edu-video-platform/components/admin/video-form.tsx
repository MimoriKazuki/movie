'use client'

import { useState } from 'react'
import { Database } from '@/types/database'

type VideoInsert = Database['public']['Tables']['videos']['Insert']

interface VideoFormProps {
  video?: VideoInsert
  onSubmit: (data: VideoInsert) => Promise<void>
  isLoading?: boolean
}

export function VideoForm({ video, onSubmit, isLoading }: VideoFormProps) {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    vimeo_id: video?.vimeo_id || '',
    genre: video?.genre || '',
    tags: video?.tags?.join(', ') || '',
    is_published: video?.is_published || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await onSubmit({
      title: formData.title,
      description: formData.description || null,
      vimeo_id: formData.vimeo_id,
      genre: formData.genre || null,
      tags: tags.length > 0 ? tags : null,
      is_published: formData.is_published,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-gray-900 bg-white"
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-gray-900 bg-white"
        />
        <p className="mt-1 text-sm text-gray-500">
          VimeoのURLから数字のIDを抽出してください
        </p>
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-gray-900 bg-white"
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
          ジャンル
        </label>
        <input
          type="text"
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-gray-900 bg-white"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          タグ
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="カンマ区切りで入力 (例: プログラミング, JavaScript, 初心者向け)"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 text-gray-900 bg-white"
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

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}