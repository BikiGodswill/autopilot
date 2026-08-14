import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { markNotificationRead } from "@/services/notifications/notificationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function PATCH(request, { params }) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await markNotificationRead(supabase, params.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
