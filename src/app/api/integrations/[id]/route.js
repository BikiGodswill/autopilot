import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { disconnectIntegration } from "@/services/integrations/integrationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function DELETE(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { error } = await disconnectIntegration(supabase, params.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess({ disconnected: true }));
}
