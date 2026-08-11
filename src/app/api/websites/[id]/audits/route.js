import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listAudits } from "@/services/seo/auditService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await listAudits(supabase, params.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
