'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Video, User, Settings, BarChart3 } from 'lucide-react'
import { SearchBox } from '@/components/layout/search-box'
import { ProfileDropdown } from '@/components/layout/profile-dropdown'
import { Profile } from '@/types/database'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navigation: NavigationItem[] = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Home },
  { name: '動画一覧', href: '/videos', icon: Video },
  { name: 'マイページ', href: '/mypage', icon: User },
  { name: '管理', href: '/admin', icon: Settings, adminOnly: true },
  { name: '分析', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
]

interface NavigationClientProps {
  profile: Profile | null
}

export default function NavigationClient({ profile }: NavigationClientProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  )

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 hover:text-gray-700">
                教育動画プラットフォーム
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SearchBox />
            <ProfileDropdown profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  )
}