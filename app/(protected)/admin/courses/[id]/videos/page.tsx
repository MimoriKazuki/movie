'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string | null
  vimeo_id: string
}

interface CourseVideo {
  id: string
  video_id: string
  order_index: number
  video: Video
}

export default function CourseVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [course, setCourse] = useState<any>(null)
  const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([])
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [resolvedParams.id])

  const loadData = async () => {
    setLoading(true)
    
    // コース情報を取得
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()
    
    setCourse(courseData)
    
    // コースに含まれる動画を取得
    const { data: courseVideosData } = await supabase
      .from('course_videos')
      .select(`
        *,
        video:videos (*)
      `)
      .eq('course_id', resolvedParams.id)
      .order('order_index')
    
    setCourseVideos(courseVideosData || [])
    
    // 全動画を取得（追加用）
    const { data: videosData } = await supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    setAllVideos(videosData || [])
    setLoading(false)
  }

  const addVideo = async () => {
    if (!selectedVideoId) return
    
    setSaving(true)
    const maxOrder = Math.max(...courseVideos.map(cv => cv.order_index), -1)
    
    const { error } = await supabase
      .from('course_videos')
      .insert({
        course_id: resolvedParams.id,
        video_id: selectedVideoId,
        order_index: maxOrder + 1
      })
    
    if (!error) {
      await loadData()
      setSelectedVideoId('')
    }
    setSaving(false)
  }

  const removeVideo = async (courseVideoId: string) => {
    if (!confirm('この動画をコースから削除しますか？')) return
    
    const { error } = await supabase
      .from('course_videos')
      .delete()
      .eq('id', courseVideoId)
    
    if (!error) {
      await loadData()
    }
  }

  const updateOrder = async (courseVideoId: string, newIndex: number) => {
    const { error } = await supabase
      .from('course_videos')
      .update({ order_index: newIndex })
      .eq('id', courseVideoId)
    
    if (!error) {
      await loadData()
    }
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const item = courseVideos[index]
    const prevItem = courseVideos[index - 1]
    
    updateOrder(item.id, prevItem.order_index)
    updateOrder(prevItem.id, item.order_index)
  }

  const moveDown = (index: number) => {
    if (index === courseVideos.length - 1) return
    const item = courseVideos[index]
    const nextItem = courseVideos[index + 1]
    
    updateOrder(item.id, nextItem.order_index)
    updateOrder(nextItem.id, item.order_index)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>読み込み中...</p>
    </div>
  }

  // 既にコースに含まれている動画IDのセット
  const usedVideoIds = new Set(courseVideos.map(cv => cv.video_id))
  const availableVideos = allVideos.filter(v => !usedVideoIds.has(v.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={`${course?.title} - 動画管理`}
          description="コースに含まれる動画を管理します"
          breadcrumb={[
            { label: 'コース管理', href: '/admin/courses' },
            { label: course?.title || '' }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 動画追加セクション */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>動画を追加</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      追加する動画を選択
                    </label>
                    <select
                      value={selectedVideoId}
                      onChange={(e) => setSelectedVideoId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      {availableVideos.map((video) => (
                        <option key={video.id} value={video.id}>
                          {video.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    icon={Plus}
                    fullWidth
                    onClick={addVideo}
                    disabled={!selectedVideoId}
                    loading={saving}
                  >
                    動画を追加
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* コース動画リスト */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>コース内の動画 ({courseVideos.length}本)</CardTitle>
              </CardHeader>
              <CardContent>
                {courseVideos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    まだ動画が追加されていません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {courseVideos.map((courseVideo, index) => (
                      <div
                        key={courseVideo.id}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === courseVideos.length - 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <h4 className="font-medium text-gray-900">
                              {courseVideo.video.title}
                            </h4>
                          </div>
                          {courseVideo.video.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {courseVideo.video.description}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => removeVideo(courseVideo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}