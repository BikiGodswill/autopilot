import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import {
  listContentProjects,
  createContentProject,
  createContentDocument,
} from "@/services/content/contentProjectService";
import { validateRequiredString, apiSuccess, apiError } from "@/lib/validation/schemas";

export async function GET(request) {
  const { supabase, errorResponse } = await requireUser();
  if (errorResponse) return errorResponse;

  const websiteId = request.nextUrl.searchParams.get("websiteId");
  if (!websiteId) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "websiteId query param is required."), { status: 400 });
  }

  const { data, error } = await listContentProjects(supabase, websiteId);
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

  const websiteCheck = validateRequiredString(body?.websiteId, "websiteId");
  if (!websiteCheck.valid) {
    return NextResponse.json(apiError("VALIDATION_ERROR", websiteCheck.reason), { status: 400 });
  }
  if (!body?.generated) {
    return NextResponse.json(apiError("VALIDATION_ERROR", "generated content is required."), { status: 400 });
  }

  const { data: project, error: projectError } = await createContentProject(supabase, {
    websiteId: body.websiteId,
    ownerId: user.id,
    name: body.generated.h1 || "Untitled draft",
    contentType: body.generated.contentType || "blog_post",
  });
  if (projectError) return NextResponse.json(apiError("DB_ERROR", projectError.message), { status: 500 });

  const { data: doc, error: docError } = await createContentDocument(supabase, {
    projectId: project.id,
    generated: body.generated,
  });
  if (docError) return NextResponse.json(apiError("DB_ERROR", docError.message), { status: 500 });

  return NextResponse.json(apiSuccess({ project, document: doc }), { status: 201 });
}
