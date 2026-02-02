-- Solve issues (The Commons)
CREATE TABLE IF NOT EXISTS solve_issues (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  domain text NOT NULL,
  impact integer NOT NULL CHECK (impact >= 1 AND impact <= 10),
  action_needed text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  author uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS solve_issues_domain_idx ON solve_issues(domain);
CREATE INDEX IF NOT EXISTS solve_issues_status_idx ON solve_issues(status);

INSERT INTO solve_issues (title, summary, domain, impact, action_needed, status)
VALUES
  ('Translation gaps in Francophone medical guides',
   'Local clinicians report missing French resources for updated malaria protocols.',
   'Health', 8, 'policy', 'investigating'),
  ('Open data for rural water quality',
   'Community groups lack access to monthly water contamination datasets.',
   'Environment', 7, 'funding', 'open'),
  ('Accessibility audits for public transport apps',
   'Reported barriers for screen readers on ticketing portals.',
   'Civic Tech', 6, 'code', 'in_progress')
ON CONFLICT DO NOTHING;
