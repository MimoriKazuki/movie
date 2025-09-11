'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Video, User, Settings, BarChart3, BookOpen, Sparkles } from 'lucide-react'
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
  { name: 'コース', href: '/courses', icon: BookOpen },
  { name: '動画', href: '/videos', icon: Video },
  { name: 'プロンプト', href: '/prompts', icon: Sparkles },
  { name: '管理', href: '/admin', icon: Settings, adminOnly: true },
  { name: '分析', href: '/admin/analytics', icon: BarChart3, adminOnly: true },
]

interface NavigationClientProps {
  profile: Profile | null
}

export default function NavigationClient({ profile }: NavigationClientProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const isLoggedIn = !!profile

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  )

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center mr-8">
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                誰でもエンジニア
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/admin/analytics' 
                  ? pathname.startsWith('/admin/analytics')
                  : item.href === '/admin'
                  ? pathname === '/admin' || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/analytics'))
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <SearchBox />
            </div>
            <ProfileDropdown profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  )
}
