-- Security/speed/quality foundation

-- -----------------------------------------------------------------------------
-- Indexes for speed
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS contributions_domain_idx ON contributions(domain);
CREATE INDEX IF NOT EXISTS contributions_created_at_idx ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_contribution_id_idx ON reviews(contribution_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS solve_issues_created_at_idx ON solve_issues(created_at DESC);
CREATE INDEX IF NOT EXISTS review_comments_review_idx ON review_comments(review_id);

-- -----------------------------------------------------------------------------
-- Soft-hide fields for moderation
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS contributions
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

ALTER TABLE IF EXISTS solve_issues
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

ALTER TABLE IF EXISTS review_comments
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

ALTER TABLE IF EXISTS solve_issue_comments
  ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- -----------------------------------------------------------------------------
-- Follow graph
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON user_follows(following_id);

-- -----------------------------------------------------------------------------
-- Moderation reports
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_reports (
  id bigserial PRIMARY KEY,
  reporter uuid REFERENCES users(id) ON DELETE SET NULL,
  target_type text NOT NULL,
  target_id bigint NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_reports_target_idx ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status);

-- -----------------------------------------------------------------------------
-- Review flags (community signals)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_flags (
  review_id bigint REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  flag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS review_flags_review_idx ON review_flags(review_id);

-- -----------------------------------------------------------------------------
-- RLS policies (new tables + soft hide)
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS solve_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solve_issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_flags ENABLE ROW LEVEL SECURITY;

-- Solve issues: public read, author write/hide
DO $$ BEGIN
  CREATE POLICY solve_issues_select_public
    ON solve_issues
    FOR SELECT
    USING (is_hidden = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY solve_issues_insert_own
    ON solve_issues
    FOR INSERT
    WITH CHECK (author = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY solve_issues_update_own
    ON solve_issues
    FOR UPDATE
    USING (author = auth.uid())
    WITH CHECK (author = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Solve issue comments: public read, author write/hide
DO $$ BEGIN
  CREATE POLICY solve_issue_comments_select_public
    ON solve_issue_comments
    FOR SELECT
    USING (is_hidden = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Contributions/reviews/review_comments: update existing public select to respect is_hidden
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contributions' AND policyname = 'contributions_select_public'
  ) THEN
    EXECUTE 'ALTER POLICY contributions_select_public ON public.contributions USING (is_hidden = false)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'reviews_select_public'
  ) THEN
    EXECUTE 'ALTER POLICY reviews_select_public ON public.reviews USING (is_hidden = false)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'review_comments' AND policyname = 'read review comments'
  ) THEN
    EXECUTE 'ALTER POLICY "read review comments" ON public.review_comments USING (is_hidden = false)';
  END IF;
END $$;

DO $$ BEGIN
  CREATE POLICY solve_issue_comments_insert_own
    ON solve_issue_comments
    FOR INSERT
    WITH CHECK (author = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY solve_issue_comments_update_own
    ON solve_issue_comments
    FOR UPDATE
    USING (author = auth.uid())
    WITH CHECK (author = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Follow graph: users manage own follows
DO $$ BEGIN
  CREATE POLICY user_follows_select_own
    ON user_follows
    FOR SELECT
    USING (follower_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_follows_insert_own
    ON user_follows
    FOR INSERT
    WITH CHECK (follower_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_follows_delete_own
    ON user_follows
    FOR DELETE
    USING (follower_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Content reports: users report anything, can read own reports
DO $$ BEGIN
  CREATE POLICY content_reports_insert_own
    ON content_reports
    FOR INSERT
    WITH CHECK (reporter = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY content_reports_select_own
    ON content_reports
    FOR SELECT
    USING (reporter = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Review flags: users can flag once
DO $$ BEGIN
  CREATE POLICY review_flags_select_public
    ON review_flags
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY review_flags_insert_own
    ON review_flags
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY review_flags_delete_own
    ON review_flags
    FOR DELETE
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
