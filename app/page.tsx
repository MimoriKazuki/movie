import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Zap, TrendingUp, Clock, Users, Play, ChevronRight, Sparkles,
  RefreshCw, MessageSquare, Star, ArrowRight, CheckCircle,
  Rocket, Globe, Shield, Award, Calendar, Lightbulb
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // 統計データを取得
  const { count: videoCount } = await supabase
    .from('videos')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
  
  const { count: courseCount } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)

  // 最新の動画を取得（速報性を強調）
  const { data: latestVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-black">
                <span className="text-blue-600">誰でも</span>
                <span className="text-gray-900">エンジニア</span>
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="#concept" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  コンセプト
                </Link>
                <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  特徴
                </Link>
                <Link href="#latest" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  最新動画
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                今すぐ始める
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション - 速報性と鮮度を強調 */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* 速報性を示すバッジ */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full text-sm font-medium text-red-700 mb-6 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              今日も新着動画が続々追加中
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              AIの「今」を、
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                今すぐキャッチ
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
              ChatGPT、Claude、GitHub Copilot...
              <br />
              <span className="text-blue-600">最新のAI情報を即座に動画で</span>
            </p>

            <div className="flex items-center justify-center gap-8 mb-12 text-sm">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">毎日更新</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-700">最速配信</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">日本語対応</span>
              </div>
            </div>

            {/* CTA ボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition-all"
              >
                <Rocket className="w-5 h-5" />
                無料で始める
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/videos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 text-lg hover:border-gray-400 hover:shadow-lg transition-all"
              >
                <Play className="w-5 h-5" />
                最新動画を見る
              </Link>
            </div>

            {/* 信頼シグナル */}
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 mb-4">
              <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur rounded-lg border border-gray-200 p-3">
                <Shield className="w-4 h-4 text-gray-700" />
                <span>Stripeにより保護された決済</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur rounded-lg border border-gray-200 p-3">
                <Award className="w-4 h-4 text-gray-700" />
                <span>高評価の学習体験</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur rounded-lg border border-gray-200 p-3">
                <Rocket className="w-4 h-4 text-gray-700" />
                <span>最新AIを最速キャッチ</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur rounded-lg border border-gray-200 p-3">
                <Lightbulb className="w-4 h-4 text-gray-700" />
                <span><Link href="/privacy" className="hover:text-gray-900 underline">ポリシー整備</Link></span>
              </div>
            </div>

            {/* リアルタイム統計 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{videoCount || '100+'}本</div>
                  <div className="text-xs text-gray-600">今週の新着動画</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24時間</div>
                  <div className="text-xs text-gray-600">以内に配信</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">5分</div>
                  <div className="text-xs text-gray-600">平均動画時間</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10,000+</div>
                  <div className="text-xs text-gray-600">アクティブ学習者</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* コンセプトセクション */}
      <section id="concept" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              なぜ「誰でもエンジニア」なのか
            </h2>
            <p className="text-lg text-gray-600">
              AIの進化スピードに、学習が追いつかない問題を解決
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">鮮度が命</h3>
              <p className="text-gray-600 text-sm">
                昨日のAIニュースが今日には古い。だから最新情報を即座に動画化
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">5分で理解</h3>
              <p className="text-gray-600 text-sm">
                編集より速報性。要点だけをコンパクトにまとめた動画で効率学習
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">実践者の生の声</h3>
              <p className="text-gray-600 text-sm">
                現場のエンジニアが実際に使った感想をそのまま配信
              </p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                XやNoteのように、気軽に投稿・視聴
              </h3>
              <p className="text-white/90">
                高品質な編集は不要。大切なのは情報の鮮度と実用性。
                現場のエンジニアが「今日試したAIツール」を即座にシェア
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新動画セクション - タイムライン風 */}
      {latestVideos && latestVideos.length > 0 && (
        <section id="latest" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-red-600">LIVE UPDATE</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  今日の最新動画
                </h2>
              </div>
              <Link
                href="/videos"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                すべて見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* タイムライン風の動画リスト */}
            <div className="space-y-6">
              {latestVideos.map((video, index) => {
                const uploadTime = new Date(video.created_at)
                const hoursAgo = Math.floor((Date.now() - uploadTime.getTime()) / (1000 * 60 * 60))
                
                return (
                  <Link
                    key={video.id}
                    href={`/video/${video.id}`}
                    className="flex gap-6 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all group"
                  >
                    {/* タイムスタンプ */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {hoursAgo < 1 ? 'NOW' : hoursAgo < 24 ? `${hoursAgo}h` : `${Math.floor(hoursAgo / 24)}d`}
                      </div>
                      <div className="text-xs text-gray-500">前</div>
                    </div>

                    {/* サムネイル */}
                    <div className="w-48 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {video.genre && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
                              {video.genre}
                            </span>
                          )}
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                        {video.is_free || video.price === 0 ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                            無料
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                            ¥{video.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        {index === 0 && (
                          <span className="text-red-600 font-medium animate-pulse">
                            🔥 トレンド
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 特徴セクション */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              従来の学習プラットフォームとは違う
            </h2>
            <p className="text-lg text-gray-600">
              速報性 × 実践性 × コミュニティ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Calendar className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">今日のAIニュースが今日見れる</h3>
              <p className="text-gray-600 text-sm mb-4">
                OpenAIの新機能リリース、GoogleのAI発表...その日のうちに解説動画が公開
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                平均公開時間：24時間以内
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <MessageSquare className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">コメントで即座に質問</h3>
              <p className="text-gray-600 text-sm mb-4">
                動画投稿者に直接質問。リアルタイムで疑問を解決
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                平均返信時間：2時間以内
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Lightbulb className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">実際に使ってみた系動画が豊富</h3>
              <p className="text-gray-600 text-sm mb-4">
                理論より実践。実際のコード、実際の画面、実際のエラーと解決法
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                実践動画率：80%以上
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">信頼できる投稿者のみ</h3>
              <p className="text-gray-600 text-sm mb-4">
                現役エンジニア、AI研究者、認定クリエイターのみが投稿可能
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                投稿者審査制
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 収益モデル */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              投稿者も視聴者もWin-Win
            </h2>
            <p className="text-lg text-gray-600">
              知識をシェアして収益化。最新情報を得て成長
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 投稿者向け */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                🎥 投稿者のメリット
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">収益還元率70%</p>
                    <p className="text-sm text-gray-600">業界最高水準の還元率</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">編集不要でOK</p>
                    <p className="text-sm text-gray-600">画面録画とマイクだけで投稿可能</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">フォロワー機能</p>
                    <p className="text-sm text-gray-600">ファンを増やして安定収入</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 視聴者向け */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                👀 視聴者のメリット
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">月額980円で見放題</p>
                    <p className="text-sm text-gray-600">すべての最新動画にアクセス</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">単発購入も可能</p>
                    <p className="text-sm text-gray-600">必要な動画だけ100円〜購入</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">企業プランあり</p>
                    <p className="text-sm text-gray-600">チーム全体のスキルアップ</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            AIの波に乗り遅れるな
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            今日から始めて、明日には最新のAIを使いこなそう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 hover:shadow-2xl transition-all"
            >
              <Rocket className="w-5 h-5" />
              無料で始める
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-medium text-lg hover:bg-gray-700 transition-all"
            >
              投稿者として参加
            </Link>
          </div>
        </div>
      </section>

      {/* グローバルフッターは layout.tsx の SiteFooter を使用 */}
    </div>
  )
}
