-- Migration: Remove deprecated bio field from users table
-- Date: 2026-01-30

-- Bio has been removed from the app UI and API surface.
-- Keep this migration idempotent to support multiple environments.

ALTER TABLE public.users
  DROP COLUMN IF EXISTS bio;
