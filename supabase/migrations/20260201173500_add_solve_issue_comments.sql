-- Solve issue discussion comments
CREATE TABLE IF NOT EXISTS solve_issue_comments (
  id bigserial PRIMARY KEY,
  issue_id bigint REFERENCES solve_issues(id) ON DELETE CASCADE,
  author uuid REFERENCES users(id) ON DELETE SET NULL,
  parent_id bigint REFERENCES solve_issue_comments(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS solve_issue_comments_issue_idx ON solve_issue_comments(issue_id);
