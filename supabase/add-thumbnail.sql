-- Add thumbnail_url column to videos table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'videos' 
                AND column_name = 'thumbnail_url') THEN
    ALTER TABLE videos ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

-- Create storage bucket for video thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public can view thumbnails" ON storage.objects;

-- Create policy to allow authenticated users to upload thumbnails
CREATE POLICY "Admins can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'video-thumbnails' AND
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create policy to allow public read access to thumbnails
CREATE POLICY "Public can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'video-thumbnails');