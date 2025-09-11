-- profilesテーブルのRLSポリシーを修正
-- ユーザーが自分のプロファイルを作成できるようにする

-- 既存のINSERTポリシーがある場合は削除
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 新しいINSERTポリシーを作成
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 確認用: 現在のポリシーを表示
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';