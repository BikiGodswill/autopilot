import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listRecommendations } from "@/services/seo/recommendationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const websiteId = request.nextUrl.searchParams.get("websiteId");
  if (!websiteId) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "websiteId query param is required."), { status: 400 });
  }

  const { data, error } = await listRecommendations(supabase, websiteId);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
