-- ============================================================================
-- SEO Autopilot — Initial schema
-- Run in the Supabase SQL editor, or via `supabase db push` with the CLI.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per auth user, created automatically via trigger below.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','starter','professional','agency')),
  default_country text,
  default_language text default 'en',
  brand_voice text,
  ai_tone text default 'professional',
  ai_default_length int default 1000,
  email_notifications boolean not null default true,
  seo_alert_notifications boolean not null default true,
  content_alert_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── websites ────────────────────────────────────────────────────────────
create table websites (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  url text not null,
  description text,
  industry text,
  target_country text,
  language text default 'en',
  status text not null default 'active' check (status in ('active','paused','error')),
  seo_score int,
  last_audit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_websites_owner on websites(owner_id);

-- ── website_pages ───────────────────────────────────────────────────────
create table website_pages (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  url text not null,
  title text,
  meta_description text,
  h1 text,
  word_count int,
  status_code int,
  is_indexable boolean default true,
  last_crawled_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_pages_website on website_pages(website_id);

-- ── seo_audits ──────────────────────────────────────────────────────────
create table seo_audits (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  overall_score int,
  technical_score int,
  on_page_score int,
  content_score int,
  performance_score int,
  mobile_score int,
  accessibility_score int,
  pages_crawled int default 0,
  status text not null default 'queued' check (status in ('queued','running','completed','failed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_audits_website on seo_audits(website_id);

-- ── seo_issues ──────────────────────────────────────────────────────────
create table seo_issues (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid not null references seo_audits(id) on delete cascade,
  website_id uuid not null references websites(id) on delete cascade,
  page_id uuid references website_pages(id) on delete set null,
  category text not null check (category in ('technical','onPage','content','performance','mobile','accessibility')),
  severity text not null check (severity in ('critical','high','medium','low','info')),
  title text not null,
  description text,
  impact text,
  recommendation text,
  status text not null default 'open' check (status in ('open','resolved','ignored')),
  created_at timestamptz not null default now()
);

create index idx_issues_audit on seo_issues(audit_id);
create index idx_issues_website on seo_issues(website_id);
create index idx_issues_severity on seo_issues(severity);

-- ── seo_recommendations ─────────────────────────────────────────────────
create table seo_recommendations (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  issue_id uuid references seo_issues(id) on delete set null,
  page_id uuid references website_pages(id) on delete set null,
  title text not null,
  description text,
  category text,
  severity text check (severity in ('critical','high','medium','low','info')),
  impact text check (impact in ('high','medium','low')),
  effort text check (effort in ('high','medium','low')),
  suggested_fix text,
  status text not null default 'pending' check (status in ('pending','applied','dismissed')),
  applied_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_recs_website on seo_recommendations(website_id);

-- ── keywords ────────────────────────────────────────────────────────────
create table keywords (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  keyword text not null,
  search_volume int,
  volume_is_estimated boolean not null default true,
  difficulty int,
  intent text check (intent in ('informational','navigational','commercial','transactional')),
  country text,
  language text default 'en',
  target_url text,
  created_at timestamptz not null default now()
);

create index idx_keywords_website on keywords(website_id);

-- ── keyword_rankings ────────────────────────────────────────────────────
create table keyword_rankings (
  id uuid primary key default uuid_generate_v4(),
  keyword_id uuid not null references keywords(id) on delete cascade,
  position int,
  recorded_at timestamptz not null default now()
);

create index idx_rankings_keyword on keyword_rankings(keyword_id);

-- ── content_projects ────────────────────────────────────────────────────
create table content_projects (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  content_type text check (content_type in ('blog_post','landing_page','product_description','seo_title','meta_description','faq','social_post','website_copy')),
  status text not null default 'draft' check (status in ('draft','in_review','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_content_projects_website on content_projects(website_id);

-- ── content_documents ───────────────────────────────────────────────────
create table content_documents (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references content_projects(id) on delete cascade,
  title text,
  body text,
  seo_title text,
  meta_description text,
  target_keyword text,
  seo_score int,
  readability_score int,
  word_count int,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_content_docs_project on content_documents(project_id);

-- ── content_generations ─────────────────────────────────────────────────
-- Audit trail of AI generation calls (for usage limits + debugging).
create table content_generations (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  document_id uuid references content_documents(id) on delete set null,
  prompt_summary text,
  words_generated int default 0,
  provider text,
  status text not null default 'completed' check (status in ('completed','failed')),
  created_at timestamptz not null default now()
);

create index idx_generations_owner on content_generations(owner_id);

-- ── website_integrations ────────────────────────────────────────────────
create table website_integrations (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  provider text not null check (provider in ('github','wordpress','manual')),
  status text not null default 'connected' check (status in ('connected','error','disconnected')),
  external_account text,
  config jsonb default '{}'::jsonb,
  connected_at timestamptz not null default now()
);

create index idx_integrations_website on website_integrations(website_id);

-- ── monitoring_settings ─────────────────────────────────────────────────
create table monitoring_settings (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null unique references websites(id) on delete cascade,
  frequency text not null default 'weekly' check (frequency in ('daily','weekly','monthly')),
  auto_audits boolean not null default true,
  auto_recommendations boolean not null default true,
  ai_content_suggestions boolean not null default true,
  metadata_optimization boolean not null default false,
  automatic_publishing boolean not null default false,
  keyword_monitoring boolean not null default true,
  weekly_reports boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ── monitoring_results ──────────────────────────────────────────────────
create table monitoring_results (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  previous_score int,
  new_score int,
  summary text,
  created_at timestamptz not null default now()
);

create index idx_monitoring_results_website on monitoring_results(website_id);

-- ── notifications ───────────────────────────────────────────────────────
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  website_id uuid references websites(id) on delete cascade,
  type text not null check (type in ('audit_completed','issue_detected','score_changed','keyword_opportunity','content_generated','optimization_completed','integration_error')),
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_owner on notifications(owner_id, read);

-- ── reports ─────────────────────────────────────────────────────────────
create table reports (
  id uuid primary key default uuid_generate_v4(),
  website_id uuid not null references websites(id) on delete cascade,
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  summary jsonb,
  file_url text,
  created_at timestamptz not null default now()
);

create index idx_reports_website on reports(website_id);

-- ── subscriptions ───────────────────────────────────────────────────────
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null unique references profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','professional','agency')),
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  renewal_date timestamptz,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── usage_records ───────────────────────────────────────────────────────
create table usage_records (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  period_start date not null,
  monthly_audits int not null default 0,
  ai_words int not null default 0,
  tracked_keywords int not null default 0,
  unique (owner_id, period_start)
);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_websites_updated_at before update on websites
  for each row execute function set_updated_at();
create trigger trg_content_projects_updated_at before update on content_projects
  for each row execute function set_updated_at();
create trigger trg_content_documents_updated_at before update on content_documents
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- ============================================================================
-- Auto-create a profile row when a new auth user signs up
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- Row Level Security
-- Every table below is scoped to the requesting user via auth.uid().
-- Ownership for tables without a direct owner_id is resolved by joining
-- up to `websites.owner_id` or `content_projects.owner_id`.
-- ============================================================================

alter table profiles enable row level security;
alter table websites enable row level security;
alter table website_pages enable row level security;
alter table seo_audits enable row level security;
alter table seo_issues enable row level security;
alter table seo_recommendations enable row level security;
alter table keywords enable row level security;
alter table keyword_rankings enable row level security;
alter table content_projects enable row level security;
alter table content_documents enable row level security;
alter table content_generations enable row level security;
alter table website_integrations enable row level security;
alter table monitoring_settings enable row level security;
alter table monitoring_results enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;

-- profiles: a user can only see/edit their own profile.
create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- websites: owned directly by owner_id.
create policy "websites_owner" on websites
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- website_pages: scoped through the parent website.
create policy "website_pages_owner" on website_pages
  for all using (
    exists (select 1 from websites w where w.id = website_pages.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = website_pages.website_id and w.owner_id = auth.uid())
  );

create policy "seo_audits_owner" on seo_audits
  for all using (
    exists (select 1 from websites w where w.id = seo_audits.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = seo_audits.website_id and w.owner_id = auth.uid())
  );

create policy "seo_issues_owner" on seo_issues
  for all using (
    exists (select 1 from websites w where w.id = seo_issues.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = seo_issues.website_id and w.owner_id = auth.uid())
  );

create policy "seo_recommendations_owner" on seo_recommendations
  for all using (
    exists (select 1 from websites w where w.id = seo_recommendations.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = seo_recommendations.website_id and w.owner_id = auth.uid())
  );

create policy "keywords_owner" on keywords
  for all using (
    exists (select 1 from websites w where w.id = keywords.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = keywords.website_id and w.owner_id = auth.uid())
  );

create policy "keyword_rankings_owner" on keyword_rankings
  for all using (
    exists (
      select 1 from keywords k
      join websites w on w.id = k.website_id
      where k.id = keyword_rankings.keyword_id and w.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from keywords k
      join websites w on w.id = k.website_id
      where k.id = keyword_rankings.keyword_id and w.owner_id = auth.uid()
    )
  );

create policy "content_projects_owner" on content_projects
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "content_documents_owner" on content_documents
  for all using (
    exists (select 1 from content_projects p where p.id = content_documents.project_id and p.owner_id = auth.uid())
  ) with check (
    exists (select 1 from content_projects p where p.id = content_documents.project_id and p.owner_id = auth.uid())
  );

create policy "content_generations_owner" on content_generations
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "website_integrations_owner" on website_integrations
  for all using (
    exists (select 1 from websites w where w.id = website_integrations.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = website_integrations.website_id and w.owner_id = auth.uid())
  );

create policy "monitoring_settings_owner" on monitoring_settings
  for all using (
    exists (select 1 from websites w where w.id = monitoring_settings.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = monitoring_settings.website_id and w.owner_id = auth.uid())
  );

create policy "monitoring_results_owner" on monitoring_results
  for all using (
    exists (select 1 from websites w where w.id = monitoring_results.website_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from websites w where w.id = monitoring_results.website_id and w.owner_id = auth.uid())
  );

create policy "notifications_owner" on notifications
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "reports_owner" on reports
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "subscriptions_owner" on subscriptions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "usage_records_owner" on usage_records
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Note: all policies above use `for all`, which covers select/insert/update/
-- delete under one rule. If you later add an admin role, do NOT loosen these —
-- add a separate service-role-only path (src/lib/supabase/admin.js) instead.
