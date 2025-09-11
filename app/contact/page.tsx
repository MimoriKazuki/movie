export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">お問い合わせ</h1>
        <p className="text-gray-700 mb-6">ご質問・ご要望・不具合報告など、こちらからご連絡ください。</p>
        <form className="space-y-4 bg-white rounded-xl p-6 border border-gray-200">
          <div>
            <label className="block text-sm text-gray-700 mb-1">お名前</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="山田 太郎" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
            <input type="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">内容</label>
            <textarea rows={6} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="できるだけ詳細にご記入ください" />
          </div>
          <button type="button" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">送信する（ダミー）</button>
          <p className="text-xs text-gray-500">実運用ではこのフォームをメール/Supabase Functions 経由で送信するよう接続します。</p>
        </form>
      </div>
    </div>
  )
}

