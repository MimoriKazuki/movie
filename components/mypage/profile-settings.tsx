'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileSettings({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', profile.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClassName = "mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  const disabledInputClassName = "mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"

  return (
    <div className="max-w-lg bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={profile.email || ''}
            disabled
            className={disabledInputClassName}
            style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
          />
          <p className="mt-1 text-xs text-gray-500">メールアドレスは変更できません</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前を入力してください"
            className={inputClassName}
            style={{ backgroundColor: 'white', color: '#111827' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ロール
          </label>
          <div className="mt-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {profile.role === 'admin' ? '🛡️ 管理者' : '👤 ユーザー'}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                更新中...
              </span>
            ) : (
              'プロフィールを更新'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}