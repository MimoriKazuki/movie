-- Add avatar_url column to profiles if missing
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Optional: set a default avatar for existing rows (leave NULL by default)
-- UPDATE profiles SET avatar_url = NULL WHERE avatar_url IS NULL;

