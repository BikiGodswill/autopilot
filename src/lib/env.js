const REQUIRED_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

let checked = false;

/**
 * Call this once from any server-side entry point that needs Supabase
 * (the client factories already do). Throws a clear, actionable error
 * the first time a required var is missing, instead of letting Supabase
 * fail deep in a query with a confusing message.
 *
 * Intentionally does NOT check SUPABASE_SERVICE_ROLE_KEY or AI_API_KEY —
 * both are optional in this app (admin client is unused until a cron/
 * admin feature needs it; AI falls back to the mock provider).
 *
 * Deliberately has no "server-only" import: it's called from
 * lib/supabase/client.js too, which runs in the browser. It only reads
 * NEXT_PUBLIC_* vars, which are safe (and already public) client-side.
 */
export function assertRequiredEnv() {
  if (checked) return;

  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill these in from your Supabase project settings."
    );
  }

  checked = true;
}
