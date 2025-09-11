-- Supabase Storageバケットの作成
-- 注意: これらのコマンドはSupabaseのダッシュボードから実行する必要があります

-- thumbnailsバケットの作成（公開アクセス可能）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- example-imagesバケットの作成（公開アクセス可能）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'example-images',
  'example-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- ストレージポリシーの設定
-- thumbnailsバケットのポリシー
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- example-imagesバケットのポリシー
CREATE POLICY "Anyone can view example images" ON storage.objects
  FOR SELECT USING (bucket_id = 'example-images');

CREATE POLICY "Authenticated users can upload example images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'example-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own example images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'example-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own example images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'example-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );