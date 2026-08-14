import "server-only";
import * as cheerio from "cheerio";
import { safeFetch, SafeFetchError } from "@/lib/security/safeFetch";

/**
 * Crawls a single page (the homepage) and returns the raw signals the
 * scoring engine needs. This is intentionally single-page for now —
 * multi-page crawling (spec §37's maxPages/maxDepth) is the natural
 * next extension: call this per discovered internal link, respecting
 * CRAWL_LIMITS.maxPages/maxDepth, and feed every page's signals into
 * the scoring engine together.
 *
 * Throws SafeFetchError (via safeFetch) if the site can't be reached
 * safely — callers should catch this and mark the audit failed rather
 * than silently falling back to fake data.
 */
export async function crawlWebsite(inputUrl) {
  const page = await safeFetch(inputUrl);
  const $ = cheerio.load(page.body);

  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const lang = $("html").attr("lang") || "";
  const metaRobots = $('meta[name="robots"]').attr("content") || "";

  const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
  const h2Count = $("h2").length;

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.length > 0 ? bodyText.split(" ").length : 0;

  const images = $("img");
  const imagesTotal = images.length;
  const imagesMissingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;

  let internalLinks = 0;
  let externalLinks = 0;
  let pageHost = "";
  try {
    pageHost = new URL(page.finalUrl).hostname;
  } catch {
    // finalUrl should always be a valid absolute URL from safeFetch; if not, link
    // classification below just falls through to "external" for every href.
  }

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const resolved = new URL(href, page.finalUrl);
      if (resolved.hostname === pageHost) internalLinks += 1;
      else externalLinks += 1;
    } catch {
      // Unparseable href — skip rather than miscount.
    }
  });

  const ogTagCount = $('meta[property^="og:"]').length;
  const twitterTagCount = $('meta[name^="twitter:"]').length;
  const jsonLdBlocks = $('script[type="application/ld+json"]').length;

  const origin = new URL(page.finalUrl).origin;
  const [robotsTxtExists, sitemapExists] = await Promise.all([
    checkResourceExists(`${origin}/robots.txt`),
    checkResourceExists(`${origin}/sitemap.xml`),
  ]);

  return {
    url: page.finalUrl,
    statusCode: page.status,
    isHttps: page.finalUrl.startsWith("https://"),
    responseTimeMs: page.responseTimeMs,
    pageSizeBytes: page.bytes,
    title,
    titleLength: title.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    hasCanonical: Boolean(canonical),
    hasViewport: Boolean(viewport),
    hasLang: Boolean(lang),
    isNoindex: /noindex/i.test(metaRobots),
    h1Count: h1s.length,
    h2Count,
    wordCount,
    imagesTotal,
    imagesMissingAlt,
    internalLinks,
    externalLinks,
    ogTagCount,
    twitterTagCount,
    hasStructuredData: jsonLdBlocks > 0,
    robotsTxtExists,
    sitemapExists,
  };
}

async function checkResourceExists(url) {
  try {
    const res = await safeFetch(url, { timeoutMs: 5000, maxBytes: 1024 * 50 });
    return res.status >= 200 && res.status < 400;
  } catch (err) {
    if (err instanceof SafeFetchError) return false;
    return false;
  }
}
