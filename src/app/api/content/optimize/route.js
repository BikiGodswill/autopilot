import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { optimizeContent, InvalidAiResponseError } from "@/services/ai/aiService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST(request) {
  const { errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const contentCheck = validateRequiredString(body?.existingContent, "Content", { max: 20000 });
  if (!contentCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", contentCheck.reason), { status: 400 });
  }

  let result;
  try {
    result = await optimizeContent({
      existingContent: body.existingContent,
      targetKeyword: body.targetKeyword,
    });
  } catch (err) {
    if (err instanceof InvalidAiResponseError) {
      return NextResponse.json(apiError("AI_INVALID_RESPONSE", "The AI response couldn't be validated. Try again."), { status: 502 });
    }
    return NextResponse.json(apiError("AI_ERROR", "Content optimization failed. Try again."), { status: 502 });
  }

  return NextResponse.json(apiSuccess(result));
}
