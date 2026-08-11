import { runMockAudit } from "@/services/seo/mockCrawler";

/**
 * Runs an audit for a website and persists the result: a seo_audits row,
 * one seo_issues row per detected issue, and an updated websites.seo_score.
 *
 * Uses the mock crawler today (services/seo/mockCrawler.js). To go live,
 * swap the single `runMockAudit(url)` call below for a real crawler with
 * the same return shape — nothing else in this function needs to change.
 */
export async function runAudit(supabase, website) {
  const { data: audit, error: auditInsertError } = await supabase
    .from("seo_audits")
    .insert({ website_id: website.id, status: "running", started_at: new Date().toISOString() })
    .select()
    .single();

  if (auditInsertError) return { error: auditInsertError };

  const result = runMockAudit(website.url);

  const { error: auditUpdateError } = await supabase
    .from("seo_audits")
    .update({
      overall_score: result.overallScore,
      technical_score: result.categories.technical,
      on_page_score: result.categories.onPage,
      content_score: result.categories.content,
      performance_score: result.categories.performance,
      mobile_score: result.categories.mobile,
      accessibility_score: result.categories.accessibility,
      pages_crawled: 1,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", audit.id);

  if (auditUpdateError) return { error: auditUpdateError };

  if (result.issues.length > 0) {
    const { error: issuesError } = await supabase.from("seo_issues").insert(
      result.issues.map((issue) => ({
        audit_id: audit.id,
        website_id: website.id,
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: issue.impact,
        impact: issue.impact,
        status: "open",
      }))
    );
    if (issuesError) return { error: issuesError };
  }

  const { error: websiteUpdateError } = await supabase
    .from("websites")
    .update({ seo_score: result.overallScore, last_audit_at: new Date().toISOString() })
    .eq("id", website.id);

  if (websiteUpdateError) return { error: websiteUpdateError };

  return { data: { auditId: audit.id, ...result } };
}

export async function listAudits(supabase, websiteId) {
  return supabase
    .from("seo_audits")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

export async function listIssues(supabase, websiteId) {
  return supabase
    .from("seo_issues")
    .select("*")
    .eq("website_id", websiteId)
    .order("severity", { ascending: true })
    .order("created_at", { ascending: false });
}
