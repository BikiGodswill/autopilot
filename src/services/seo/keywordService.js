export async function listKeywords(supabase, websiteId) {
  return supabase
    .from("keywords")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

export async function createKeyword(supabase, { websiteId, keyword, intent, country, language, targetUrl }) {
  return supabase
    .from("keywords")
    .insert({
      website_id: websiteId,
      keyword,
      intent: intent ?? null,
      country: country ?? null,
      language: language ?? "en",
      target_url: targetUrl ?? null,
      volume_is_estimated: true,
    })
    .select()
    .single();
}
