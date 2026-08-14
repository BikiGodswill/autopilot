import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getProfile, updateProfile } from "@/services/profile/profileService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await getProfile(supabase, user.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}

export async function PATCH(request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const { data, error } = await updateProfile(supabase, user.id, body);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
