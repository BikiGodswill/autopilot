import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createCheckoutSession } from "@/services/billing/fapshiService";
import { FapshiError } from "@/lib/payments/fapshiClient";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST(request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const planCheck = validateRequiredString(body?.planId, "planId");
  if (!planCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", planCheck.reason), { status: 400 });
  }

  try {
    const { link, transId } = await createCheckoutSession(supabase, user, body.planId);
    return NextResponse.json(apiSuccess({ link, transId }), { status: 201 });
  } catch (err) {
    if (err instanceof FapshiError) {
      return NextResponse.json(apiError("PAYMENT_ERROR", err.message), { status: 502 });
    }
    return NextResponse.json(apiError("DB_ERROR", err.message || "Checkout failed."), { status: 500 });
  }
}
