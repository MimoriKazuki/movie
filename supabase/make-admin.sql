-- 特定のユーザーを管理者にする
-- メールアドレスを変更して実行してください

UPDATE profiles 
SET role = 'admin'
WHERE email = 'sales@landbridge.co.jp';

-- 確認用: 管理者権限を持つユーザーを表示
SELECT id, email, name, role 
FROM profiles 
WHERE role = 'admin';