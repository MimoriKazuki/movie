'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileSettings({ profile }: { profile: Profile | null }) {
  const [name, setName] = useState(profile?.name || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>((profile as any)?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  if (!profile) {
    return (
      <div className="max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">プロフィール情報を読み込んでいます...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', profile.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  const compressImage = (file: File, maxWidth = 512, maxHeight = 512, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = () => {
        img.onload = () => {
          let { width, height } = img
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas not supported'))
          ctx.drawImage(img, 0, 0, width, height)

          // Prefer JPEG to reduce size; keep PNG if original was PNG
          const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            resolve(blob)
          }, outType, quality)
        }
        img.onerror = () => reject(new Error('Invalid image'))
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    setUploadError(null)
    try {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('対応していない画像形式です（jpg, png, webp, gif）')
      }

      let dataToUpload: Blob | File = file
      // Skip compression for GIF to keep animation
      const shouldCompress = file.size > MAX_FILE_SIZE && file.type !== 'image/gif'
      if (shouldCompress) {
        dataToUpload = await compressImage(file)
        if (dataToUpload.size > MAX_FILE_SIZE) {
          throw new Error('画像サイズが大きすぎます（最大3MB）。もう少し小さい画像をお使いください。')
        }
      }

      const ext = file.name.split('.').pop()
      // If compressed to JPEG/PNG, adjust extension accordingly
      const outExt = dataToUpload.type === 'image/png' ? 'png' : dataToUpload.type === 'image/jpeg' ? 'jpg' : ext
      const fileName = `${profile.id}/${Date.now()}.${outExt}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, dataToUpload, { upsert: true, contentType: (dataToUpload as any).type || file.type })
      if (error) throw error
      const { data: publicUrlData } = await supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)
      const publicUrl = publicUrlData.publicUrl
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
      if (updateError) throw updateError
      setAvatarUrl(publicUrl)
      router.refresh()
    } catch (err) {
      console.error('Avatar upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'アバターのアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!profile) return
    setUploading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)
      if (error) throw error
      setAvatarUrl(null)
      router.refresh()
    } catch (err) {
      console.error('Avatar remove error:', err)
      alert('アバターの削除に失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const inputClassName = "mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  const disabledInputClassName = "mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"

  return (
    <div className="max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">アバター</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-gray-600">
                  {profile.name?.[0] || profile.email?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border cursor-pointer text-sm">
                画像を選択
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              {avatarUrl && (
                <button type="button" onClick={handleAvatarRemove} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border text-sm">
                  削除
                </button>
              )}
            </div>
        </div>
          {uploading && <p className="text-xs text-gray-500 mt-1">アップロード中...</p>}
          {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={profile.email || ''}
            disabled
            className={disabledInputClassName}
            style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
          />
          <p className="mt-1 text-xs text-gray-500">メールアドレスは変更できません</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前を入力してください"
            className={inputClassName}
            style={{ backgroundColor: 'white', color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ロール
          </label>
          <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {profile.role === 'admin' ? '🛡️ 管理者' : '👤 ユーザー'}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                更新中...
              </span>
            ) : (
              'プロフィールを更新'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
