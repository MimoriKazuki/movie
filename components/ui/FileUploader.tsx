'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Download } from 'lucide-react'
import Papa from 'papaparse'

interface FileUploaderProps {
  onFileUpload: (files: Array<{ name: string; content: string; type: string }>) => void
  acceptedFormats?: string[]
  maxFiles?: number
  currentFiles?: Array<{ name: string; url?: string }>
  onRemoveFile?: (fileName: string) => void
}

export function FileUploader({ 
  onFileUpload, 
  acceptedFormats = ['.csv', '.pdf', '.txt', '.json'],
  maxFiles = 5,
  currentFiles = [],
  onRemoveFile
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setError(null)
    
    try {
      const processedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          const content = await readFileContent(file)
          return {
            name: file.name,
            content,
            type: file.type || 'text/plain'
          }
        })
      )
      
      onFileUpload(processedFiles)
    } catch (err) {
      setError('ファイルの読み込みに失敗しました')
      console.error('File upload error:', err)
    } finally {
      setUploading(false)
    }
  }, [onFileUpload])

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      if (file.name.endsWith('.csv')) {
        reader.onload = (e) => {
          const text = e.target?.result as string
          Papa.parse(text, {
            complete: (results) => {
              resolve(JSON.stringify(results.data, null, 2))
            },
            error: reject
          })
        }
        reader.readAsText(file)
      } else {
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.onerror = reject
        reader.readAsText(file)
      }
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => {
      if (format === '.csv') acc['text/csv'] = ['.csv']
      if (format === '.pdf') acc['application/pdf'] = ['.pdf']
      if (format === '.txt') acc['text/plain'] = ['.txt']
      if (format === '.json') acc['application/json'] = ['.json']
      return acc
    }, {} as Record<string, string[]>),
    maxFiles,
    disabled: uploading
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {isDragActive ? (
          <p className="text-blue-500">ファイルをドロップしてください</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              ファイルをドラッグ&ドロップ、またはクリックして選択
            </p>
            <p className="text-sm text-gray-500">
              対応形式: {acceptedFormats.join(', ')} (最大{maxFiles}ファイル)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">アップロード済みファイル:</h4>
          {currentFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {file.url && (
                  <a
                    href={file.url}
                    download={file.name}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="ダウンロード"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </a>
                )}
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.name)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="削除"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}