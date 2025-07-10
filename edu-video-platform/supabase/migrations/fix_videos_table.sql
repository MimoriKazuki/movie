-- まず、genresテーブルが存在するか確認し、なければ作成
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- videosテーブルに必要なカラムを追加（存在しない場合のみ）
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS genre_id UUID REFERENCES genres(id);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_videos_is_recommended ON videos(is_recommended) WHERE is_recommended = true;
CREATE INDEX IF NOT EXISTS idx_videos_genre_id ON videos(genre_id);

-- RLS ポリシーを設定
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除して再作成
DROP POLICY IF EXISTS "Anyone can view active genres" ON genres;
DROP POLICY IF EXISTS "Only admins can manage genres" ON genres;

CREATE POLICY "Anyone can view active genres" ON genres
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage genres" ON genres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 初期ジャンルデータを挿入（重複を避ける）
INSERT INTO genres (name, slug, description, display_order) VALUES
  ('プログラミング', 'programming', 'プログラミング言語、開発ツール、フレームワークなど', 1),
  ('データサイエンス', 'data-science', '機械学習、データ分析、統計学など', 2),
  ('デザイン', 'design', 'UI/UX、グラフィックデザイン、Webデザインなど', 3),
  ('ビジネス', 'business', 'マーケティング、経営、プロジェクト管理など', 4),
  ('語学', 'language', '英語、日本語、その他言語学習', 5),
  ('数学', 'mathematics', '基礎数学、応用数学、統計学など', 6),
  ('科学', 'science', '物理、化学、生物学など', 7),
  ('音楽', 'music', '楽器演奏、音楽理論、作曲など', 8),
  ('アート', 'art', '絵画、彫刻、デジタルアートなど', 9),
  ('その他', 'others', 'その他のカテゴリー', 10)
ON CONFLICT (slug) DO NOTHING;