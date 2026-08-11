import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { listWebsites, createWebsite, countWebsitesForOwner } from "@/services/websites/websiteService";
import { validateWebsiteUrl, validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";
import { validateCrawlableUrl } from "@/lib/security/urlValidation";
import { PLANS } from "@/constants";

export async function GET() {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const { data, error } = await listWebsites(supabase, user.id);
  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data));
}

export async function POST(request) {
  const { supabase, user, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(apiError("INVALID_BODY", "Request body must be JSON."), { status: 400 });
  }

  const nameCheck = validateRequiredString(body?.name, "Website name", { max: 200 });
  if (!nameCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", nameCheck.reason), { status: 400 });
  }

  const urlFormat = validateWebsiteUrl(body?.url);
  if (!urlFormat.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", urlFormat.reason), { status: 400 });
  }

  const urlSafety = validateCrawlableUrl(urlFormat.url);
  if (!urlSafety.valid) {
    return NextResponse.json(apiError("UNSAFE_URL", urlSafety.reason), { status: 400 });
  }

  // Enforce plan website limits (spec §31).
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = PLANS[profile?.plan ?? "free"];
  const { count, error: countError } = await countWebsitesForOwner(supabase, user.id);
  if (countError) {
    return NextResponse.json(apiError("DB_ERROR", countError.message), { status: 500 });
  }
  if (count >= plan.limits.websites) {
    return NextResponse.json(
      apiError("LIMIT_REACHED", `Your ${plan.name} plan supports up to ${plan.limits.websites} website(s). Upgrade to add more.`),
      { status: 403 }
    );
  }

  const { data, error } = await createWebsite(supabase, user.id, {
    name: body.name,
    url: urlFormat.url,
    description: body.description,
    industry: body.industry,
    targetCountry: body.targetCountry,
    language: body.language,
  });

  if (error) return NextResponse.json(apiError("DB_ERROR", error.message), { status: 500 });

  return NextResponse.json(apiSuccess(data), { status: 201 });
}
