#!/bin/bash

echo "educationリポジトリにプッシュします..."

cd /tmp/edu-video-platform-clean

# リモートを更新
git remote remove origin 2>/dev/null
git remote add origin https://github.com/MimoriKazuki/education.git

# ブランチ名をmainに変更
git branch -m master main 2>/dev/null

# プッシュ
git push -u origin main

echo "✅ プッシュ完了！"
echo ""
echo "🎉 次のステップ："
echo "1. Vercelにログイン (https://vercel.com)"
echo "2. 新しいプロジェクトを作成"
echo "3. MimoriKazuki/education を選択"
echo "4. 環境変数を設定:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"