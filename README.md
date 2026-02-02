# Knowledge Equity

Full-stack React + Express + Supabase app for earning **Knowledge Equity (KE)** through validated technical contributions.

## Tech

- React 18 + React Router (SPA)
- Vite + TypeScript
- Express (mounted into Vite dev server)
- Supabase (Auth + Postgres)

## Getting Started

### 1) Install deps

```bash
pnpm install
```

### 2) Configure environment

Create/update `.env` (note: Vite exposes `VITE_*` to the browser):

```bash
# Supabase (client-side)
VITE_SUPABASE_URL=https://rhupcwgnaydtmqzbapyt.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Supabase (server-side admin)
SUPABASE_URL=https://rhupcwgnaydtmqzbapyt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Optional: Upstash Redis (production rate limiting)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Security / ops
# Comma-separated allowlist. If unset/empty, allows all origins.
CORS_ALLOWED_ORIGINS=http://localhost:8080
# Request body limits
JSON_BODY_LIMIT=200kb
URLENCODED_BODY_LIMIT=200kb
# Disable noisy request logs in CI/tests
DISABLE_REQUEST_LOGS=1
```

### 3) Apply database migrations (hosted)

```bash
supabase link --project-ref rhupcwgnaydtmqzbapyt
supabase db push
```

Migrations live in `supabase/migrations/`.

### 4) Run dev server

```bash
pnpm dev
```

Vite runs the SPA and mounts the Express API under `/api`.

## Useful Scripts

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## Architecture Overview

Knowledge Equity is a single-port full-stack app:

- **Vite** serves the React SPA and proxies/mounts the **Express** API in dev.
- **Express** handles `/api/*` routes and talks to **Supabase** (Postgres + Auth).
- **Supabase Auth** provides sessions; the server validates tokens with the public client and performs privileged DB writes via the **service role key**.

In production, the server is built and served from `dist/server/` and the SPA from `dist/spa/`.

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components
├── components/           # Shared UI + layout
├── components/ui/        # UI primitives (Radix + Tailwind)
├── hooks/                # Client hooks (auth, data)
├── lib/                  # Client utilities
└── global.css            # Theme tokens + global styles

server/                   # Express API backend
├── index.ts              # Server setup + routes
├── routes/               # API handlers
└── lib/                  # Auth, Supabase clients, KE logic, rate limit

shared/                   # Shared API types
└── api.ts

supabase/                 # DB migrations
└── migrations/
```

## Data Model (Supabase)

Core tables used by the app:

- **users**: app-level profile row, keyed by Supabase Auth user id
  - `id (uuid)`, `handle`, `email`, `website`, `twitter`, `github`, `created_at`
- **contributions**: knowledge posts
  - `id`, `title`, `excerpt`, `content`, `domain`, `type`, `author`, `ke_gained`, `reviews_count`, `effort`, `effort_unit`, `external_link`, `created_at`
- **reviews**: review records
  - `id`, `contribution_id`, `reviewer`, `rating`, `confidence`, `comment`, `ke_awarded`, `created_at`
- **review_comments**: threaded comments on reviews
  - `id`, `review_id`, `author`, `parent_id`, `body`, `created_at`, `updated_at`
- **domains**: canonical domain list
  - `id`, `name`
- **user_expertise**: user-selected expertise domains
  - `user_id`, `domain`
- **user_ke**: domain-level KE summaries
  - `user_id`, `domain`, `ke_amount`, `contributions_count`, `reviews_given_count`

## API Reference (Express /api)

### Health

- `GET /api/ping`

### Contributions

- `GET /api/contributions` → feed list
- `GET /api/contributions/:id` → detail + reviews
- `POST /api/contributions` (auth required)
  - body: `ContributionCreate` (see `shared/api.ts`)

### Reviews

- `POST /api/reviews` (auth required)
  - body: `ReviewSubmit`
  - enforces: no self-review, one review per contribution
- `GET /api/contributions/:id/reviews`

### Review Comments

- `GET /api/reviews/:id/comments`
- `POST /api/review-comments` (auth required)
  - body: `ReviewCommentCreate`

### Domains

- `GET /api/domains` → returns domains + stats
- `GET /api/domains/search?q=<term>` → Wikidata suggestions (short single-word only)
- `GET /api/domains/validate?name=<term>` → exact-match validation

### Leaderboard

- `GET /api/leaderboard?domain=<optional>`

### Profiles / Settings

- `GET /api/profile/:handle`
- `GET /api/profile/me` (auth required)
- `GET /api/settings/me` (auth required)
- `PATCH /api/settings/me` (auth required)

### Auth (Server Expectations)

- All protected routes require: `Authorization: Bearer <supabase_access_token>`
- `server/lib/authMiddleware.ts` validates token via Supabase and attaches `req.auth`

## Client Pages

Routes are declared in `client/App.tsx`. Key pages:

- **Feed** (`/feed`): contributions, filters by domain/type, search
- **Contribution Detail** (`/contribution/:id`): full content + reviews
- **Contribute** (`/contribute`): create contribution (auth required)
- **Submit Review** (`/review/:contributionId`): review flow (auth required)
- **Profile** (`/profile/:handle`): public profile or `/profile/me`
- **Settings** (`/settings`): profile + expertise management (auth required)
- **Leaderboard** (`/leaderboard`): global or by-domain KE leaderboard
- **Domains** (`/domains`): domain stats overview
- **My Contributions** (`/me/contributions`): user contributions (auth required)

## Auth Flow (Supabase)

- Client uses `useSupabaseAuth` + `AuthProvider` to get session tokens.
- `RequireAuth` protects private routes and redirects to `/login`.
- Server validates tokens and performs privileged writes using service role.
- If a user has no row in `public.users`, the server auto-creates it on `/api/profile/me` or first write.

## Knowledge Equity (KE) Algorithm

Located in `server/lib/keCalculation.ts` with tests in `server/lib/keCalculation.spec.ts`.

High-level behavior:

- Each contribution type has a base value.
- Reviews are weighted by reviewer KE in that domain.
- Confidence score scales the impact.
- Anomaly detection dampens low-quality or suspicious patterns.

`POST /api/reviews` recalculates the contribution KE and updates reviewer KE using the atomic RPC `submit_review_atomic`.

## Security & Ops

- **CSP**: disabled in dev to allow Vite HMR; enabled in prod via Helmet.
- **CORS**: allowlist via `CORS_ALLOWED_ORIGINS`.
- **Rate limiting**:
  - Upstash Redis in production (if configured)
  - In-memory limiter used only in dev
- **Body limits**: `JSON_BODY_LIMIT`, `URLENCODED_BODY_LIMIT`.
- **Request logging**: JSON logs with request IDs; can be disabled with `DISABLE_REQUEST_LOGS=1`.

## Notes

- Shared types live in `shared/api.ts`.
- Server Supabase client prefers `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` and falls back to `VITE_SUPABASE_*` only if needed.
- Authenticated endpoints require `Authorization: Bearer <supabase access_token>`.
  - Server attaches the resolved user on `req.auth` via `server/lib/authMiddleware.ts`.
  - If a signed-in user has no row in `public.users` yet, the server auto-creates one (`id = auth user id`) with a generated unique `handle`.

## Current Status & What’s Needed Next

This app is in active MVP build-out: core backend flows exist (auth plumbing, contributions, reviews, KE calculation), while several pages still rely on mock data or need additional endpoints. To get to a robust MVP, prioritize:

1. **Apply all Supabase migrations** (including RPC/constraints)
   - Ensure `supabase/migrations/` are pushed to your Supabase project.
2. **Auth hardening + route protection**
   - Confirm all protected routes use `authMiddleware` and the client route guards.
3. **Connect remaining UI to real data**
   - Profile, Leaderboard, Contribution Detail, My Contributions, Settings pages should consume `/api/*` endpoints rather than mock data.
4. **Finalize API gaps**
   - `GET /api/contributions/:id` detail
   - `GET /api/users/:handle`, `GET /api/users/me`
   - `GET /api/leaderboard`
   - `GET /api/users/me/contributions`
5. **Security & ops checks**
   - Validate RLS policies, rate limiting, input validation (Zod), and CORS allowlist.

## Remaining Implementation Checklist

Use this as the short, actionable list of what’s left to reach a production-ready MVP.

### P0 — Must-have before launch

- **Auth enforcement everywhere**
  - Ensure all write routes use `authMiddleware` and client routes are protected.
  - Replace any placeholder reviewer/user IDs with `req.auth.user.id`.
- **Contribution detail endpoint**
  - `GET /api/contributions/:id` should return full content + reviews.
- **User profiles from real data**
  - `GET /api/users/:handle`, `GET /api/users/me`.
  - Populate domain breakdown from `user_ke`.
- **Leaderboard endpoint**
  - `GET /api/leaderboard?domain=<optional>` from `user_ke`.
- **My Contributions endpoint**
  - `GET /api/users/me/contributions` with status filtering.
- **Supabase migrations + RPC**
  - Apply migrations and ensure RPC/constraints are live.

### P1 — Important UX gaps

- Replace remaining mock data in pages:
  - `Profile`, `Leaderboard`, `ContributionDetail`, `MyContributions`, `Settings`.
- Add pagination for the feed.
- Implement editing for contributions (if needed for MVP).

### P2 — Security & polish

- Confirm RLS policies match server behavior.
- Validate input with Zod for all write endpoints.
- Rate-limit write endpoints (in-memory or Upstash).
- Add production headers and stricter CORS allowlist.

## Knowledge Equity — Full Feature List (End-to-End)

This is a product-level checklist aligned to the current implementation.

## The Commons — Feature Blueprint (Proposed)

A community intelligence hub that blends discovery with action.

### 1) Core Identity

- Dual-feed system: **Discover** (curated news/trends) + **Solve** (issues/action items).
- Mission: _See what matters. Fix what’s broken._

### 2) Discover Feed (HN-like, evolved)

- Hybrid ranking: hot + relevance + quality signals.
- Post types: Articles, tools, launches, debates, deep dives.
- Mandatory tags: Problem, Solution, Debate, Launch, Opinion, Data.
- Quality filters: No fluff, Deep dive, Signal vs Noise slider.
- Embedded previews + collaborative summaries (TL;DR).

### 3) Solve Feed (Issue reporting + action)

- Structured issue template (problem, impact 1–10, domain, current solutions).
- Action needed tag: awareness, funding, code, policy.
- Status: Open → Investigating → In progress → Solved → Closed.
- Bounties/sponsors + related Discover linking.

### 4) User System & Reputation

- Tracks: **Insight**, **Action**, **Curation**.
- Role badges: Analyst, Builder, Advocate, Investigator, Diplomat.
- Weighted voting by track; portfolio of solved work.

### 5) Collaboration

- Workgroups, collaborative docs, polls/surveys, “Request expertise.”

### 6) Moderation & Quality

- Community jury for flags; transparency logs.
- Duplicate/low-effort detection; strike system.

### 7) Tech & UX Must‑Haves

- Fast, keyboard‑first, realtime updates.
- Advanced search; API-first; mobile responsive.

### 8) Differentiators

- “Ripple” tracking: Solve → Discover → solutions.
- Weekly digest, offline mode, exports, ad‑free monetization.

### 1) Identity & Trust Layer (Foundation)

#### 1.1 Authentication

- Email magic link login
- OAuth login (Google)
- Persistent user identity (Supabase Auth)
- Server-side auth resolution (`req.auth`)
- Auto user row creation on first login

Status: ✅ Implemented

#### 1.2 User Identity & Profile

- Unique handle
- Public profile page by handle
- Bio / description
- Declared domains of expertise
- Domain-specific KE display
- Verified expertise (domains with KE ≥ 100 show a Verified badge)
- Global KE display
- Contribution history
- Review history

Status: 🟡 Mostly implemented

Potential additions (later):

- Profile completeness indicator

### 2) Contribution System (Core Value)

#### 2.1 Contribution Creation

- Auth-required submission
- Contribution types:
  - Research
  - Answer / Explanation
  - Critique
  - Bug fix / Technical fix
- Domain selection
- GitHub-style markdown formatting shortcuts (bold, italic, lists, quote, code, link)
- Copy share link after posting (optional)
- Optional external evidence links (GitHub, papers, blogs)
- Self-reported effort (minutes)
- Draft vs published state

Status: ✅ Implemented (markdown/rich editor can come later)

#### 2.2 Contribution Lifecycle

- Draft saving
- Publishing
- Editing (with updated_at)
- Immutable review history
- Visibility in feed
- Visibility on profile

Status: 🟡 Mostly implemented

Later:

- Edit history / versioning
- Soft delete (admin/mod)

#### 2.3 Contribution Discovery

- Global feed
- Domain-filtered feed
- Type-filtered feed
- Pagination / infinite scroll
- Domain overview pages

Status: ✅ Implemented

### 3) Review & Validation System (The Differentiator)

#### 3.1 Review Submission

- Auth-required
- One review per user per contribution
- Self-review prevention
- Structured ratings:
  - confirmed_correct
  - valuable_incomplete
  - novel_insight
  - incorrect_constructive
  - not_credible
- Free-text explanation
- Confidence score

Status: ✅ Implemented

#### 3.2 Review Integrity

- DB uniqueness constraint (reviewer + contribution)
- Atomic KE update via RPC
- Race-condition protection
- Validation of rating values
- Review stored permanently

Status: ✅ Implemented (with ongoing hardening possible)

#### 3.3 Reviewer Weighting

- Reviewer KE affects impact
- Domain-specific KE weighting
- Logarithmic dampening
- Reviewer gains KE for good reviews

Status: ✅ Implemented in `server/lib/keCalculation.ts`

### 4) Knowledge Equity (KE) System (Protocol Core)

#### 4.1 KE Ledger

- Append-only KE events
- Reason + delta stored
- Timestamped
- Contribution-linked
- User-linked

Status: 🟡 Partially implemented (`user_ke` summary exists)

Strong recommendation (later):

- Add explicit `ke_events` table as source of truth

#### 4.2 KE Calculation

- Contribution base value by type
- Reviewer weight
- Confidence multiplier
- Anomaly detection (review rings, abuse)
- Recalculation support

Status: ✅ Implemented

#### 4.3 KE Views

- Global leaderboard
- Domain leaderboard
- Profile KE breakdown
- Contribution-level KE gained

Status: ✅ Implemented

### 5) Domains & Expertise

#### 5.1 Domain Management

- Canonical domain list (Wikidata suggestions, short single-word only + exact-match enforcement)
- Domain stats (contributors, KE totals)
- Domain filter everywhere
- User-declared expertise per domain

Status: ✅ Implemented

#### 5.2 Expertise Effects

- Reviewer weighting by domain
- Expertise visible on profile, including Verified badge for domains with KE ≥ 100
- Expertise editable in settings

Status: 🟡 Implemented

Later:

- Expertise decay
- Expertise endorsement

### 6) Anti-Garbage & Integrity Controls

#### 6.1 Quality Gates

- Minimum content length
- Rate limiting on:
  - Contribution submission
  - Reviews
- Duplicate review prevention
- Self-review prevention

Status: ✅ Implemented / partially implemented

#### 6.2 Abuse Detection

- Review ring detection
- KE anomaly flags
- Low-quality reviewer dampening
- Soft penalties (reduced KE impact)

Status: 🟡 Implemented at algorithm level; UI/admin visibility later

### 7) UX & Product Polish

#### 7.1 Onboarding

- First-login flow
- Handle selection
- Expertise selection
- Explanation of KE

Status: 🟡 Partially implemented

#### 7.2 Contribution UX

- Clear “what good looks like” guidance
- Structured prompts
- Evidence section clarity
- Preview before publish

Status: 🟡 Basic, needs polish

#### 7.3 Review UX

- Explain review responsibility
- Warn about KE impact
- Encourage thoughtful reviews

Status: 🔧 Needs copy + UX polish

### 8) Platform & Ops

#### 8.1 Server & Security

- Express API mounted under Vite
- CORS allowlist
- Body size limits
- Structured logging
- Request IDs
- Auth middleware
- Zod validation

Status: ✅ Mostly implemented

#### 8.2 Rate Limiting

- In-memory limiter
- Upstash Redis optional
- Different limits per endpoint

Status: ✅ Implemented

#### 8.3 Testing

- Unit tests for KE logic
- Route-level tests for critical flows
- Auth-required route tests

Status: ✅ Implemented for critical flows (continuing to expand)

### 9) Explicitly Out of Scope (For Now)

- Automatic GitHub scraping
- AI judging correctness
- Likes / reactions
- Follows / social graph
- Notifications
- Tokenization / crypto
- ZK identity
- Monetization

### 10) One-Sentence Product Definition

> Knowledge Equity is a system where people earn durable, domain-specific reputation by explaining real work and having it critically reviewed — not by attracting attention.

---

## Implementation status

### What is implemented (code-backed)

#### Database (Supabase)

- Migrations in `supabase/migrations/` create/extend:
  - `contributions`, `reviews`, `users`, `user_ke`, `domains`, `user_expertise`
- RLS migration exists (`20260129210000_add_rls_policies.sql`) plus policies for `user_expertise`.

#### Server API (Express under `/api`)

- Structured request logging enabled (JSON logs, `x-request-id` header) via `server/lib/logger.ts`.
  - Set `DISABLE_REQUEST_LOGS=1` to disable logging (useful for tests/CI).

- Health:
  - `GET /api/ping`
- Contributions:
  - `GET /api/contributions` (feed list)
  - `GET /api/contributions/:id` (detail + reviews)
  - `POST /api/contributions` (auth required; author is taken from the authenticated user)
- Reviews:
  - `POST /api/reviews` (auth required; prevents self-review; prevents duplicate review per contribution; recalculates contribution KE and updates `user_ke`)
  - `GET /api/contributions/:id/reviews`
- Domains:
  - `GET /api/domains` (includes basic derived stats)
- Leaderboard:
  - `GET /api/leaderboard?domain=<optional>` (reads from `user_ke`, aggregates global if no domain)
- Profiles / settings:
  - `GET /api/profile/:handle`
  - `GET /api/profile/me` (auth required)
  - `GET /api/settings/me` (auth required)
  - `PATCH /api/settings/me` (auth required; handle uniqueness check + expertise replacement)

#### Client (React SPA)

- Pages wired and functional:
  - Feed, Domains, Leaderboard, ContributionDetail
  - Contribute (protected)
  - SubmitReview (protected)
  - Profile by handle + ProfileMe (protected)
  - Settings (protected)
  - MyContributions (protected; filters by `author_id === supabase user id`)
  - Login (Google OAuth + email magic link)
- Auth plumbing:
  - `useSupabaseAuth` + `AuthProvider` + `RequireAuth` route guard

#### KE algorithm

- `server/lib/keCalculation.ts` implements KE computation + anomaly detection.
- Unit tests exist and pass (`server/lib/keCalculation.spec.ts`).

### What is still needed (to reach a robust MVP)

#### Data integrity / KE ledger correctness

- Make KE updates transaction-safe:
  - Implemented via Postgres RPC `submit_review_atomic` (see migration `20260130132000_reviews_unique_and_atomic_review_rpc.sql`).
  - Ensure migrations are applied to your Supabase project.
- Decide on KE source of truth:
  - Whether `contributions.ke_gained` is derived (recomputable from reviews) vs stored as authoritative snapshot.
- Add DB constraints:
  - Unique constraint on `reviews(contribution_id, reviewer)` (server checks exist, but DB constraint prevents races).

#### RLS + production security hardening

- Validate that RLS policies match server behavior (especially if clients will ever query Supabase directly).
- Server-side input validation with Zod for write endpoints (implemented in `server/lib/validation.ts`).
- Rate limiting for write endpoints:
  - In-memory limiter by default (`server/lib/rateLimit.ts`).
  - Optional Upstash Redis limiter when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set (`server/lib/rateLimitUpstash.ts`).

#### OWASP / tamper resistance notes

- **Client code is not trusted**: all enforcement happens server-side. Any devtools edits are rejected by auth/validation.
- **AuthN/AuthZ**: all write endpoints require `Authorization: Bearer <token>`; solve issue status updates enforce creator-only on server.
- **Input validation**: Zod schemas for all writes; enums + size limits to reduce injection risk.
- **Rate limiting**: per-route limits mitigate brute force and abuse.
- **Headers**: Helmet in production; CSP enabled in prod (disabled in dev for Vite).
- **Data access**: sensitive writes use service-role key on server only; client uses anon key.

#### Product / UX polish

- Feed page cleanup:
  - Done: Feed type filter uses `CONTRIBUTION_TYPES` from `shared/api.ts` (bug/critique mismatch fixed).
  - Done: Feed domain suggestions come from `GET /api/domains` (API-only).
- Settings page copy:
  - Done: UI copy now matches server behavior (handle can be changed, must be unique).
- Onboarding:
  - Decide how onboarding relates to handle selection / expertise selection (some of this is already in Settings).

#### Testing & operations

- Add route-level tests for critical flows:
  - create contribution (auth required) (implemented)
  - submit review (auth required + self-review + duplicate review + RPC path) (implemented)
  - profile/me auto-create (implemented)
- Add deployment checklist notes (Netlify/Vercel/Node) + env var checklist (added below).

## Deployment checklist (practical)

### Node (single server)

- Set env vars:
  - Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Optional: Upstash (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- Apply migrations: `supabase db push`
- Build: `npm run build`
- Start: `npm run start`

### Netlify

- `netlify.toml` already redirects `/api/*` → `/.netlify/functions/api/*`.
- Ensure Netlify env vars include the same Supabase + optional Upstash values.
- Build command: `npm run build:client` (SPA) + functions build handled by Netlify.

## Roadmap / TODO (what's left)

If you’re deciding “what to build next”, start with:

### Phase 1 — Dual Feed + Solve Issues (implemented)

- **Discover/Solve toggle** on Feed.
- **Solve Issues API**
  - `GET /api/solve-issues`
  - `POST /api/solve-issues` (auth required)
- **Solve Issues table**: `solve_issues` (impact 1–10, status, action_needed).
- **UI**: Issue creation form + issue cards.

1. KE ledger events table (`ke_events`) as source of truth (auditability)
2. Onboarding polish + clear KE explanation UX
3. Optional: strict production CSP (nonces/hashes) once deployment headers are finalized
