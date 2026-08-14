import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { markAllNotificationsRead } from "@/services/notifications/notificationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function POST() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { error } = await markAllNotificationsRead(supabase, user.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess({ read: true }));
}
