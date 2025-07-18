-- comment_likes テーブル作成
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- RLS有効化
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
CREATE POLICY "Users can view comment likes" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- commentsテーブルにlikes_countカラムを追加
ALTER TABLE comments ADD COLUMN likes_count INTEGER DEFAULT 0;

-- いいね数を更新する関数
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
CREATE TRIGGER update_comment_likes_count_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();