import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listKeywords, createKeyword } from "@/services/seo/keywordService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const websiteId = request.nextUrl.searchParams.get("websiteId");
  if (!websiteId) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "websiteId query param is required."), { status: 400 });
  }

  const { data, error } = await listKeywords(supabase, websiteId);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}

export async function POST(request) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const websiteCheck = validateRequiredString(body?.websiteId, "websiteId");
  if (!websiteCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", websiteCheck.reason), { status: 400 });
  }
  const keywordCheck = validateRequiredString(body?.keyword, "Keyword", { max: 200 });
  if (!keywordCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", keywordCheck.reason), { status: 400 });
  }

  const { data, error } = await createKeyword(supabase, {
    websiteId: body.websiteId,
    keyword: body.keyword,
    intent: body.intent,
    country: body.country,
    language: body.language,
    targetUrl: body.targetUrl,
  });

  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data), { status: 201 });
}
