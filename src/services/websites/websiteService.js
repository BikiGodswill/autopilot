/**
 * All functions take an already-authenticated, RLS-scoped Supabase
 * client (from requireUser()) — never the admin client. RLS is what
 * actually enforces ownership; these just centralize the queries so
 * they aren't duplicated across route handlers (DRY, spec §3).
 */

export async function listWebsites(supabase, ownerId) {
  return supabase
    .from("websites")
    .select("id, name, url, description, industry, status, seo_score, last_audit_at, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
}

export async function createWebsite(supabase, ownerId, { name, url, description, industry, targetCountry, language }) {
  return supabase
    .from("websites")
    .insert({
      owner_id: ownerId,
      name,
      url,
      description: description ?? null,
      industry: industry ?? null,
      target_country: targetCountry ?? null,
      language: language ?? "en",
    })
    .select()
    .single();
}

export async function getWebsite(supabase, id) {
  return supabase.from("websites").select("*").eq("id", id).single();
}

export async function deleteWebsite(supabase, id) {
  return supabase.from("websites").delete().eq("id", id);
}

export async function countWebsitesForOwner(supabase, ownerId) {
  const { count, error } = await supabase
    .from("websites")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);
  return { count: count ?? 0, error };
}
