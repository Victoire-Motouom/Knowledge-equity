-- Migration: Enable Row Level Security (RLS) + core policies
-- Date: 2026-01-29
--
-- Notes:
-- - These policies assume writes are performed as the authenticated user (JWT present),
--   i.e. auth.uid() is set.
-- - Public read access is allowed for feed-style pages.
-- - user_ke is treated as server-maintained (no client writes).

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_ke ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Helpful constraints
-- -----------------------------------------------------------------------------
-- Prevent duplicate reviews by the same reviewer on the same contribution.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reviews_unique_contribution_reviewer'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_unique_contribution_reviewer
      UNIQUE (contribution_id, reviewer);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- USERS policies
-- -----------------------------------------------------------------------------
-- Publicly readable (for handles / attribution)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_public'
  ) THEN
    CREATE POLICY users_select_public
      ON public.users
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Users can insert their own row (id must equal auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_own'
  ) THEN
    CREATE POLICY users_insert_own
      ON public.users
      FOR INSERT
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Users can update their own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_own'
  ) THEN
    CREATE POLICY users_update_own
      ON public.users
      FOR UPDATE
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- DOMAINS policies
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'domains' AND policyname = 'domains_select_public'
  ) THEN
    CREATE POLICY domains_select_public
      ON public.domains
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- CONTRIBUTIONS policies
-- -----------------------------------------------------------------------------
-- Public feed: allow selects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contributions' AND policyname = 'contributions_select_public'
  ) THEN
    CREATE POLICY contributions_select_public
      ON public.contributions
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Authenticated users can insert contributions for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contributions' AND policyname = 'contributions_insert_own'
  ) THEN
    CREATE POLICY contributions_insert_own
      ON public.contributions
      FOR INSERT
      WITH CHECK (author = auth.uid());
  END IF;
END $$;

-- Owners can update their own contributions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contributions' AND policyname = 'contributions_update_own'
  ) THEN
    CREATE POLICY contributions_update_own
      ON public.contributions
      FOR UPDATE
      USING (author = auth.uid())
      WITH CHECK (author = auth.uid());
  END IF;
END $$;

-- Owners can delete their own contributions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contributions' AND policyname = 'contributions_delete_own'
  ) THEN
    CREATE POLICY contributions_delete_own
      ON public.contributions
      FOR DELETE
      USING (author = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- REVIEWS policies
-- -----------------------------------------------------------------------------
-- Public read of reviews (for contribution detail pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_select_public'
  ) THEN
    CREATE POLICY reviews_select_public
      ON public.reviews
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Authenticated users can insert their own reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_insert_own'
  ) THEN
    CREATE POLICY reviews_insert_own
      ON public.reviews
      FOR INSERT
      WITH CHECK (reviewer = auth.uid());
  END IF;
END $$;

-- Reviewers can update their own review
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_update_own'
  ) THEN
    CREATE POLICY reviews_update_own
      ON public.reviews
      FOR UPDATE
      USING (reviewer = auth.uid())
      WITH CHECK (reviewer = auth.uid());
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- USER_KE policies
-- -----------------------------------------------------------------------------
-- Public read (leaderboard + profile)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_ke' AND policyname = 'user_ke_select_public'
  ) THEN
    CREATE POLICY user_ke_select_public
      ON public.user_ke
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Intentionally no INSERT/UPDATE/DELETE policies for user_ke.
-- It should be maintained by trusted server-side logic.
