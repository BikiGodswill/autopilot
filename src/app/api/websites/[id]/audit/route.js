import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getWebsite } from "@/services/websites/websiteService";
import { runAudit } from "@/services/seo/auditService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data: website, error: fetchError } = await getWebsite(supabase, params.id);
  if (fetchError || !website) {
    return NextResponse.json(apiError("NOT_FOUND", "Website not found."), { status: 404 });
  }

  const { data, error } = await runAudit(supabase, website);
  if (error) return NextResponse.json(apiError("AUDIT_FAILED", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data), { status: 201 });
}
