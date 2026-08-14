import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { confirmTransaction } from "@/services/billing/fapshiService";
import { FapshiError } from "@/lib/payments/fapshiClient";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request, { params }) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  // RLS on payment_transactions already scopes reads to the caller's
  // own rows, but we explicitly verify ownership before touching the
  // Fapshi API too — belt and braces, since this is money-related.
  const { data: existing, error: fetchError } = await supabase
    .from("payment_transactions")
    .select("owner_id")
    .eq("trans_id", params.transId)
    .maybeSingle();

  if (fetchError) return NextResponse.json(apiError("DB_ERROR", fetchError.message), { status: 500 });
  if (!existing || existing.owner_id !== user.id) {
    return NextResponse.json(apiError("NOT_FOUND", "Transaction not found."), { status: 404 });
  }

  try {
    const result = await confirmTransaction(supabase, params.transId);
    return NextResponse.json(apiSuccess(result));
  } catch (err) {
    if (err instanceof FapshiError) {
      return NextResponse.json(apiError("PAYMENT_ERROR", err.message), { status: 502 });
    }
    return NextResponse.json(apiError("DB_ERROR", err.message || "Status check failed."), { status: 500 });
  }
}
