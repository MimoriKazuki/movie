'use client'

import { useState } from 'react'
import { VideoAnalytics } from '@/components/admin/video-analytics'
import { UserActivity } from '@/components/admin/user-activity'
import { EnhancedVideoAnalytics } from '@/components/admin/enhanced-video-analytics'
import { BarChart3, Users, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'users' | 'enhanced'>('videos')

  const tabs = [
    { id: 'videos' as const, name: '動画分析', icon: BarChart3 },
    { id: 'enhanced' as const, name: '高度な分析', icon: TrendingUp },
    { id: 'users' as const, name: 'ユーザー分析', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'videos' && <VideoAnalytics />}
        {activeTab === 'enhanced' && <EnhancedVideoAnalytics />}
        {activeTab === 'users' && <UserActivity />}
      </div>
    </div>
  )
}