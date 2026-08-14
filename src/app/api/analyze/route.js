import { NextResponse } from "next/server";
import { validateWebsiteUrl } from "@/lib/validation/schemas";
import { validateCrawlableUrl } from "@/lib/security/urlValidation";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import { runMockAudit } from "@/services/seo/mockCrawler";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

/**
 * Unauthenticated demo analyzer used by the marketing hero. Returns
 * clearly-labeled demo data (services/seo/mockCrawler.js) — no crawling
 * happens yet. Kept separate from /api/websites/[id]/audit, which is
 * the authenticated, per-website production audit endpoint.
 *
 * Rate-limited by IP since this is the one endpoint in the app that
 * accepts requests from anyone, with no account or plan quota behind it.
 */
export async function POST(request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`analyze:${ip}`, { windowMs: 10 * 60 * 1000, max: 10 });
  if (!limit.allowed) {
    return NextResponse.json(
      apiError("RATE_LIMITED", "Too many analyses — try again in a few minutes."),
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const format = validateWebsiteUrl(body?.url);
  if (!format.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", format.reason), { status: 400 });
  }

  const safety = validateCrawlableUrl(format.url);
  if (!safety.valid) {
    return NextResponse.json(apiError("UNSAFE_URL", safety.reason), { status: 400 });
  }

  const audit = runMockAudit(safety.url.toString());
  return NextResponse.json(apiSuccess(audit));
}
