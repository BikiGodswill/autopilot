export async function listRecommendations(supabase, websiteId) {
  return supabase
    .from("seo_recommendations")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

export async function applyRecommendation(supabase, id) {
  return supabase
    .from("seo_recommendations")
    .update({ status: "applied", applied_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}
