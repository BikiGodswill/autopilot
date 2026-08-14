import "server-only";

/**
 * Every prompt sent to an AI provider lives here, versioned. Bump the
 * version suffix when you change a prompt's behavior meaningfully —
 * it's cheap insurance for debugging "why did output quality change."
 */

export const CONTENT_GENERATION_PROMPT_VERSION = "content-gen-v1";
export const CONTENT_OPTIMIZATION_PROMPT_VERSION = "content-opt-v1";

const JSON_ONLY_INSTRUCTION =
  "Respond with ONLY valid JSON. No markdown code fences, no commentary before or after the JSON object.";

export function buildContentGenerationPrompt({
  targetKeyword,
  secondaryKeywords,
  contentType = "blog_post",
  searchIntent = "commercial",
  audience,
  country,
  language = "English",
  tone = "professional",
  wordCount = 1200,
}) {
  return `You are an SEO content strategist writing for a real business website. ${JSON_ONLY_INSTRUCTION}

Produce a JSON object with exactly these keys:
{
  "seoTitle": string (under 60 characters, includes the target keyword naturally),
  "metaDescription": string (120-160 characters, compelling, includes the target keyword),
  "suggestedUrl": string (a URL slug, lowercase, hyphenated),
  "h1": string,
  "introduction": string (2-3 paragraphs, hooks the reader, states what they'll learn),
  "outline": string[] (5-8 section headings for the rest of the article),
  "faq": [{ "q": string, "a": string }] (2-4 relevant questions),
  "internalLinkSuggestions": string[] (2-3 generic internal link ideas, e.g. "link to your pricing page"),
  "externalLinkSuggestions": string[] (0-2 ideas for authoritative external sources to cite),
  "schemaSuggestion": object (a minimal JSON-LD object appropriate for this content type)
}

Target keyword: ${targetKeyword}
${secondaryKeywords ? `Secondary keywords: ${secondaryKeywords}` : ""}
Content type: ${contentType}
Search intent: ${searchIntent}
${audience ? `Audience: ${audience}` : ""}
${country ? `Target country: ${country}` : ""}
Language: ${language}
Tone: ${tone}
Target length for the full article (you are only writing the intro + outline here): ${wordCount} words

Rules:
- Write naturally. Never keyword-stuff.
- Never fabricate statistics, studies, or specific claims you cannot support.
- Never state or imply guaranteed search rankings.
- Keep the introduction genuinely useful on its own, not just a teaser.`;
}

export function buildContentOptimizationPrompt({ existingContent, targetKeyword }) {
  const trimmed = existingContent.length > 8000 ? `${existingContent.slice(0, 8000)}...` : existingContent;

  return `You are an SEO editor reviewing existing page content. ${JSON_ONLY_INSTRUCTION}

Produce a JSON object with exactly these keys:
{
  "currentScore": number (0-100, your honest estimate of this content's on-page SEO quality),
  "suggestions": [{ "action": string (short imperative, e.g. "Improve H1"), "detail": string (one sentence, specific to THIS content) }]
  (3-6 suggestions, ordered by impact, highest first)
}

${targetKeyword ? `Target keyword: ${targetKeyword}` : "No target keyword was specified — note that as a suggestion if relevant."}

Content to review:
"""
${trimmed}
"""

Rules:
- Base every suggestion on what's actually present or missing in the content above — don't give generic advice unrelated to it.
- Never fabricate a score you can't justify from the content shown.
- Never promise these changes will improve rankings by a specific amount.`;
}
