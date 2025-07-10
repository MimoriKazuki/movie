import { createClient } from '@/lib/supabase/server'
import NavigationClient from './navigation-client'

export default async function Navigation() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return <NavigationClient profile={profile} />
}