# SEO Autopilot

AI-powered SEO analysis, content creation, optimization, and continuous
monitoring — built with Next.js (App Router, JavaScript), Tailwind CSS,
and Supabase.

> **Status:** Phases 1–4 of the build (setup, marketing site, auth,
> database) are complete and functional. The dashboard, crawler, AI
> engine, and remaining phases are not yet built — see **Roadmap** below.

## Tech stack

- Next.js 14 (App Router), plain JavaScript — no TypeScript
- React 18, Tailwind CSS, React Icons, Framer Motion
- Supabase: Auth, Postgres, Row Level Security

## What's built

- **Marketing site** — landing page (hero with a live, SSRF-validated
  website analyzer backed by demo data), features, pricing, about,
  contact, resources, privacy, terms — all linked from nav/footer.
- **Auth** — signup, login, forgot-password, reset-password, all wired
  to Supabase Auth. Middleware protects `/dashboard/*` and `/onboarding`,
  and redirects logged-in users away from `/login` and `/signup`.
- **Onboarding** — post-signup wizard (`/onboarding`): website URL →
  business type → goals → live first-audit scan.
- **Database** — full schema with 18 tables and Row Level Security in
  `supabase/migrations/0001_init.sql`, plus an auto-profile-creation
  trigger on signup.
- **Real SEO crawler + scoring engine** — `src/services/seo/realCrawler.js`
  fetches a live homepage (via the SSRF-safe `safeFetch`), extracts
  technical/on-page/content/performance/mobile/accessibility signals,
  and `scoringEngine.js` turns those into weighted category scores and
  a real issues list — no more fake numbers behind login. The public
  marketing analyzer stays on demo data by design (see Security notes).
- **API routes** — every endpoint from the spec's routing table, all
  auth-gated via `requireUser()` and RLS-scoped, plus notifications,
  profile, integrations, and content-drafts routes needed to back the
  dashboard UI.
- **Dashboard** — every section is a real, working UI wired to the API
  above: Websites (add/view + run audit), Content generator (drafts
  saved to the database), Keywords, Recommendations (apply), Monitoring
  settings, Integrations (GitHub/WordPress/Manual), Reports, Settings,
  Billing. The topbar notification bell is live.
- **Security** — SSRF-safe URL validation (`src/lib/security/urlValidation.js`)
  for anything that will eventually crawl a user-supplied website.

## Folder structure

```
src/
├── app/
│   ├── (marketing)/     # landing, pricing, features, about, contact, resources, privacy, terms
│   ├── (auth)/          # login, signup, forgot-password, reset-password
│   ├── dashboard/        # route stubs — Phase 6+
│   └── api/
│       └── analyze/     # public demo analyzer endpoint
├── components/
│   ├── ui/               # Button, Card, Badge, FormField, AuthCard
│   ├── marketing/         # Navbar, Footer, Hero, Features, Faq, etc.
│   └── seo/               # ScoreCircle
├── services/
│   └── seo/mockCrawler.js # demo audit generator (swap point for a real crawler)
├── lib/
│   ├── supabase/          # client.js (browser), server.js (SSR), admin.js (service role)
│   ├── auth/authActions.js
│   ├── security/urlValidation.js
│   └── validation/schemas.js
├── constants/              # plans, nav, severity/score weights
└── middleware.js
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com).

3. **Run the migration** — open the Supabase SQL editor and paste the
   contents of `supabase/migrations/0001_init.sql`, or via the CLI:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. **Environment variables** — copy `.env.example` to `.env.local` and
   fill in your Supabase project URL and anon key (Project Settings →
   API). Leave `AI_API_KEY` blank for now; AI features arrive in a
   later phase.

   ```bash
   cp .env.example .env.local
   ```

5. **Run locally**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Deployment

Optimized for Vercel: connect the repo, add the same environment
variables in the Vercel dashboard, and deploy. Supabase handles auth
and the database — no separate backend to host.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is only read in `src/lib/supabase/admin.js`,
  which is marked `server-only` so it can never end up in a client bundle.
  It's unused today — reserved for future cron/admin jobs.
- The website analyzer validates URLs against private IP ranges,
  localhost, and cloud metadata endpoints before use
  (`src/lib/security/urlValidation.js`). The real crawler's fetch layer
  (`src/lib/security/safeFetch.js`) closes the DNS-rebinding gap this
  file flags: it resolves DNS itself, validates the resolved IP, and
  pins the TCP connection to that exact address — so a hostname can't
  validate as safe and then resolve somewhere unsafe between the check
  and the request. Every redirect hop is re-validated the same way.
- The real crawler is intentionally kept behind auth + plan limits
  (`/api/websites/[id]/audit`) and never exposed on the public,
  unauthenticated marketing analyzer (`/api/analyze`, still demo data) —
  an anonymous endpoint that server-side fetches arbitrary URLs is an
  abuse vector on its own even with IP-range validation.
- All 18 database tables have Row Level Security enabled and scoped to
  `auth.uid()`, either directly or through their parent website/project.

## Roadmap (not yet built)

The real AI provider (content generation still returns clearly-labeled
demo output — swap point is `services/ai/aiService.js`), Stripe billing,
real GitHub/WordPress OAuth for the auto-fix integrations, PDF report
export, scheduled monitoring cron jobs, multi-page crawling (today's
crawler audits the homepage only — see the note at the top of
`realCrawler.js` for how to extend it to follow internal links up to
`CRAWL_LIMITS.maxPages`), and admin architecture.

Say "continue" or name a phase to keep building.
