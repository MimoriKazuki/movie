import Navigation from '@/components/layout/navigation-server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 認証を無効化
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  )
}