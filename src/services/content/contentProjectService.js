export async function listContentProjects(supabase, websiteId) {
  return supabase
    .from("content_projects")
    .select("id, name, content_type, status, created_at, content_documents(id, seo_title, word_count, seo_score)")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

export async function createContentProject(supabase, { websiteId, ownerId, name, contentType }) {
  return supabase
    .from("content_projects")
    .insert({ website_id: websiteId, owner_id: ownerId, name, content_type: contentType })
    .select()
    .single();
}

export async function createContentDocument(supabase, { projectId, generated }) {
  return supabase
    .from("content_documents")
    .insert({
      project_id: projectId,
      title: generated.h1,
      body: generated.introduction,
      seo_title: generated.seoTitle,
      meta_description: generated.metaDescription,
      target_keyword: generated.targetKeyword ?? null,
      word_count: generated.introduction?.split(/\s+/).length ?? 0,
    })
    .select()
    .single();
}
