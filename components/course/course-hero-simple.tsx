'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']
type Progress = Database['public']['Tables']['course_progress']['Row']

interface CourseHeroProps {
  course: Course
  progress: Progress | null
}

export default function CourseHeroSimple({ course, progress }: CourseHeroProps) {
  const progressPercentage = progress?.completed_videos && progress?.total_videos 
    ? Math.round((progress.completed_videos / progress.total_videos) * 100)
    : 0

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation */}
        <Link 
          href="/courses" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          コース一覧に戻る
        </Link>

        <div className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {course.title}
          </h1>
          
          {course.description && (
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Progress Bar */}
          {progress && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">学習進捗</span>
                <span className="text-lg font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-white/60 mt-2">
                {progress.completed_videos}/{progress.total_videos} レッスン完了
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}