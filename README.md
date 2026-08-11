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
  to Supabase Auth. Middleware protects `/dashboard/*` and redirects
  logged-in users away from `/login` and `/signup`.
- **Database** — full schema with 18 tables and Row Level Security in
  `supabase/migrations/0001_init.sql`, plus an auto-profile-creation
  trigger on signup.
- **API routes** — every endpoint from the spec's routing table:
  `/api/websites` (list/create), `/api/websites/[id]` (get/delete),
  `/api/websites/[id]/audit` (run), `/api/websites/[id]/audits` (history),
  `/api/websites/[id]/issues`, `/api/content/generate`, `/api/content/optimize`,
  `/api/keywords`, `/api/recommendations`, `/api/recommendations/[id]/apply`,
  `/api/monitoring`, `/api/reports` — all auth-gated via `requireUser()`
  and RLS-scoped.
- **Dashboard** — sidebar/topbar shell; functional Websites list (add +
  view) and website detail page (score, run audit, issue list) wired to
  the API above; remaining sections (content, keywords, recommendations,
  monitoring, integrations, reports, settings, billing) are "coming soon"
  stubs, not 404s.
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
  (`src/lib/security/urlValidation.js`). When the real crawler is built
  (Phase 7), its fetch layer must re-validate the *resolved* IP at
  request time too, to close the DNS-rebinding gap noted in that file.
- All 18 database tables have Row Level Security enabled and scoped to
  `auth.uid()`, either directly or through their parent website/project.

## Roadmap (not yet built)

Phase 5 onward from the original spec: onboarding flow, dashboard
overview + website management, the real SEO crawler and scoring engine,
AI content engine (generation/editor/optimization), keyword research,
recommendation + auto-fix engine (GitHub/WordPress integrations),
continuous monitoring jobs, PDF reports, notifications center, billing/
Stripe integration, and admin architecture.

Say "continue" or name a phase to keep building.
