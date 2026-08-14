import { createBrowserClient } from "@supabase/ssr";
import { assertRequiredEnv } from "@/lib/env";

/**
 * Supabase client for use in Client Components.
 * Uses only the public URL + anon key — safe to call from the browser.
 */
export function createClient() {
  assertRequiredEnv();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
