import { NextResponse } from "next/server";
import { validateWebsiteUrl } from "@/lib/validation/schemas";
import { validateCrawlableUrl } from "@/lib/security/urlValidation";
import { runMockAudit } from "@/services/seo/mockCrawler";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

/**
 * Unauthenticated demo analyzer used by the marketing hero. Returns
 * clearly-labeled demo data (services/seo/mockCrawler.js) — no crawling
 * happens yet. Kept separate from /api/websites/[id]/audit, which is
 * the authenticated, per-website production audit endpoint (Phase 7).
 */
export async function POST(request) {
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
