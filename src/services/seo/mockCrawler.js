import { SCORE_WEIGHTS } from "@/constants";

/**
 * Deterministic demo crawler. Produces realistic-looking (but clearly
 * labeled `demo: true`) audit data from a URL, with no network calls.
 *
 * Swap-out point: services/seo/realCrawler.js should implement the same
 * shape — { url, categories, issues, generatedAt, demo } — so callers
 * (API routes, components) never need to change. See §38 of the spec.
 */

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const ISSUE_LIBRARY = [
  { category: "technical", severity: "high", title: "Missing XML sitemap", impact: "Search engines may miss pages when crawling your site.", suggestedFix: "Generate an XML sitemap and submit it in robots.txt and Google Search Console.", effort: "low" },
  { category: "technical", severity: "medium", title: "No canonical tag on 3 pages", impact: "Risk of duplicate-content dilution in search results.", suggestedFix: "Add canonical tags pointing each page to its preferred URL.", effort: "low" },
  { category: "onPage", severity: "high", title: "Homepage title doesn't target a clear keyword", impact: "Lower relevance signal for your primary search terms.", suggestedFix: "Rewrite the homepage title to include your primary target keyword naturally.", effort: "low" },
  { category: "onPage", severity: "medium", title: "2 pages missing meta descriptions", impact: "Search engines will auto-generate snippets, which convert worse.", suggestedFix: "Write unique meta descriptions (120–160 characters) for those pages.", effort: "low" },
  { category: "content", severity: "medium", title: "Average content length below competitors", impact: "Thinner pages tend to rank for fewer queries.", suggestedFix: "Expand thin pages with genuinely useful detail on the topic.", effort: "high" },
  { category: "performance", severity: "high", title: "Largest Contentful Paint above 2.5s", impact: "Slower pages hurt both rankings and conversion rate.", suggestedFix: "Optimize images and reduce render-blocking scripts to improve load time.", effort: "high" },
  { category: "mobile", severity: "low", title: "Tap targets under 44px on 1 page", impact: "Minor mobile usability friction.", suggestedFix: "Increase button/link tap target size to at least 44x44px on mobile.", effort: "low" },
  { category: "accessibility", severity: "medium", title: "4 images missing alt text", impact: "Reduces accessibility and image-search visibility.", suggestedFix: "Add descriptive alt attributes to all content images.", effort: "medium" },
];

export function runMockAudit(inputUrl) {
  const seed = hashString(inputUrl);
  const rand = seededRandom(seed);

  const categories = {
    technical: Math.round(60 + rand() * 38),
    onPage: Math.round(55 + rand() * 40),
    content: Math.round(50 + rand() * 42),
    performance: Math.round(55 + rand() * 40),
    mobile: Math.round(70 + rand() * 28),
    accessibility: Math.round(65 + rand() * 32),
  };

  const overallScore = Math.round(
    Object.entries(categories).reduce(
      (sum, [key, value]) => sum + value * SCORE_WEIGHTS[key],
      0
    )
  );

  const issueCount = 4 + Math.floor(rand() * 5);
  const issues = [...ISSUE_LIBRARY]
    .sort(() => rand() - 0.5)
    .slice(0, issueCount)
    .map((issue, i) => ({ id: `demo-issue-${i}`, status: "open", ...issue }));

  return {
    url: inputUrl,
    demo: true,
    generatedAt: new Date().toISOString(),
    overallScore,
    categories,
    issues,
    counts: {
      total: issues.length,
      high: issues.filter((i) => i.severity === "high").length,
      medium: issues.filter((i) => i.severity === "medium").length,
      low: issues.filter((i) => i.severity === "low").length,
    },
  };
}
