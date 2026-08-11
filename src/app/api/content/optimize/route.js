import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { optimizeContent } from "@/services/ai/aiService";
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

  const result = await optimizeContent({
    existingContent: body.existingContent,
    targetKeyword: body.targetKeyword,
  });

  return NextResponse.json(apiSuccess(result));
}
