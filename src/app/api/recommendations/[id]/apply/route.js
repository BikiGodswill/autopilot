import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { applyRecommendation } from "@/services/seo/recommendationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await applyRecommendation(supabase, params.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });
  if (!data) return NextResponse.json(apiError("NOT_FOUND", "Recommendation not found."), { status: 404 });

  return NextResponse.json(apiSuccess(data));
}
