import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listIntegrations, connectIntegration } from "@/services/integrations/integrationService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

const VALID_PROVIDERS = new Set(["github", "wordpress", "manual"]);

export async function GET(request) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const websiteId = request.nextUrl.searchParams.get("websiteId");
  if (!websiteId) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "websiteId query param is required."), { status: 400 });
  }

  const { data, error } = await listIntegrations(supabase, websiteId);
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
  if (!VALID_PROVIDERS.has(body?.provider)) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "provider must be github, wordpress, or manual."), { status: 400 });
  }

  const { data, error } = await connectIntegration(supabase, {
    websiteId: body.websiteId,
    provider: body.provider,
    externalAccount: body.externalAccount,
  });
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data), { status: 201 });
}
