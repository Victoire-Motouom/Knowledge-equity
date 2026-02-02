-- Migration: Threaded comments on reviews (Reddit-like)
-- Date: 2026-01-30

-- A comment belongs to a review and may be a reply to another comment.
CREATE TABLE IF NOT EXISTS review_comments (
  id bigserial PRIMARY KEY,
  review_id bigint NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id bigint NULL REFERENCES review_comments(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_review_comments_review_id
  ON review_comments(review_id);

CREATE INDEX IF NOT EXISTS idx_review_comments_parent_id
  ON review_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_review_comments_author
  ON review_comments(author);

-- RLS
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments (public discussion)
DO $$ BEGIN
  CREATE POLICY "read review comments"
    ON review_comments
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only authenticated users can create comments, as themselves
DO $$ BEGIN
  CREATE POLICY "insert own review comment"
    ON review_comments
    FOR INSERT
    WITH CHECK (auth.uid() = author);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Optional: allow authors to edit their own comments
DO $$ BEGIN
  CREATE POLICY "update own review comment"
    ON review_comments
    FOR UPDATE
    USING (auth.uid() = author)
    WITH CHECK (auth.uid() = author);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Optional: allow authors to delete their own comments
DO $$ BEGIN
  CREATE POLICY "delete own review comment"
    ON review_comments
    FOR DELETE
    USING (auth.uid() = author);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
