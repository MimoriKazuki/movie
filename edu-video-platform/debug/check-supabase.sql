-- 1. テーブルが存在するか確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'videos', 'view_history', 'favorites', 'comments');

-- 2. view_historyテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'view_history'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. RLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'view_history';

-- 4. 現在のユーザーのプロファイルを確認（auth.uid()を実際のUUIDに置き換えてください）
-- SELECT * FROM profiles WHERE id = 'your-user-uuid';

-- 5. 視聴履歴のデータを確認
SELECT 
    vh.*, 
    p.email as user_email,
    v.title as video_title
FROM view_history vh
LEFT JOIN profiles p ON vh.user_id = p.id
LEFT JOIN videos v ON vh.video_id = v.id
ORDER BY vh.last_viewed_at DESC
LIMIT 10;