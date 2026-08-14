import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmTransaction } from "@/services/billing/fapshiService";

/**
 * Fapshi calls this server-to-server whenever a payment's status
 * changes to SUCCESSFUL, FAILED, or EXPIRED (configured on the Fapshi
 * dashboard, not in this codebase). There is no user session on this
 * request — it's authenticated entirely by the `x-wh-secret` header
 * matching FAPSHI_WEBHOOK_SECRET, which is why this uses the
 * service-role client instead of the cookie-based one.
 *
 * Fails CLOSED: if FAPSHI_WEBHOOK_SECRET isn't configured, every
 * webhook call is rejected rather than processed unverified. An
 * unverified webhook here would let anyone POST a fake "SUCCESSFUL"
 * payload and grant themselves a paid plan for free.
 */
export async function POST(request) {
  const configuredSecret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (!configuredSecret) {
    console.error("[fapshi webhook] FAPSHI_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ received: false }, { status: 503 });
  }

  const providedSecret = request.headers.get("x-wh-secret");
  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ received: false }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  if (!payload?.transId || !payload?.status) {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    await confirmTransaction(supabase, payload.transId, { trustedStatusPayload: payload });
  } catch (err) {
    // Log and still return 200 — Fapshi sends each webhook only once
    // (per their docs), so a 5xx here just loses the event with no
    // retry. The billing page's own status polling is the fallback
    // that catches anything a lost webhook would have applied.
    console.error("[fapshi webhook] processing failed:", err.message);
  }

  return NextResponse.json({ received: true });
}
