-- Migration: Add missing fields to contributions table and fix reviews schema
-- Date: 2026-01-29

-- Ensure base tables exist (remote projects can drift; keep this migration safe/idempotent)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contributions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  excerpt text,
  content text,
  domain text,
  type text,
  author uuid REFERENCES users(id) ON DELETE SET NULL,
  reviews_count integer DEFAULT 0,
  ke_gained integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reviews if missing, then alter to expected schema
CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  contribution_id bigint REFERENCES contributions(id) ON DELETE CASCADE,
  reviewer uuid REFERENCES users(id) ON DELETE SET NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to contributions table
ALTER TABLE contributions
  ADD COLUMN IF NOT EXISTS effort INTEGER,
  ADD COLUMN IF NOT EXISTS effort_unit TEXT CHECK (effort_unit IN ('minutes', 'hours', NULL)),
  ADD COLUMN IF NOT EXISTS external_link TEXT,
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update reviews table to match expected schema
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS rating TEXT CHECK (rating IN (
    'confirmed_correct',
    'novel_insight',
    'valuable_incomplete',
    'incorrect_constructive',
    'not_credible'
  )),
  ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  ADD COLUMN IF NOT EXISTS ke_awarded INTEGER DEFAULT 0;

-- Drop old score column if it exists (replaced by rating + confidence)
ALTER TABLE reviews DROP COLUMN IF EXISTS score;

-- Create user_ke table for domain-specific KE tracking
CREATE TABLE IF NOT EXISTS user_ke (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  ke_amount INTEGER DEFAULT 0,
  contributions_count INTEGER DEFAULT 0,
  reviews_given_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, domain)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contributions_domain ON contributions(domain);
CREATE INDEX IF NOT EXISTS idx_contributions_author ON contributions(author);
CREATE INDEX IF NOT EXISTS idx_contributions_created_desc ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_ke_gained ON contributions(ke_gained DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_contribution ON reviews(contribution_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer);
CREATE INDEX IF NOT EXISTS idx_user_ke_domain_amount ON user_ke(domain, ke_amount DESC);
CREATE INDEX IF NOT EXISTS idx_user_ke_user ON user_ke(user_id);

-- Add trigger to update updated_at timestamp on contributions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contributions_updated_at ON contributions;
CREATE TRIGGER update_contributions_updated_at
    BEFORE UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful functions
-- Function to calculate total KE for a user across all domains
CREATE OR REPLACE FUNCTION get_user_total_ke(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(ke_amount), 0)::INTEGER
  FROM user_ke
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get user's KE in a specific domain
CREATE OR REPLACE FUNCTION get_user_domain_ke(user_uuid UUID, domain_name TEXT)
RETURNS INTEGER AS $$
  SELECT COALESCE(ke_amount, 0)
  FROM user_ke
  WHERE user_id = user_uuid AND domain = domain_name;
$$ LANGUAGE SQL STABLE;
