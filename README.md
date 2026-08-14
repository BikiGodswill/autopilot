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
- **Database** — full schema with 19 tables and Row Level Security in
  `supabase/migrations/0001_init.sql` + `0002_billing_fapshi.sql`, plus an auto-profile-creation
  trigger on signup.
- **Real SEO crawler + scoring engine** — `src/services/seo/realCrawler.js`
  fetches a live homepage (via the SSRF-safe `safeFetch`), extracts
  technical/on-page/content/performance/mobile/accessibility signals,
  and `scoringEngine.js` turns those into weighted category scores and
  a real issues list — no more fake numbers behind login. The public
  marketing analyzer stays on demo data by design (see Security notes).
- **Real AI content generation** — `src/services/ai/aiService.js` calls
  Anthropic (via `src/lib/ai/anthropicClient.js`) when `AI_API_KEY` is
  set, using centralized/versioned prompts (`services/ai/prompts.js`).
  Every response is JSON-parsed and schema-validated before it reaches
  the database or UI (`services/ai/validateAiResponse.js`) — an
  invalid response throws a clear error instead of silently passing
  through. No key set → falls back to the mock provider automatically,
  so local dev works without API credits.
- **Usage limits** — AI word generation and monthly audits are metered
  against `usage_records` and enforced against each plan's limits
  (`src/services/usage/usageService.js`) before the paid action runs,
  not just counted after.
- **Rate limiting** — the public, unauthenticated analyzer endpoint
  (`/api/analyze`) is IP-rate-limited (`src/lib/security/rateLimit.js`);
  every other AI/crawl-consuming route is already behind auth + plan
  limits instead.
- **API routes** — every endpoint from the spec's routing table, all
  auth-gated via `requireUser()` and RLS-scoped, plus notifications,
  profile, integrations, and content-drafts routes needed to back the
  dashboard UI.
- **Dashboard** — every section is a real, working UI wired to the API
  above: Websites (add/view + run audit), Content generator (drafts
  saved to the database), Keywords, Recommendations (apply), Monitoring
  settings, Integrations (GitHub/WordPress/Manual), Reports, Settings,
  Billing. The topbar notification bell is live.
- **Real billing via Fapshi (MTN Mobile Money & Orange Money)** —
  `/dashboard/billing` generates a Fapshi-hosted checkout link
  (`services/billing/fapshiService.js`); on confirmed payment, the
  webhook (verified via `x-wh-secret`, fails closed without it) or the
  billing page's own polling fallback upgrades `profiles.plan` and
  `subscriptions` exactly once (idempotent via `payment_transactions.applied`).
  Prices are in XAF (`PLANS.<id>.priceXAF` in `src/constants/index.js`) —
  the only currency Mobile Money/Orange Money settle in.
- **Production hardening** — security headers (`next.config.mjs`:
  HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy),
  a global error boundary + branded 404 page, a dashboard loading
  skeleton, `robots.txt`/`sitemap.xml` metadata routes, and startup
  environment validation (`src/lib/env.js`) that fails with a clear
  message instead of a cryptic Supabase error when misconfigured.
- **Security** — SSRF-safe URL validation (`src/lib/security/urlValidation.js`),
  extended by `safeFetch.js`'s DNS-pinning for the real crawler.

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

3. **Run the migrations** — open the Supabase SQL editor and paste the
   contents of `supabase/migrations/0001_init.sql`, then
   `0002_billing_fapshi.sql` (in that order), or via the CLI:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. **Environment variables** — copy `.env.example` to `.env.local` and
   fill in your Supabase project URL and anon key (Project Settings →
   API). Add an Anthropic API key as `AI_API_KEY` to enable real AI
   content generation — leave it blank to use the built-in mock
   provider (clearly labeled demo output, no cost, no key needed).

   ```bash
   cp .env.example .env.local
   ```

5. **Billing (optional for local dev)** — create a service at
   [dashboard.fapshi.com](https://dashboard.fapshi.com) to get your
   sandbox `apiuser`/`apikey`, set them as `FAPSHI_API_USER`/
   `FAPSHI_API_KEY`, and set a webhook URL on that service pointing to
   `<your-app-url>/api/billing/webhook` with a secret — put the same
   secret in `FAPSHI_WEBHOOK_SECRET`. Test payments in sandbox using
   the numbers listed at
   [docs.fapshi.com/en/api-reference/preliminary-knowledge/environment](https://docs.fapshi.com/en/api-reference/preliminary-knowledge/environment)
   (e.g. `670000000` always succeeds, `670000001` always fails). Without
   these set, the checkout button will return a clear "payment error"
   instead of silently pretending to charge someone.

6. **Run locally**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Deployment

Optimized for Vercel: connect the repo, add the same environment
variables in the Vercel dashboard, and deploy. Supabase handles auth
and the database — no separate backend to host.

**Before going live**, replace `NEXT_PUBLIC_APP_URL` with your real
production domain (it feeds `robots.js`, `sitemap.js`, the
password-reset redirect URL, and the Fapshi checkout `redirectUrl`),
confirm `AI_API_KEY` is set — without it, production would silently
serve demo AI content to real users — and switch `FAPSHI_ENV` to
`live` with your live `apiuser`/`apikey`/webhook secret.

**Note on rate limiting and usage metering**: both are implemented
in-process (`src/lib/security/rateLimit.js`, `usage_records` table).
This is correct for a single-instance deployment. If you deploy to a
multi-instance or serverless platform where requests land on different
processes, the in-memory rate limiter won't see all requests — swap it
for a shared store (e.g. Upstash Redis); the function signature in
`rateLimit.js` is designed so that's a one-file change. Usage metering
already lives in Postgres, so it's multi-instance-safe as-is.

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
- All 19 database tables have Row Level Security enabled and scoped to
  `auth.uid()`, either directly or through their parent website/project.
- AI responses are never trusted as-is: `services/ai/validateAiResponse.js`
  parses and schema-checks every response before it's stored or shown.
- `src/lib/env.js` fails fast with a clear message if required env vars
  are missing, instead of a confusing downstream Supabase error.
- The Fapshi webhook (`/api/billing/webhook`) fails **closed**: it
  rejects every request if `FAPSHI_WEBHOOK_SECRET` isn't configured,
  and rejects any request whose `x-wh-secret` header doesn't match.
  Without this, anyone could POST a fake "SUCCESSFUL" payment payload
  and grant themselves a paid plan for free. Plan upgrades are also
  idempotent (`payment_transactions.applied`), so a retried or
  duplicate webhook call can't double-apply anything.

## Roadmap (not yet built)

Real GitHub/WordPress OAuth for the auto-fix
integrations, PDF report export, scheduled monitoring cron jobs
(the monitoring settings UI is real and persisted, but nothing triggers
scheduled runs yet — that needs a cron/queue outside Next.js request-
response), multi-page crawling (today's crawler audits the homepage
only — see the note at the top of `realCrawler.js` for how to extend
it to follow internal links up to `CRAWL_LIMITS.maxPages`), and admin
architecture. All of these are gated on external credentials/infra your
original spec itself calls out (§38 demo mode) — everything else in
the spec is real, not placeholder.

Say "continue" or name a phase to keep building.
