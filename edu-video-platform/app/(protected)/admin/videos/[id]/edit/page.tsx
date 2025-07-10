'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VideoFormWithUpload } from '@/components/admin/video-form-with-upload'
import { Database } from '@/types/database'

type Video = Database['public']['Tables']['videos']['Row']

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchVideo()
  }, [resolvedParams.id])

  const fetchVideo = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (data) {
      setVideo(data)
    }
  }

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
      console.log('Updating video with data:', data)
      
      const { data: result, error } = await supabase
        .from('videos')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedParams.id)
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      console.log('Video updated successfully:', result)
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Error updating video:', error)
      const errorMessage = error instanceof Error ? error.message : '不明なエラー'
      alert(`動画の更新に失敗しました: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!video) {
    return <div className="container mx-auto px-4 py-8">読み込み中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">動画編集</h1>
      <VideoFormWithUpload video={video} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}