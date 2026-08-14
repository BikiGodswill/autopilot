import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { generateContent, InvalidAiResponseError } from "@/services/ai/aiService";
import { checkLimit, recordUsage } from "@/services/usage/usageService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";
import { PLANS } from "@/constants";

export async function POST(request) {
  const { supabase, user, errorResponse } = await requireUser();
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

  const requestedWords = Number(body.wordCount) > 0 ? Number(body.wordCount) : 1200;

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = PLANS[profile?.plan ?? "free"];

  const limitCheck = await checkLimit(supabase, user.id, plan, "ai_words", "aiWords", requestedWords);
  if (limitCheck.error) {
    return NextResponse.json(apiError("DB_ERROR", limitCheck.error.message), { status: 500 });
  }
  if (limitCheck.limitExceeded) {
    return NextResponse.json(apiError("LIMIT_REACHED", limitCheck.message), { status: 403 });
  }

  let result;
  try {
    result = await generateContent({
      targetKeyword: body.targetKeyword,
      secondaryKeywords: body.secondaryKeywords,
      contentType: body.contentType,
      searchIntent: body.searchIntent,
      audience: body.audience,
      country: body.country,
      language: body.language,
      tone: body.tone,
      wordCount: requestedWords,
    });
  } catch (err) {
    if (err instanceof InvalidAiResponseError) {
      return NextResponse.json(apiError("AI_INVALID_RESPONSE", "The AI response couldn't be validated. Try again."), { status: 502 });
    }
    return NextResponse.json(apiError("AI_ERROR", "Content generation failed. Try again."), { status: 502 });
  }

  // Meter actual generated length, not the request estimate — only
  // counts against quota once generation genuinely succeeded.
  const actualWords = result.introduction.trim().split(/\s+/).length + result.outline.join(" ").split(/\s+/).length;
  await recordUsage(supabase, user.id, "ai_words", actualWords);

  return NextResponse.json(apiSuccess(result));
}
