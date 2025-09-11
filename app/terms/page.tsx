export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">利用規約</h1>
        <p className="text-gray-700 mb-4">
          本利用規約は、当サービスの利用条件を定めるものです。ユーザーは、本規約に同意の上でサービスを利用するものとします。
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
          <li>アカウント：登録情報は正確に管理し、第三者への譲渡は禁止します</li>
          <li>コンテンツ利用：著作権その他の権利を尊重し、許可なく再配布しないでください</li>
          <li>禁止事項：不正アクセス、妨害行為、法令に反する行為等</li>
          <li>免責：当サービスは、合理的な範囲で機能提供に努めますが、絶対的な保証はいたしません</li>
          <li>規約変更：必要に応じて変更する場合があり、改定後に掲示します</li>
        </ol>
        <p className="text-sm text-gray-500 mt-6">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>
      </div>
    </div>
  )
}

