# Educational Video Platform

教育動画配信プラットフォーム

## プロジェクト構造

```
movie/
├── edu-video-platform/    # Next.jsアプリケーション
├── vercel.json           # Vercelデプロイ設定
└── README.md             # このファイル
```

## デプロイ

このプロジェクトはVercelにデプロイするように設定されています。

### Vercelでのセットアップ

1. Vercelダッシュボードで新しいプロジェクトを作成
2. GitHubリポジトリを接続
3. ルートディレクトリはそのまま（変更不要）
4. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_VIMEO_ACCESS_TOKEN`（オプション）

Vercelは`vercel.json`の設定に従って、`edu-video-platform`ディレクトリ内のNext.jsアプリケーションを自動的にビルド・デプロイします。

## ローカル開発

```bash
cd edu-video-platform
npm install
npm run dev
```

## 機能

- ユーザー認証とプロファイル管理
- 動画のアップロードと管理
- 視聴者分析ダッシュボード
- 詳細な視聴者分析ページ
- 進捗追跡
- 検索機能
- 管理者パネル
- CSVエクスポート機能