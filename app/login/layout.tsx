import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!error && user) {
      redirect('/dashboard')
    }
  } catch (error) {
    // 認証エラーの場合は何もしない（ログインページを表示）
  }

  return <>{children}</>
}