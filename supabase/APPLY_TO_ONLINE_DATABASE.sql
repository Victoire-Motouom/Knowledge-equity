-- ==============================================================================
-- Complete Schema for Online Supabase Database
-- Apply this in Supabase Dashboard → SQL Editor → Run
-- ==============================================================================

-- STEP 1: Create initial tables
-- ---------------------------------------------------------------------------

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Contributions table (with ALL fields including new ones)
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
  effort INTEGER,
  effort_unit TEXT CHECK (effort_unit IN ('minutes', 'hours', NULL)),
  external_link TEXT,
  views INTEGER DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table (with new schema)
CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  contribution_id bigint REFERENCES contributions(id) ON DELETE CASCADE,
  reviewer uuid REFERENCES users(id) ON DELETE SET NULL,
  rating TEXT CHECK (rating IN (
    'confirmed_correct', 
    'novel_insight', 
    'valuable_incomplete', 
    'incorrect_constructive', 
    'not_credible'
  )),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  ke_awarded INTEGER DEFAULT 0,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- User KE tracking table (NEW)
CREATE TABLE IF NOT EXISTS user_ke (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  ke_amount INTEGER DEFAULT 0,
  contributions_count INTEGER DEFAULT 0,
  reviews_given_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, domain)
);

-- STEP 2: Create performance indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_contributions_domain ON contributions(domain);
CREATE INDEX IF NOT EXISTS idx_contributions_author ON contributions(author);
CREATE INDEX IF NOT EXISTS idx_contributions_created_desc ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_ke_gained ON contributions(ke_gained DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_contribution ON reviews(contribution_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer);
CREATE INDEX IF NOT EXISTS idx_user_ke_domain_amount ON user_ke(domain, ke_amount DESC);
CREATE INDEX IF NOT EXISTS idx_user_ke_user ON user_ke(user_id);

-- STEP 3: Create helper functions
-- ---------------------------------------------------------------------------

-- Trigger to auto-update updated_at timestamp
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

-- STEP 4: Insert sample domains
-- ---------------------------------------------------------------------------

INSERT INTO domains (name, description)
  VALUES ('Distributed Systems', 'Systems that scale horizontally')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
  VALUES ('React', 'Frontend library')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
  VALUES ('Architecture', 'Software architecture and design patterns')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
  VALUES ('Backend', 'Backend development and APIs')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
  VALUES ('Security', 'Security and cryptography')
  ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- Schema applied successfully!
-- You can now use the API endpoints.
-- ==============================================================================
