-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create applications table
CREATE TABLE applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  state text NOT NULL,
  role text NOT NULL,
  is_student boolean NOT NULL DEFAULT false,
  school_name text,
  school_email text,
  status text NOT NULL DEFAULT 'initial',
  completed_at timestamptz,
  -- Fields collected via follow-up email form
  experience text,
  availability text,
  interest_spark text,
  learning_approach text,
  conflict_resolution text,
  work_style text,
  additional_info text,
  resume_url text
);

-- 2. Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous inserts (the anon key can submit applications)
CREATE POLICY "Allow anonymous inserts"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (true);

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

-- 6. Only authenticated/service role can read all (you view via dashboard)
CREATE POLICY "Allow authenticated reads"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

-- 7. Create storage bucket for resumes (run separately if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Allow anonymous uploads to resumes bucket
CREATE POLICY "Allow anonymous resume uploads"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resumes');

-- 9. Allow public reads from resumes bucket
CREATE POLICY "Allow public resume reads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'resumes');
