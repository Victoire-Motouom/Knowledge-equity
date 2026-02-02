-- Supabase schema for Knowledge Equity minimal demo

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- domains
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- contributions
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

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id bigserial PRIMARY KEY,
  contribution_id bigint REFERENCES contributions(id) ON DELETE CASCADE,
  reviewer uuid REFERENCES users(id) ON DELETE SET NULL,
  score integer,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- sample domains
INSERT INTO domains (name, description)
  VALUES ('Distributed Systems', 'Systems that scale horizontally')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
  VALUES ('React', 'Frontend library')
  ON CONFLICT (name) DO NOTHING;
