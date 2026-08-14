import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getWebsite } from "@/services/websites/websiteService";
import { runAudit } from "@/services/seo/auditService";
import { checkLimit, recordUsage } from "@/services/usage/usageService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";
import { PLANS } from "@/constants";

export async function POST(request, { params }) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data: website, error: fetchError } = await getWebsite(supabase, params.id);
  if (fetchError || !website) {
    return NextResponse.json(apiError("NOT_FOUND", "Website not found."), { status: 404 });
  }

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = PLANS[profile?.plan ?? "free"];

  const limitCheck = await checkLimit(supabase, user.id, plan, "monthly_audits", "monthlyAudits", 1);
  if (limitCheck.error) {
    return NextResponse.json(apiError("DB_ERROR", limitCheck.error.message), { status: 500 });
  }
  if (limitCheck.limitExceeded) {
    return NextResponse.json(apiError("LIMIT_REACHED", limitCheck.message), { status: 403 });
  }

  const { data, error } = await runAudit(supabase, website);
  if (error) return NextResponse.json(apiError("AUDIT_FAILED", error.message), { status: 500 });

  await recordUsage(supabase, user.id, "monthly_audits", 1);

  return NextResponse.json(apiSuccess(data), { status: 201 });
}
