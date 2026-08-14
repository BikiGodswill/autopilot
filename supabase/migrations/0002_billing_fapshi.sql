-- ============================================================================
-- SEO Autopilot — Fapshi (Mobile Money / Orange Money) billing
-- Run after 0001_init.sql.
-- ============================================================================

create table payment_transactions (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  trans_id text not null unique,          -- Fapshi's transId
  plan text not null check (plan in ('starter','professional','agency')),
  amount int not null,                     -- XAF, as sent to Fapshi
  currency text not null default 'XAF',
  status text not null default 'CREATED' check (status in ('CREATED', 'SUCCESSFUL', 'FAILED', 'EXPIRED')),
  medium text,                             -- 'mobile money' | 'orange money' (set once Fapshi reports it)
  external_id text,                        -- our own reconciliation id
  payment_link text,
  applied boolean not null default false,  -- true once a SUCCESSFUL status has upgraded the plan (idempotency guard)
  date_initiated timestamptz not null default now(),
  date_confirmed timestamptz,
  created_at timestamptz not null default now()
);

create index idx_payment_transactions_owner on payment_transactions(owner_id);
create index idx_payment_transactions_trans_id on payment_transactions(trans_id);

alter table payment_transactions enable row level security;

create policy "payment_transactions_owner" on payment_transactions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Note: the webhook route updates this table using the service-role
-- client (src/lib/supabase/admin.js), not the user-scoped client — the
-- request comes from Fapshi's server, not a logged-in browser session,
-- so there's no auth.uid() for RLS to check against. The owner_id on
-- each row is set at checkout time and never trusted from the webhook
-- payload itself (see services/billing/fapshiService.js).
