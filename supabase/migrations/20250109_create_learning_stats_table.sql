-- 学習セッションテーブル
CREATE TABLE learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学習統計サマリーテーブル
CREATE TABLE learning_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_watch_time_seconds INTEGER DEFAULT 0,
  total_videos_watched INTEGER DEFAULT 0,
  total_courses_completed INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  max_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  weekly_goal_minutes INTEGER DEFAULT 300, -- 週の目標学習時間（分）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日別学習記録テーブル
CREATE TABLE daily_learning_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  courses_progressed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- カテゴリー別学習時間テーブル
CREATE TABLE category_learning_time (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- インデックスの作成
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_video_id ON learning_sessions(video_id);
CREATE INDEX idx_learning_sessions_course_id ON learning_sessions(course_id);
CREATE INDEX idx_daily_learning_records_user_date ON daily_learning_records(user_id, date);
CREATE INDEX idx_category_learning_time_user ON category_learning_time(user_id);

-- RLSポリシーの設定
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_learning_time ENABLE ROW LEVEL SECURITY;

-- 学習セッションのポリシー
CREATE POLICY "Users can view own learning sessions" ON learning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learning sessions" ON learning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning sessions" ON learning_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 学習統計のポリシー
CREATE POLICY "Users can view own learning stats" ON learning_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning stats" ON learning_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning stats" ON learning_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 日別記録のポリシー
CREATE POLICY "Users can view own daily records" ON daily_learning_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily records" ON daily_learning_records
  FOR ALL USING (auth.uid() = user_id);

-- カテゴリー別学習時間のポリシー
CREATE POLICY "Users can view own category time" ON category_learning_time
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own category time" ON category_learning_time
  FOR ALL USING (auth.uid() = user_id);

-- 学習統計を自動更新する関数
CREATE OR REPLACE FUNCTION update_learning_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 学習統計を更新
  INSERT INTO learning_stats (user_id, total_watch_time_seconds, total_videos_watched, last_activity_date)
  VALUES (NEW.user_id, NEW.duration_seconds, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_watch_time_seconds = learning_stats.total_watch_time_seconds + NEW.duration_seconds,
    total_videos_watched = learning_stats.total_videos_watched + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();

  -- 日別記録を更新
  INSERT INTO daily_learning_records (user_id, date, total_minutes, videos_watched)
  VALUES (NEW.user_id, CURRENT_DATE, NEW.duration_seconds / 60, 1)
  ON CONFLICT (user_id, date) DO UPDATE
  SET 
    total_minutes = daily_learning_records.total_minutes + (NEW.duration_seconds / 60),
    videos_watched = daily_learning_records.videos_watched + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
CREATE TRIGGER update_stats_on_session_end
  AFTER UPDATE OF ended_at ON learning_sessions
  FOR EACH ROW
  WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL)
  EXECUTE FUNCTION update_learning_stats();