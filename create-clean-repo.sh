#!/bin/bash

echo "クリーンなリポジトリを作成します..."

# 一時ディレクトリを作成
TEMP_DIR="/tmp/edu-video-platform-clean"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 現在のファイルをコピー（.gitと.claudeを除く）
rsync -av --exclude='.git' --exclude='.claude' --exclude='node_modules' --exclude='.next' ./ $TEMP_DIR/

# 新しいGitリポジトリを初期化
cd $TEMP_DIR
git init
git config user.name "MimoriKazuki"
git config user.email "kazumasa071210@gmail.com"

# すべてのファイルを追加してコミット
git add .
git commit -m "Initial commit: Educational Video Platform

Features:
- User authentication and profile management
- Video upload and management system
- Viewer analytics dashboard
- Progress tracking and search functionality
- Admin panel with comprehensive controls

Created by MimoriKazuki"

# リモートを追加
git remote add origin https://github.com/MimoriKazuki/edu-video-platform.git

echo "準備完了！以下のコマンドを実行してプッシュしてください："
echo "cd $TEMP_DIR"
echo "git push -u origin main"