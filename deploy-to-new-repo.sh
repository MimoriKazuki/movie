#!/bin/bash

# 新しいリポジトリにプッシュするスクリプト
echo "新しいリポジトリにコードをプッシュします..."

# 既存のリモートを削除
git remote remove new-origin 2>/dev/null

# 新しいリモートを追加
git remote add new-origin https://github.com/MimoriKazuki/edu-video-platform.git

# プッシュ
git push -u new-origin main

echo "プッシュが完了しました！"
echo "次はVercelで新しいプロジェクトを作成してください。"