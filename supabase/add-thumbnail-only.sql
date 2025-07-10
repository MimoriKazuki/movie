-- サムネイル機能のみを追加するSQL

-- 1. videos テーブルに thumbnail_url カラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'videos' 
    AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE public.videos ADD COLUMN thumbnail_url TEXT;
  END IF;
END $$;

-- 2. ストレージバケットの作成（存在しない場合のみ）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. 既存のストレージポリシーを削除
DROP POLICY IF EXISTS "Admins can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update thumbnails" ON storage.objects;

-- 4. 新しいストレージポリシーを作成
-- 管理者がサムネイルをアップロードできるポリシー
CREATE POLICY "Admins can upload thumbnails" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'video-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 管理者がサムネイルを更新できるポリシー
CREATE POLICY "Admins can update thumbnails" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'video-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 管理者がサムネイルを削除できるポリシー
CREATE POLICY "Admins can delete thumbnails" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'video-thumbnails' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 誰でもサムネイルを閲覧できるポリシー
CREATE POLICY "Public can view thumbnails" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'video-thumbnails');