-- Restrict prompts INSERT to admins only

-- Drop previous policy that allowed any authenticated user to create prompts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'prompts' 
      AND policyname = 'Authenticated users can create prompts'
  ) THEN
    DROP POLICY "Authenticated users can create prompts" ON prompts;
  END IF;
END $$;

-- Create new policy: only admins can insert prompts (guard when table exists)
DO $$
BEGIN
  IF to_regclass('public.prompts') IS NOT NULL THEN
    CREATE POLICY "Admins can create prompts" ON prompts
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
        AND seller_id = auth.uid()
      );
  END IF;
END $$;
