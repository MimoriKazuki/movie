'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VideoFormWithUpload } from '@/components/admin/video-form-with-upload'

export default function NewVideoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: {
    title: string
    description: string | null
    vimeo_id: string
    genre: string | null
    tags: string[] | null
    is_published: boolean
    is_recommended: boolean
    thumbnail_url?: string | null
  }) => {
    setIsLoading(true)
    try {
      console.log('Creating video with data:', data)
      
      const { data: result, error } = await supabase
        .from('videos')
        .insert([data])
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      console.log('Video created successfully:', result)
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Error creating video:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      alert(`動画の作成に失敗しました: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">新規動画追加</h1>
      <VideoFormWithUpload onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}