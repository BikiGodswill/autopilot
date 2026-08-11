import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getWebsite, deleteWebsite } from "@/services/websites/websiteService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await getWebsite(supabase, params.id);
  // RLS returns no row (not an error) for websites you don't own —
  // treat both "not found" and "not yours" as 404, never leak which.
  if (error || !data) {
    return NextResponse.json(apiError("NOT_FOUND", "Website not found."), { status: 404 });
  }

  return NextResponse.json(apiSuccess(data));
}

export async function DELETE(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { error } = await deleteWebsite(supabase, params.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess({ deleted: true }));
}
