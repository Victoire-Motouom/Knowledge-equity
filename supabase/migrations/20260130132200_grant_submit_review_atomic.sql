-- Migration: Grant execute on submit_review_atomic RPC
-- Date: 2026-01-30

-- NOTE: This migration intentionally contains a single SQL command. Keep it that way.
GRANT EXECUTE ON FUNCTION public.submit_review_atomic(
  bigint,
  uuid,
  text,
  integer,
  text,
  integer,
  integer,
  integer
) TO authenticated;
