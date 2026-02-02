-- Supabase example RLS policies for contributions
-- Run these after creating the tables if you want basic auth-protected inserts

-- Enable RLS on contributions
ALTER TABLE IF EXISTS contributions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own contributions
CREATE POLICY "Allow insert for authenticated users" ON contributions
  FOR INSERT USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Allow everyone to select (public feed). If you want only authenticated users, adjust accordingly.
CREATE POLICY "Allow select for everyone" ON contributions
  FOR SELECT USING (true);

-- Example: allow owners to update their own contributions (if you store owner id)
-- ALTER TABLE contributions ADD COLUMN IF NOT EXISTS owner uuid;
-- CREATE POLICY "Owners can update" ON contributions
--   FOR UPDATE USING (owner = auth.uid());
