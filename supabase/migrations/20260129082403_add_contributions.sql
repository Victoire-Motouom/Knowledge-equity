-- Ensure users and domains exist first (idempotent)
CREATE TABLE IF NOT EXISTS users (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	handle text NOT NULL UNIQUE,
	email text,
	created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS domains (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL UNIQUE,
	description text,
	created_at timestamptz DEFAULT now()
);

-- Create contributions table that references users
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

INSERT INTO domains (name, description)
	VALUES ('Distributed Systems', 'Systems that scale horizontally')
	ON CONFLICT (name) DO NOTHING;

INSERT INTO domains (name, description)
	VALUES ('React', 'Frontend library')
	ON CONFLICT (name) DO NOTHING;

