'use client'

import { useState, useCallback, ChangeEvent } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket?: 'thumbnails' | 'example-images'
  className?: string
  maxSize?: number // バイト単位
  accept?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'thumbnails',
  className,
  maxSize = 5 * 1024 * 1024, // デフォルト5MB
  accept = 'image/jpeg,image/jpg,image/png,image/webp'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const supabase = createClient()

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // ファイルサイズチェック
    if (file.size > maxSize) {
      setUploadError(`ファイルサイズは${Math.round(maxSize / 1024 / 1024)}MB以下にしてください`)
      return
    }

    // ファイルタイプチェック
    const acceptedTypes = accept.split(',').map(t => t.trim())
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('対応していないファイル形式です')
      return
    }

    try {
      setIsUploading(true)

      // ローカルでプレビューを生成（アップロードは一旦スキップ）
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setPreview(dataUrl)
        onChange(dataUrl)
      }
      reader.readAsDataURL(file)

      // 以下、Supabase Storageへのアップロードは一旦コメントアウト
      // バケットの設定後に有効化できます
      
      /*
      // ユーザーIDを取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // ファイル名を生成（ユーザーID/タイムスタンプ_ファイル名）
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${timestamp}.${fileExt}`

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onChange(publicUrl)
      */
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }, [bucket, maxSize, accept, onChange, supabase])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange('')
    setUploadError(null)
  }, [onChange])

  const handleUrlInput = useCallback((url: string) => {
    if (url) {
      setPreview(url)
      onChange(url)
      setUploadError(null)
    }
  }, [onChange])

  return (
    <div className={cn('space-y-4', className)}>
      {/* プレビュー表示 */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            onError={() => {
              setUploadError('画像の読み込みに失敗しました')
              setPreview(null)
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id={`image-upload-${bucket}`}
          />
          <label
            htmlFor={`image-upload-${bucket}`}
            className={cn(
              'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
              isUploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-500">アップロード中...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  クリックして画像を選択
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WEBP (最大{Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* URL入力フィールド */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          または画像URLを入力
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={preview || ''}
            onChange={(e) => handleUrlInput(e.target.value)}
            disabled={isUploading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}
    </div>
  )
}