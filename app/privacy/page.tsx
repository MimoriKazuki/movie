export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>
        <p className="text-gray-700 mb-4">
          当サービスは、利用者の個人情報を適切に取り扱い、安全に保護することを重要な責務と考えています。本ポリシーでは、取得する情報、利用目的、第三者提供、セキュリティ、問い合わせ先等を定めます。
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>取得情報：アカウント情報（メールアドレス、氏名等）、利用履歴、決済情報（Stripeを通じて安全に処理）</li>
          <li>利用目的：サービス提供、品質改善、サポート、法令遵守</li>
          <li>第三者提供：法令に基づく場合を除き、本人の同意なく第三者提供しません</li>
          <li>安全管理措置：アクセス制御、通信の暗号化、ログ監査等</li>
          <li>個人情報の開示・訂正・削除：お問い合わせより請求可能です</li>
        </ul>
        <p className="text-sm text-gray-500 mt-6">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>
      </div>
    </div>
  )
}

