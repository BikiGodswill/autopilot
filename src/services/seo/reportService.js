export async function listReports(supabase, websiteId) {
  return supabase
    .from("reports")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

/**
 * Builds a report from the most recent audit + open issues and stores
 * it as a JSON summary. PDF export (spec §22) is a later phase — the
 * `file_url` column is reserved for that once it exists.
 */
export async function createReport(supabase, ownerId, website) {
  const { data: latestAudit } = await supabase
    .from("seo_audits")
    .select("*")
    .eq("website_id", website.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: openIssues } = await supabase
    .from("seo_issues")
    .select("id, category, severity, title")
    .eq("website_id", website.id)
    .eq("status", "open");

  const summary = {
    website: { id: website.id, name: website.name, url: website.url },
    generatedAt: new Date().toISOString(),
    audit: latestAudit ?? null,
    openIssueCount: openIssues?.length ?? 0,
    issuesBySeverity: (openIssues ?? []).reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
      return acc;
    }, {}),
  };

  return supabase
    .from("reports")
    .insert({
      website_id: website.id,
      owner_id: ownerId,
      title: `SEO Report — ${website.name} — ${new Date().toLocaleDateString()}`,
      summary,
    })
    .select()
    .single();
}
