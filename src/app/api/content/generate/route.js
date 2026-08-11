import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { generateContent } from "@/services/ai/aiService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST(request) {
  const { user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const keywordCheck = validateRequiredString(body?.targetKeyword, "Target keyword", { max: 200 });
  if (!keywordCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", keywordCheck.reason), { status: 400 });
  }

  // TODO(Phase 8): meter this call against usage_records.ai_words for `user`
  // once real AI generation replaces the mock provider.
  const result = await generateContent({
    targetKeyword: body.targetKeyword,
    secondaryKeywords: body.secondaryKeywords,
    contentType: body.contentType,
    searchIntent: body.searchIntent,
    audience: body.audience,
    country: body.country,
    language: body.language,
    tone: body.tone,
    wordCount: body.wordCount,
  });

  return NextResponse.json(apiSuccess(result));
}
