-- Migration: Add profile fields to users table
-- Date: 2026-01-29

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS github text;

-- Optional: keep bios reasonably small
-- (No strict limit here to avoid breaking existing data.)
