-- Add metadata column to courses table to store prompt IDs temporarily
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the metadata field
COMMENT ON COLUMN courses.metadata IS 'JSON metadata for storing additional course information including selected prompt IDs';