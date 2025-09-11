'use client'

import Link from 'next/link'
import { Database } from '@/types/database'
import { BookOpen } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { PriceRow } from '@/components/ui/PriceRow'

type Course = Database['public']['Tables']['courses']['Row']

interface SimpleCourseCardProps {
  course: Course
  studentCount?: number
  videoCount?: number
}

export function SimpleCourseCard({ course, studentCount = 0, videoCount = 0 }: SimpleCourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full">
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {course.thumbnail_url ? (
            <SmartImage
              src={course.thumbnail_url}
              alt={course.title}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <div className="bg-white/90 p-4 rounded-full">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          )}
          
          {/* Hover overlay with icon */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="p-4 bg-white/95 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-gray-900" />
            </div>
          </div>
          
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          {/* Title - exactly 2 lines */}
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 min-h-[2.75rem] mb-3 hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          
          {/* Metadata - fixed position */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-start text-sm text-gray-500 gap-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{videoCount} レッスン</span>
              </div>
            </div>
            
            {/* Level badge - fixed height */}
            <div className="h-6">
              {course.level ? (
                <div className="flex flex-wrap gap-1">
                  <span className={`
                    px-2 py-0.5 text-xs rounded
                    ${course.level === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                    ${course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' : ''}
                    ${course.level === 'advanced' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {course.level === 'beginner' && '初級'}
                    {course.level === 'intermediate' && '中級'}
                    {course.level === 'advanced' && '上級'}
                  </span>
                </div>
              ) : (
                <div className="h-6" /> // Placeholder for alignment
              )}
            </div>
          </div>
        </div>
        
        {/* Price row - bottom of card */}
        <PriceRow price={course.price} freeLabel="無料で受講可能" leftLabel="受講料" />
      </div>
    </Link>
  )
}
