-- Add price field to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Update is_free based on price
UPDATE videos SET is_free = (price = 0 OR price IS NULL);

-- Create video_purchases table for individual video purchases
CREATE TABLE IF NOT EXISTS video_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(video_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_purchases_user_id ON video_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_video_purchases_video_id ON video_purchases(video_id);
CREATE INDEX IF NOT EXISTS idx_video_purchases_status ON video_purchases(status);
CREATE INDEX IF NOT EXISTS idx_videos_price ON videos(price);
CREATE INDEX IF NOT EXISTS idx_videos_is_free ON videos(is_free);

-- Enable RLS
ALTER TABLE video_purchases ENABLE ROW LEVEL SECURITY;

-- Video purchases policies
CREATE POLICY "Users can view their own video purchases" ON video_purchases
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all video purchases" ON video_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create their own video purchases" ON video_purchases
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all video purchases" ON video_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to check if user has access to video (purchased, free, or admin)
CREATE OR REPLACE FUNCTION user_has_video_access(p_video_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if video is free
  IF EXISTS (
    SELECT 1 FROM videos 
    WHERE id = p_video_id AND (is_free = true OR price = 0 OR price IS NULL)
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user purchased the video
  IF EXISTS (
    SELECT 1 FROM video_purchases 
    WHERE video_id = p_video_id 
    AND user_id = p_user_id 
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user purchased a course containing this video
  IF EXISTS (
    SELECT 1 FROM course_purchases cp
    JOIN course_videos cv ON cp.course_id = cv.course_id
    WHERE cv.video_id = p_video_id 
    AND cp.user_id = p_user_id 
    AND cp.status = 'active'
    AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON COLUMN videos.price IS 'Price in JPY (0 or NULL means free)';
COMMENT ON COLUMN videos.is_free IS 'Whether the video is free to watch';
COMMENT ON TABLE video_purchases IS 'Tracks individual video purchases by users';