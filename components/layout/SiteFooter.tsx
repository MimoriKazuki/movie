'use client'

import Link from 'next/link'
import { ShieldCheck, Lock, Mail, Twitter, Youtube, Github } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">誰でもエンジニア</h4>
            <p className="text-sm text-gray-600 leading-6">
              学び続けるすべての人へ。動画・コース・プロンプトでスキルをブースト。
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>信頼性の高い運用基盤（Supabase / Stripe）</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">プラットフォーム</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/courses" className="hover:text-gray-900">コース</Link></li>
              <li><Link href="/videos" className="hover:text-gray-900">動画</Link></li>
              <li><Link href="/prompts" className="hover:text-gray-900">プロンプト</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">サポート</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/contact" className="hover:text-gray-900">お問い合わせ</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">プライバシーポリシー</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900">利用規約</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">セキュア決済</h4>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-700" />
              Stripeにより保護された安全なチェックアウト
            </p>
            <div className="mt-4 flex items-center gap-3 text-gray-500">
              <a href="https://twitter.com" target="_blank" className="hover:text-gray-800" aria-label="Twitter" rel="noreferrer">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" className="hover:text-gray-800" aria-label="YouTube" rel="noreferrer">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://github.com" target="_blank" className="hover:text-gray-800" aria-label="GitHub" rel="noreferrer">
                <Github className="w-5 h-5" />
              </a>
              <a href="/contact" className="hover:text-gray-800" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/60 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} 誰でもエンジニア. All rights reserved.</span>
          <span className="text-[11px]">This site uses cookies to enhance your experience.</span>
        </div>
      </div>
    </footer>
  )
}

