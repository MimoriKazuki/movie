'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface VideoHeroProps {
  video: {
    title: string
    description?: string | null
    genre?: string | null
    view_count: number
    created_at: string
  }
}

export default function VideoHeroSimple({ video }: VideoHeroProps) {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation */}
        <Link 
          href="/videos" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          動画一覧に戻る
        </Link>

        <div className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {video.title}
          </h1>
          
          {video.description && (
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            {video.genre && (
              <span>ジャンル: {video.genre}</span>
            )}
            {/* 視聴回数は非表示に */}
            <span>
              公開日: {new Date(video.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
