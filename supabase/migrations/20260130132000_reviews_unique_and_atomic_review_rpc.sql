-- Migration: Ensure unique reviews (one review per contribution per reviewer)
-- Date: 2026-01-30

-- NOTE: This migration intentionally contains a single SQL command. Keep it that way.
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
