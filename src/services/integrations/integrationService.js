export async function listIntegrations(supabase, websiteId) {
  return supabase
    .from("website_integrations")
    .select("*")
    .eq("website_id", websiteId)
    .order("connected_at", { ascending: false });
}

/**
 * Records a connection. Real OAuth handshakes (GitHub App install,
 * WordPress REST API key exchange) are external-credential-gated —
 * this stores the resulting account reference once that flow exists.
 * For "manual", there's no external account: it just marks the
 * website as using copy-paste fixes.
 */
export async function connectIntegration(supabase, { websiteId, provider, externalAccount }) {
  return supabase
    .from("website_integrations")
    .insert({
      website_id: websiteId,
      provider,
      external_account: externalAccount ?? null,
      status: "connected",
    })
    .select()
    .single();
}

export async function disconnectIntegration(supabase, id) {
  return supabase.from("website_integrations").update({ status: "disconnected" }).eq("id", id);
}
