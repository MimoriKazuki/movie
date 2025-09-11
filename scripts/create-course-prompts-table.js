const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ebueejtwejtfejicecvn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidWVlanR3ZWp0ZmVqaWNlY3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjExMjUxOSwiZXhwIjoyMDY3Njg4NTE5fQ.4Ogkhm0fpxkKyMF83wYJOEucwFAjGUFvoLEtNdL0kuU';

const supabase = createClient(supabaseUrl, supabaseKey);

const createTableSQL = `
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
`;

async function createTable() {
  try {
    console.log('Creating course_prompts table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      query: createTableSQL
    });

    if (error) {
      console.error('Error creating table:', error);
      
      // exec_sql が存在しない場合は、手動で実行する必要があることを通知
      console.log('\n======================================');
      console.log('⚠️  自動作成に失敗しました。');
      console.log('以下の手順で手動で作成してください:');
      console.log('======================================\n');
      console.log('1. Supabaseダッシュボードにログイン');
      console.log('   URL: https://supabase.com/dashboard/project/ebueejtwejtfejicecvn');
      console.log('\n2. SQL Editorに移動');
      console.log('\n3. 以下のSQLを実行:');
      console.log('--------------------------------------');
      console.log(createTableSQL);
      console.log('--------------------------------------');
    } else {
      console.log('✅ course_prompts table created successfully!');
      
      // テーブルが作成されたか確認
      const { data: testData, error: testError } = await supabase
        .from('course_prompts')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('⚠️  テーブルは作成されましたが、アクセスできません:', testError);
      } else {
        console.log('✅ テーブルへのアクセスも確認できました!');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTable();