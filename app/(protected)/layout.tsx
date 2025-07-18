import Navigation from '@/components/layout/navigation-server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 一時的に認証を無効化
  // try {
  //   const supabase = await createClient()
  //   const { data: { user }, error } = await supabase.auth.getUser()

  //   if (error || !user) {
  //     redirect('/login')
  //   }
  // } catch (error) {
  //   // 認証エラーの場合はログインページへリダイレクト
  //   redirect('/login')
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}