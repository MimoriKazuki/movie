#!/bin/bash

echo "UIデザインの更新を適用します..."

# ファイルをコピー
cp app/login/page.tsx /tmp/edu-video-platform-clean/app/login/
cp app/register/page.tsx /tmp/edu-video-platform-clean/app/register/

cd /tmp/edu-video-platform-clean

# 変更をコミット
git add .
git commit -m "Modernize login and register UI design

- Redesigned login page with clean, modern white-based design
- Updated register page to match the new design system
- Removed old-style forms and replaced with minimal, elegant layout
- Added smooth transitions and hover effects
- Improved form field styling with better focus states
- Added loading spinners for better UX

Design features:
- Clean white background
- Subtle shadows and borders
- Modern typography
- No emoji icons, purely text-based
- Professional and inviting appearance"

# プッシュ
git push origin main

echo "✅ UIデザインの更新をプッシュしました！"