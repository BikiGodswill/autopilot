import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listNotifications } from "@/services/notifications/notificationService";
import { apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "1";
  const { data, error } = await listNotifications(supabase, user.id, { unreadOnly });
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}
