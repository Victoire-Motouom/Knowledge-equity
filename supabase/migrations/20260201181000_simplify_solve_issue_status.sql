-- Simplify solve issue status to open/closed
ALTER TABLE solve_issues
  ALTER COLUMN status SET DEFAULT 'open';

UPDATE solve_issues
SET status = CASE
  WHEN status = 'closed' THEN 'closed'
  WHEN status = 'solved' THEN 'closed'
  ELSE 'open'
END;
