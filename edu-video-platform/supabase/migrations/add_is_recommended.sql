-- Add is_recommended field to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_videos_is_recommended ON videos(is_recommended) WHERE is_recommended = true;
CREATE INDEX IF NOT EXISTS idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);