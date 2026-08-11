import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * `import "server-only"` makes any accidental client-side import fail
 * the build instead of silently leaking the service-role key to the
 * browser bundle.
 *
 * Use ONLY for trusted server-side operations that must cross user
 * boundaries (cron/monitoring jobs, admin tooling, webhooks). Every
 * normal request should go through lib/supabase/server.js instead, so
 * RLS keeps doing its job.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Admin client is unavailable."
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
