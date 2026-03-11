-- Migration: Convert to two-step application flow
-- Run this in the Supabase SQL Editor if you already have the applications table

-- 1. Add status tracking columns
ALTER TABLE applications ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'initial';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 2. Make follow-up fields nullable (they'll be filled later via email form)
ALTER TABLE applications ALTER COLUMN experience DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN availability DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN interest_spark DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN learning_approach DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN conflict_resolution DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN work_style DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN resume_url DROP NOT NULL;

-- 3. Mark all existing complete applications
UPDATE applications SET status = 'completed', completed_at = created_at
WHERE experience IS NOT NULL AND resume_url IS NOT NULL;

-- 4. Allow anonymous updates (for completing application via email link)
CREATE POLICY "Allow anonymous updates by id"
  ON applications FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 5. Allow anonymous select (for loading application on completion page)
CREATE POLICY "Allow anonymous select by id"
  ON applications FOR SELECT
  TO anon
  USING (true);
