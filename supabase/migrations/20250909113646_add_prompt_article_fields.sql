-- Add article_content field for rich text articles
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS article_content TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Create storage bucket for prompt attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-attachments', 'prompt-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for prompt attachments
CREATE POLICY "Anyone can view prompt attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'prompt-attachments');

CREATE POLICY "Authenticated users can upload prompt attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prompt-attachments' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own prompt attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'prompt-attachments' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own prompt attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prompt-attachments' 
    AND auth.uid() IS NOT NULL
  );

-- Add comments
COMMENT ON COLUMN prompts.article_content IS 'Rich text content for article-style prompts (HTML format)';
COMMENT ON COLUMN prompts.attachments IS 'JSON array of attached files with name, url, and type';
