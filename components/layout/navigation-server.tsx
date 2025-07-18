import { createClient } from '@/lib/supabase/server'
import NavigationClient from './navigation-client'

export default function Navigation() {
  // 認証を無効化 - ダミーのプロファイルを使用
  const profile = {
    id: 'dummy-user',
    email: 'user@example.com',
    username: 'テストユーザー',
    role: 'user'
  }

  return <NavigationClient profile={profile} />
}