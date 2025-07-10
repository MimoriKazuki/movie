import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FavoriteVideos } from '@/components/mypage/favorite-videos'
import { WatchHistory } from '@/components/mypage/watch-history'
import { ProfileSettings } from '@/components/mypage/profile-settings'

export default async function MyPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">マイページ</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {profile?.name?.[0] || profile?.email?.[0] || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.name || 'ユーザー'}</h2>
            <p className="text-gray-600">{profile?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              登録日: {new Date(profile?.created_at || '').toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">お気に入り</TabsTrigger>
          <TabsTrigger value="history">視聴履歴</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>
        <TabsContent value="favorites">
          <FavoriteVideos userId={user.id} />
        </TabsContent>
        <TabsContent value="history">
          <WatchHistory userId={user.id} />
        </TabsContent>
        <TabsContent value="settings">
          <ProfileSettings profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}