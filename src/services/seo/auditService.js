import { runMockAudit } from "@/services/seo/mockCrawler";
import { crawlWebsite } from "@/services/seo/realCrawler";
import { scoreAudit } from "@/services/seo/scoringEngine";
import { SafeFetchError } from "@/lib/security/safeFetch";
import { createNotification } from "@/services/notifications/notificationService";

/**
 * Runs a real crawl + scoring pass. Falls back to demo data ONLY when
 * explicitly enabled via CRAWLER_MODE=demo (e.g. a sandboxed environment
 * with no outbound network) — production should never set that. This is
 * the one place that decides real vs. mock, per spec §38's "clean
 * abstraction" requirement; nothing else in the app needs to know which
 * mode is active.
 */
async function performCrawl(url) {
  if (process.env.CRAWLER_MODE === "demo") {
    return runMockAudit(url);
  }
  const signals = await crawlWebsite(url);
  return scoreAudit(signals);
}

/**
 * Runs an audit for a website and persists the result: a seo_audits row,
 * one seo_issues row per detected issue, and an updated websites.seo_score.
 *
 * On a crawl failure (site unreachable, blocked, timed out, or an unsafe
 * URL), the audit row is marked "failed" with the reason recorded rather
 * than silently substituting fake data — callers see a real error.
 */
export async function runAudit(supabase, website) {
  const { data: audit, error: auditInsertError } = await supabase
    .from("seo_audits")
    .insert({ website_id: website.id, status: "running", started_at: new Date().toISOString() })
    .select()
    .single();

  if (auditInsertError) return { error: auditInsertError };

  let result;
  try {
    result = await performCrawl(website.url);
  } catch (err) {
    const reason = err instanceof SafeFetchError ? err.message : "The crawl failed unexpectedly.";
    await supabase
      .from("seo_audits")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", audit.id);
    return { error: { message: reason } };
  }

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

  let issueRows = [];
  if (result.issues.length > 0) {
    const { data: insertedIssues, error: issuesError } = await supabase
      .from("seo_issues")
      .insert(
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
      )
      .select();
    if (issuesError) return { error: issuesError };
    issueRows = insertedIssues ?? [];
  }

  await generateRecommendations(supabase, website.id, result.issues, issueRows);

  const { error: websiteUpdateError } = await supabase
    .from("websites")
    .update({ seo_score: result.overallScore, last_audit_at: new Date().toISOString() })
    .eq("id", website.id);

  if (websiteUpdateError) return { error: websiteUpdateError };

  // Fire an "audit completed" notification (spec §23). Best-effort —
  // a failure here shouldn't fail the audit itself.
  await createNotification(supabase, {
    ownerId: website.owner_id,
    websiteId: website.id,
    type: "audit_completed",
    title: `SEO audit completed for ${website.name}`,
    body: `Score: ${result.overallScore}/100 · ${result.counts.total} issues found.`,
  });

  return { data: { auditId: audit.id, ...result } };
}

const SEVERITY_TO_IMPACT = { critical: "high", high: "high", medium: "medium", low: "low" };

/**
 * Turns freshly-detected issues into actionable seo_recommendations
 * rows. Deduped against existing *pending* recommendations for this
 * website by title, so re-running an audit that finds the same
 * unresolved issue doesn't spam duplicate rows — only genuinely new
 * findings (or ones the user previously dismissed/applied, which are
 * fair to re-surface if the underlying issue reappears) get inserted.
 */
async function generateRecommendations(supabase, websiteId, issues, issueRows) {
  if (issues.length === 0) return;

  const { data: existingPending } = await supabase
    .from("seo_recommendations")
    .select("title")
    .eq("website_id", websiteId)
    .eq("status", "pending");

  const existingTitles = new Set((existingPending ?? []).map((r) => r.title));

  const rows = issues
    .filter((issue) => issue.suggestedFix && !existingTitles.has(issue.title))
    .map((issue) => {
      const matchingIssueRow = issueRows.find((row) => row.title === issue.title);
      return {
        website_id: websiteId,
        issue_id: matchingIssueRow?.id ?? null,
        title: issue.title,
        description: issue.suggestedFix,
        category: issue.category,
        severity: issue.severity,
        impact: SEVERITY_TO_IMPACT[issue.severity] ?? "medium",
        effort: issue.effort ?? "medium",
        suggested_fix: issue.suggestedFix,
        status: "pending",
      };
    });

  if (rows.length > 0) {
    await supabase.from("seo_recommendations").insert(rows);
  }
}

export async function listAudits(supabase, websiteId) {
  return supabase
    .from("seo_audits")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
}

const SEVERITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };

export async function listIssues(supabase, websiteId) {
  // Postgres/PostgREST would sort the `severity` text column
  // alphabetically (critical, high, info, low, medium — putting
  // medium-severity issues dead last, after low and info). Fetch
  // newest-first within each severity, then re-sort by actual
  // severity weight in JS so critical issues always lead.
  const { data, error } = await supabase
    .from("seo_issues")
    .select("*")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });

  if (error) return { data, error };

  const sorted = [...data].sort(
    (a, b) => (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0)
  );
  return { data: sorted, error: null };
}
