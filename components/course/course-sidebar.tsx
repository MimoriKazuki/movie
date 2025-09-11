'use client'

import { Trophy, Flame, Clock, BookOpen } from 'lucide-react'
import { Database } from '@/types/database'

type Course = Database['public']['Tables']['courses']['Row']

interface CourseSidebarProps {
  course: Course
  totalVideos: number
  completedVideos: number
}

export default function CourseSidebar({ course, totalVideos, completedVideos }: CourseSidebarProps) {
  const completionRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
  
  return (
    <div className="space-y-6">
      {/* Course Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          コース進捗
        </h3>
        
        {/* Progress Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionRate / 100)}`}
                className="text-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                style={{
                  stroke: 'url(#gradient)',
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
                <p className="text-xs text-gray-500">完了</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">レッスン数</span>
            </div>
            <span className="font-bold text-gray-900">{completedVideos}/{totalVideos}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">学習時間</span>
            </div>
            <span className="font-bold text-gray-900">3.5時間</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">連続学習</span>
            </div>
            <span className="font-bold text-gray-900">5日間</span>
          </div>
        </div>
      </div>


      {/* Course Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">コース情報</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">難易度</span>
            <span className="font-medium text-gray-900">
              {course.level === 'beginner' && '初級'}
              {course.level === 'intermediate' && '中級'}
              {course.level === 'advanced' && '上級'}
              {!course.level && '全レベル'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">カテゴリ</span>
            <span className="font-medium text-gray-900">{course.category || 'その他'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">更新日</span>
            <span className="font-medium text-gray-900">
              {new Date(course.updated_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}