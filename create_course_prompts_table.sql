-- このSQLをSupabaseのSQL Editorで実行してください

-- コースとプロンプトの関連テーブル
CREATE TABLE IF NOT EXISTS course_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- 同じコースに同じプロンプトを重複して追加しない
  UNIQUE(course_id, prompt_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_course_prompts_course_id ON course_prompts(course_id);
CREATE INDEX IF NOT EXISTS idx_course_prompts_prompt_id ON course_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_course_prompts_order ON course_prompts(course_id, order_index);

-- RLSを有効化
ALTER TABLE course_prompts ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Admins can manage course prompts" ON course_prompts;
DROP POLICY IF EXISTS "Users can view purchased course prompts" ON course_prompts;
DROP POLICY IF EXISTS "Anyone can view public course prompts" ON course_prompts;

-- 管理者は全ての操作が可能
CREATE POLICY "Admins can manage course prompts" ON course_prompts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ユーザーは購入したコースのプロンプト関連を見ることができる
CREATE POLICY "Users can view purchased course prompts" ON course_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_purchases
      WHERE course_purchases.course_id = course_prompts.course_id
      AND course_purchases.user_id = auth.uid()
      AND course_purchases.status = 'active'
    )
  );

-- 公開コースのプロンプト関連は誰でも見ることができる
CREATE POLICY "Anyone can view public course prompts" ON course_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_prompts.course_id
      AND courses.is_published = true
    )
  );

-- テーブルが作成されたか確認
SELECT 
  'course_prompts table created successfully' as message,
  COUNT(*) as record_count 
FROM course_prompts;