import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("payment_transactions")
    .select("trans_id, plan, status, created_at")
    .eq("owner_id", user.id)
    .eq("status", "CREATED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
