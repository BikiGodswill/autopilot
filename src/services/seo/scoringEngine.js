import "server-only";
import { SCORE_WEIGHTS } from "@/constants";

/**
 * Each rule reads the crawl signals and, when it fires, returns a
 * deduction + an issue + a concrete suggested fix. Centralizing rules
 * here (rather than scattering `if` statements through the crawler)
 * keeps the scoring logic testable and matches spec §13's "reusable
 * scoring rules, not hardcoded score". The suggestedFix text is what
 * seeds seo_recommendations (see auditService.js) — every issue this
 * engine finds becomes an actionable recommendation, not just a flag.
 */
const RULES = {
  technical: [
    (s) => !s.isHttps && deduct(30, "critical", "Site is not served over HTTPS", "Browsers flag HTTP sites as insecure, and HTTPS is a confirmed ranking signal.", "Install an SSL certificate and redirect all HTTP traffic to HTTPS.", "medium"),
    (s) => s.statusCode !== 200 && deduct(35, "critical", `Homepage returned HTTP ${s.statusCode}`, "Search engines may deindex pages that don't return a 200 status.", "Check your server/hosting config — the homepage should return a 200 status, not a redirect chain or error.", "medium"),
    (s) => !s.hasCanonical && deduct(10, "medium", "Missing canonical tag", "Risk of duplicate-content dilution across URL variants.", "Add <link rel=\"canonical\" href=\"...\"> pointing to the preferred URL for this page.", "low"),
    (s) => !s.robotsTxtExists && deduct(10, "medium", "No robots.txt found", "Search engines use robots.txt to understand what they can crawl.", "Create a robots.txt file at your site root allowing crawlers and linking to your sitemap.", "low"),
    (s) => !s.sitemapExists && deduct(10, "medium", "No XML sitemap found at /sitemap.xml", "Sitemaps help search engines discover and prioritize your pages.", "Generate an XML sitemap listing your pages and submit it in robots.txt and Google Search Console.", "low"),
    (s) => s.isNoindex && deduct(50, "critical", "Homepage has a noindex directive", "This page is explicitly telling search engines not to index it.", "Remove the noindex directive from the homepage's meta robots tag unless this is intentional.", "low"),
  ],
  onPage: [
    (s) => !s.title && deduct(30, "critical", "Missing page title", "The title tag is one of the strongest on-page ranking signals.", "Add a unique, descriptive <title> tag that includes your primary target keyword.", "low"),
    (s) => s.title && (s.titleLength < 30 || s.titleLength > 65) && deduct(10, "medium", "Title length isn't optimal", "Titles outside ~30–65 characters risk being truncated or under-descriptive in search results.", "Rewrite the title to roughly 30–65 characters while keeping it natural and keyword-relevant.", "low"),
    (s) => !s.metaDescription && deduct(20, "high", "Missing meta description", "Search engines will auto-generate a snippet, which typically converts worse.", "Write a compelling meta description (120–160 characters) that includes your target keyword.", "low"),
    (s) => s.metaDescription && (s.metaDescriptionLength < 70 || s.metaDescriptionLength > 160) && deduct(8, "low", "Meta description length isn't optimal", "Aim for roughly 70–160 characters so it isn't truncated.", "Trim or expand the meta description to land in the 70–160 character range.", "low"),
    (s) => s.h1Count === 0 && deduct(20, "high", "Missing H1 heading", "The H1 helps both users and search engines understand the page's main topic.", "Add a single H1 that clearly states the page's main topic.", "low"),
    (s) => s.h1Count > 1 && deduct(8, "medium", "Multiple H1 headings found", "Multiple H1s can dilute topical clarity — use one per page.", "Change all but one H1 to H2/H3 so there's a single clear page heading.", "low"),
  ],
  content: [
    (s) => s.wordCount < 300 && deduct(25, "medium", "Thin content", "Pages under ~300 words tend to rank for fewer queries.", "Expand the page with genuinely useful content — aim for 300+ words covering the topic thoroughly.", "high"),
    (s) => s.h2Count === 0 && deduct(12, "low", "No subheadings (H2) found", "Subheadings improve both readability and topical structure.", "Break the content into sections with descriptive H2 subheadings.", "medium"),
    (s) => !s.hasStructuredData && deduct(8, "low", "No structured data (JSON-LD) found", "Structured data can unlock rich results in search.", "Add JSON-LD structured data appropriate to this page type (Article, Product, LocalBusiness, etc).", "medium"),
  ],
  performance: [
    (s) => s.responseTimeMs > 2500 && deduct(25, "high", "Slow server response time", `The homepage took ${s.responseTimeMs}ms to respond — aim under ~800ms.`, "Investigate server/hosting performance — consider caching, a CDN, or a faster hosting plan.", "high"),
    (s) => s.responseTimeMs > 1200 && s.responseTimeMs <= 2500 && deduct(10, "medium", "Server response time could be faster", `Homepage responded in ${s.responseTimeMs}ms.`, "Look into caching or a CDN to bring response time under ~800ms.", "medium"),
    (s) => s.pageSizeBytes > 2_000_000 && deduct(15, "medium", "Large page weight", `The HTML response was ${(s.pageSizeBytes / 1_000_000).toFixed(1)}MB.`, "Reduce page weight — compress images, minify HTML/CSS/JS, and lazy-load below-the-fold content.", "medium"),
  ],
  mobile: [
    (s) => !s.hasViewport && deduct(35, "high", "Missing viewport meta tag", "Without a viewport tag, mobile browsers render a desktop layout scaled down.", 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the page head.', "low"),
  ],
  accessibility: [
    (s) => s.imagesTotal > 0 && s.imagesMissingAlt > 0 && deduct(
      Math.min(30, s.imagesMissingAlt * 5),
      s.imagesMissingAlt / Math.max(s.imagesTotal, 1) > 0.5 ? "high" : "medium",
      `${s.imagesMissingAlt} of ${s.imagesTotal} images missing alt text`,
      "Alt text is required for screen readers and helps image search visibility.",
      "Add descriptive alt attributes to every content image (decorative images can use alt=\"\").",
      "medium"
    ),
    (s) => !s.hasLang && deduct(10, "low", "Missing lang attribute on <html>", "Screen readers use this to select the correct pronunciation/voice.", 'Add lang="en" (or the appropriate language code) to the <html> tag.', "low"),
  ],
};

function deduct(points, severity, title, impact, suggestedFix, effort) {
  return { points, severity, title, impact, suggestedFix, effort };
}

export function scoreAudit(signals) {
  const categories = {};
  const issues = [];

  for (const [category, rules] of Object.entries(RULES)) {
    let score = 100;
    for (const rule of rules) {
      const hit = rule(signals);
      if (hit) {
        score -= hit.points;
        issues.push({
          id: `${category}-${issues.length}`,
          category,
          severity: hit.severity,
          title: hit.title,
          impact: hit.impact,
          suggestedFix: hit.suggestedFix,
          effort: hit.effort,
          status: "open",
        });
      }
    }
    categories[category] = Math.max(0, Math.min(100, score));
  }

  const overallScore = Math.round(
    Object.entries(categories).reduce((sum, [key, value]) => sum + value * SCORE_WEIGHTS[key], 0)
  );

  return {
    demo: false,
    generatedAt: new Date().toISOString(),
    overallScore,
    categories,
    issues,
    counts: {
      total: issues.length,
      high: issues.filter((i) => i.severity === "high" || i.severity === "critical").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
    },
  };
}
