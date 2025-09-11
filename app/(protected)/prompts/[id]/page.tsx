import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PromptHeroSimple from '@/components/prompt/prompt-hero-simple'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get prompt details
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_published', true)
    .single()

  if (!prompt) {
    notFound()
  }

  // Check if user has purchased this prompt
  let hasPurchased = false
  if (user) {
    const { data: purchase } = await supabase
      .from('prompt_purchases')
      .select('*')
      .eq('prompt_id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()
    
    hasPurchased = !!purchase
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id={`ld-product-prompt-${prompt.id}`} type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: prompt.title,
          description: prompt.description || '',
          image: Array.isArray(prompt.example_images) && prompt.example_images.length ? prompt.example_images[0] : undefined,
          brand: {
            '@type': 'Brand',
            name: '誰でもエンジニア'
          },
          offers: {
            '@type': 'Offer',
            price: prompt.price || 0,
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock'
          }
        })}
      </Script>
      {/* Prompt Hero Section */}
      <PromptHeroSimple prompt={prompt} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">プロンプト内容</h2>
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {prompt.prompt_text}
                    </pre>
                  </div>
                  {prompt.attachments && prompt.attachments.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">添付ファイル</h3>
                      <div className="space-y-2">
                        {prompt.attachments.map((file: any, index: number) => (
                          <a
                            key={index}
                            href={file.url}
                            download={file.name}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">このプロンプトを表示するには購入が必要です</p>
                </div>
              )}
            </div>

            {prompt.example_output && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">出力例</h2>
                <p className="text-gray-700">{prompt.example_output}</p>
              </div>
            )}

            {prompt.example_images && prompt.example_images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">生成例</h2>
                <div className="grid grid-cols-2 gap-4">
                  {prompt.example_images.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Example ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ¥{prompt.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">買い切り価格</p>
              </div>

              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">購入済み</p>
                  </div>
                  <Button fullWidth variant="secondary" icon={Download}>
                    プロンプトをコピー
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <Button fullWidth variant="gradient" icon={ShoppingCart} glow>
                      購入する
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button fullWidth variant="primary">
                        ログインして購入
                      </Button>
                    </Link>
                  )}
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-600"><path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6A2.25 2.25 0 003.75 11.25v8.25A2.25 2.25 0 006 21.75h12a2.25 2.25 0 002.25-2.25v-8.25A2.25 2.25 0 0018 9H16.5V6A4.5 4.5 0 0012 1.5zm-3 7.5V6a3 3 0 116 0v3H9z" clipRule="evenodd" /></svg>
                    安全な決済 — Stripeにより保護されています
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>即座にダウンロード可能</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>永久アクセス権</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>商用利用可能</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
