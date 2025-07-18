#!/bin/bash

cd /tmp/edu-video-platform-clean
git branch -m master main
git push -u origin main

echo "✅ プッシュ完了！"
echo "次のステップ："
echo "1. Vercelにログイン"
echo "2. 新しいプロジェクトを作成"
echo "3. MimoriKazuki/edu-video-platformを選択"
echo "4. 環境変数を設定"