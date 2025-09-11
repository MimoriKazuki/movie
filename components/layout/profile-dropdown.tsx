'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Settings, LogOut, ChevronDown, Rocket } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { DiagnosisModal } from '@/components/diagnosis/diagnosis-modal'

interface ProfileDropdownProps {
  profile: Profile | null
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitial = () => {
    if (profile?.name) return profile.name[0].toUpperCase()
    if (profile?.email) return profile.email[0].toUpperCase()
    return 'U'
  }

  // ログインしていない場合の表示
  if (!profile) {
    return (
      <>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDiagnosisOpen(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            無料診断
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg transition-all"
          >
            ログイン
          </Link>
        </div>
        <DiagnosisModal 
          isOpen={isDiagnosisOpen}
          onClose={() => setIsDiagnosisOpen(false)}
        />
      </>
    )
  }

  // ログインしている場合の表示
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url || ''} alt={profile?.name || ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <span className="text-sm font-semibold text-gray-700">{getInitial()}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden z-50">
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200/60">
            <p className="text-sm font-semibold text-gray-900">
              {profile?.name || 'ユーザー'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email}
            </p>
          </div>

          <div className="py-1">
            <a
              href="/mypage"
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
            >
              <User className="w-4 h-4 mr-3" />
              マイページ
            </a>

            {profile?.role === 'admin' && (
              <a
                href="/admin"
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors duration-200"
              >
                <Settings className="w-4 h-4 mr-3" />
                管理設定
              </a>
            )}

          </div>
          
          <div className="border-t border-gray-200/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
