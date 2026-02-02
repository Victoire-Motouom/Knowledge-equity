-- Migration: Persist user expertise domains
-- Date: 2026-01-29

CREATE TABLE IF NOT EXISTS public.user_expertise (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_user_expertise_user ON public.user_expertise(user_id);
CREATE INDEX IF NOT EXISTS idx_user_expertise_domain ON public.user_expertise(domain);

-- Enable RLS
ALTER TABLE IF EXISTS public.user_expertise ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_expertise' AND policyname = 'user_expertise_select_public'
  ) THEN
    CREATE POLICY user_expertise_select_public
      ON public.user_expertise
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_expertise' AND policyname = 'user_expertise_insert_own'
  ) THEN
    CREATE POLICY user_expertise_insert_own
      ON public.user_expertise
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_expertise' AND policyname = 'user_expertise_delete_own'
  ) THEN
    CREATE POLICY user_expertise_delete_own
      ON public.user_expertise
      FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;
