'use client'

import { useState, useMemo } from 'react'
import { SimpleCourseCard } from './simple-course-card'
import { ContentGrid } from '@/components/ui/ContentGrid'
import { UnifiedSearch } from '@/components/search/unified-search'

interface CourseListWithSearchProps {
  courses: any[]
  courseStats: Record<string, { videoCount: number; studentCount: number }>
}

export function CourseListWithSearch({ courses, courseStats }: CourseListWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // コースからカテゴリーを抽出してフォーマット
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    courses.forEach(course => {
      if (course.category) {
        categorySet.add(course.category)
      }
    })
    return Array.from(categorySet).sort().map(cat => ({
      value: cat,
      label: cat
    }))
  }, [courses])

  // コースをフィルタリング
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // カテゴリーフィルター
      if (selectedCategory && course.category !== selectedCategory) {
        return false
      }

      // キーワード検索
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const titleMatch = course.title?.toLowerCase().includes(query)
        const descriptionMatch = course.description?.toLowerCase().includes(query)
        const categoryMatch = course.category?.toLowerCase().includes(query)
        const tagsMatch = course.tags?.some((tag: string) => 
          tag.toLowerCase().includes(query)
        )
        
        return titleMatch || descriptionMatch || categoryMatch || tagsMatch
      }

      return true
    })
  }, [courses, searchQuery, selectedCategory])

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query)
    setSelectedCategory(category)
  }

  return (
    <div>
      <UnifiedSearch 
        onSearch={handleSearch}
        placeholder="コースを検索..."
        categories={categories}
      />

      {filteredCourses.length > 0 ? (
        <ContentGrid>
          {filteredCourses.map((course) => (
            <SimpleCourseCard
              key={course.id}
              course={course}
              videoCount={courseStats[course.id]?.videoCount}
              studentCount={courseStats[course.id]?.studentCount}
            />
          ))}
        </ContentGrid>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchQuery || selectedCategory 
              ? '検索条件に一致するコースが見つかりませんでした'
              : 'コースがまだありません'}
          </p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => handleSearch('', '')}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              すべてのコースを表示
            </button>
          )}
        </div>
      )}
    </div>
  )
}
