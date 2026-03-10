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
  experience text NOT NULL,
  availability text NOT NULL,
  is_student boolean NOT NULL DEFAULT false,
  school_name text,
  school_email text,
  interest_spark text NOT NULL,
  learning_approach text NOT NULL,
  conflict_resolution text NOT NULL,
  work_style text NOT NULL,
  additional_info text,
  resume_url text NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous inserts (the anon key can submit applications)
CREATE POLICY "Allow anonymous inserts"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Only authenticated/service role can read (you view via dashboard)
CREATE POLICY "Allow authenticated reads"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

-- 5. Create storage bucket for resumes (run separately if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Allow anonymous uploads to resumes bucket
CREATE POLICY "Allow anonymous resume uploads"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resumes');

-- 7. Allow public reads from resumes bucket
CREATE POLICY "Allow public resume reads"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'resumes');
