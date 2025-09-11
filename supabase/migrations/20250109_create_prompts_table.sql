-- プロンプト商品テーブル
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'image', 'video', 'music', 'text', 'code'
  ai_tool TEXT NOT NULL, -- 'ChatGPT', 'Claude', 'Midjourney', 'Stable Diffusion', 'DALL-E', 'Suno', 'Runway'
  price INTEGER NOT NULL DEFAULT 0, -- 価格（円）
  prompt_text TEXT NOT NULL, -- 実際のプロンプト
  example_output TEXT, -- 成果物の例（画像URL、動画URL、テキストなど）
  example_images TEXT[], -- 複数の例画像URL
  tags TEXT[], -- タグ
  usage_count INTEGER DEFAULT 0, -- 使用回数
  rating DECIMAL(3,2) DEFAULT 0, -- 評価（0-5）
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, -- おすすめ
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロンプト購入履歴テーブル
CREATE TABLE prompt_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, buyer_id) -- 同じプロンプトは一度だけ購入可能
);

-- プロンプトレビューテーブル
CREATE TABLE prompt_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, reviewer_id) -- 一人一レビューまで
);

-- プロンプトお気に入りテーブル
CREATE TABLE prompt_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

-- インデックスの作成
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_ai_tool ON prompts(ai_tool);
CREATE INDEX idx_prompts_seller_id ON prompts(seller_id);
CREATE INDEX idx_prompts_is_published ON prompts(is_published);
CREATE INDEX idx_prompts_is_featured ON prompts(is_featured);
CREATE INDEX idx_prompt_purchases_buyer_id ON prompt_purchases(buyer_id);
CREATE INDEX idx_prompt_reviews_prompt_id ON prompt_reviews(prompt_id);
CREATE INDEX idx_prompt_favorites_user_id ON prompt_favorites(user_id);

-- RLSポリシー
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_favorites ENABLE ROW LEVEL SECURITY;

-- プロンプトのポリシー
-- 公開されているプロンプトは誰でも見れる
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
  FOR SELECT USING (is_published = true);

-- 自分が作成したプロンプトは見れる
CREATE POLICY "Users can view own prompts" ON prompts
  FOR SELECT USING (auth.uid() = seller_id);

-- 管理者は全て見れる
CREATE POLICY "Admins can view all prompts" ON prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- プロンプト作成は認証ユーザーのみ
CREATE POLICY "Authenticated users can create prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- 自分のプロンプトは更新可能
CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (auth.uid() = seller_id);

-- 管理者は全て更新可能
CREATE POLICY "Admins can update all prompts" ON prompts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 自分のプロンプトは削除可能
CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE USING (auth.uid() = seller_id);

-- 購入履歴のポリシー
-- 自分の購入履歴は見れる
CREATE POLICY "Users can view own purchases" ON prompt_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

-- 販売者は自分のプロンプトの購入履歴を見れる
CREATE POLICY "Sellers can view prompt purchases" ON prompt_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_purchases.prompt_id
      AND prompts.seller_id = auth.uid()
    )
  );

-- 購入は認証ユーザーのみ
CREATE POLICY "Authenticated users can purchase" ON prompt_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- レビューのポリシー
-- 公開プロンプトのレビューは誰でも見れる
CREATE POLICY "Public reviews are viewable" ON prompt_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_reviews.prompt_id
      AND prompts.is_published = true
    )
  );

-- 購入者のみレビュー可能
CREATE POLICY "Purchasers can review" ON prompt_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompt_purchases
      WHERE prompt_purchases.prompt_id = prompt_reviews.prompt_id
      AND prompt_purchases.buyer_id = auth.uid()
    )
  );

-- 自分のレビューは更新可能
CREATE POLICY "Users can update own reviews" ON prompt_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- お気に入りのポリシー
-- 自分のお気に入りは見れる
CREATE POLICY "Users can view own favorites" ON prompt_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 認証ユーザーはお気に入り追加可能
CREATE POLICY "Authenticated users can favorite" ON prompt_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のお気に入りは削除可能
CREATE POLICY "Users can remove own favorites" ON prompt_favorites
  FOR DELETE USING (auth.uid() = user_id);