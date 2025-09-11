import { createClient } from '@/lib/supabase/server'
import { PromptMarketplace } from '@/components/prompts/prompt-marketplace'
import { PageHeader } from '@/components/ui/PageHeader'
import { Sparkles } from 'lucide-react'

export default async function PromptsPage() {
  const supabase = await createClient()
  
  // 公開されているプロンプトを取得
  const { data: prompts } = await supabase
    .from('prompts')
    .select(`
      id, title, description, category, ai_tool, price, example_images, tags, is_featured, created_at,
      seller:profiles(name, avatar_url)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // 現在のユーザーの購入済みプロンプトを取得
  const { data: { user } } = await supabase.auth.getUser()
  let purchasedPromptIds: string[] = []
  
  if (user) {
    const { data: purchases } = await supabase
      .from('prompt_purchases')
      .select('prompt_id')
      .eq('buyer_id', user.id)
    
    purchasedPromptIds = purchases?.map(p => p.prompt_id) || []

    // 管理画面でのみ登録可能にするため、一覧では登録ボタンは表示しない
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <PageHeader
            title="プロンプト一覧"
            description="高品質なAIプロンプトを購入して、創造性を加速させよう"
            icon={Sparkles}
            variant="simple"
          />
        </div>

        <PromptMarketplace 
          prompts={prompts || []} 
          purchasedPromptIds={purchasedPromptIds}
        />
      </div>
    </div>
  )
}
