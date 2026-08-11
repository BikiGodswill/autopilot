import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/validation/schemas";

/**
 * Resolves the authenticated user for a Route Handler. Every private
 * API route calls this first — RLS is the enforcement layer, this is
 * just the early, cheap rejection so we don't run business logic for
 * anonymous requests.
 *
 * Returns { supabase, user } on success, or { errorResponse } to return
 * directly from the caller.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      errorResponse: NextResponse.json(
        apiError("UNAUTHORIZED", "You must be logged in."),
        { status: 401 }
      ),
    };
  }

  return { supabase, user };
}
