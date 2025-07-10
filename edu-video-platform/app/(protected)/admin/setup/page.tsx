import { SetupDatabase } from '@/components/admin/setup-database'

export default function SetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">管理者セットアップ</h1>
      <SetupDatabase />
    </div>
  )
}