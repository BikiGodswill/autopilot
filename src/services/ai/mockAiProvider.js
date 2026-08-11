/**
 * Deterministic, dependency-free demo content generator. Produces a
 * structurally realistic result so the UI can be built and tested
 * before real AI credentials exist. Every response is marked
 * `demo: true` (spec §29/§38 — never present fabricated content as real).
 */

export function generateMockContent({ targetKeyword, contentType = "blog_post", tone = "professional", wordCount = 1000 }) {
  const keyword = (targetKeyword || "your topic").trim();
  const titleCase = keyword.replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    demo: true,
    seoTitle: `${titleCase}: A Complete Guide`,
    metaDescription: `Everything you need to know about ${keyword} — explained clearly, with practical next steps.`,
    suggestedUrl: `/blog/${keyword.toLowerCase().replace(/\s+/g, "-")}`,
    h1: titleCase,
    introduction: `[Demo content] This is a placeholder introduction for "${keyword}". Connect an AI provider (AI_API_KEY) to generate real, ${tone}-toned content here.`,
    outline: [
      `What is ${keyword}?`,
      `Why ${keyword} matters`,
      `How to get started with ${keyword}`,
      `Common mistakes to avoid`,
      `Frequently asked questions`,
    ],
    faq: [
      { q: `What is ${keyword}?`, a: "[Demo answer — replace with AI-generated content.]" },
      { q: `How much does ${keyword} cost?`, a: "[Demo answer — replace with AI-generated content.]" },
    ],
    internalLinkSuggestions: [],
    externalLinkSuggestions: [],
    schemaSuggestion: { "@type": "Article", headline: titleCase },
    contentType,
    targetWordCount: wordCount,
  };
}

export function optimizeMockContent({ existingContent = "" }) {
  const wordCount = existingContent.trim().split(/\s+/).filter(Boolean).length;

  return {
    demo: true,
    currentScore: Math.min(95, 45 + Math.floor(wordCount / 20)),
    suggestions: [
      { action: "Improve H1", detail: "Make sure the H1 contains your primary target keyword." },
      { action: "Add missing sections", detail: "Consider adding a FAQ section to capture long-tail queries." },
      { action: "Improve introduction", detail: "Lead with the reader's main question in the first two sentences." },
      { action: "Add internal links", detail: "Link to 2–3 related pages on your site." },
      { action: "Improve metadata", detail: "Write a meta description under 160 characters that includes the target keyword." },
    ],
  };
}
