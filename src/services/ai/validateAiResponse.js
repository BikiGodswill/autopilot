import "server-only";

export class InvalidAiResponseError extends Error {}

/**
 * Extracts a JSON object from raw model text (tolerating stray
 * markdown fences a model might add despite instructions) and parses
 * it. Throws InvalidAiResponseError rather than returning null, so
 * callers can't accidentally treat a parse failure as "no result."
 */
export function extractJson(rawText) {
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : rawText;

  try {
    return JSON.parse(candidate.trim());
  } catch {
    throw new InvalidAiResponseError("AI response was not valid JSON.");
  }
}

/**
 * Validates the generated-content shape against the schema the prompt
 * asked for. Doesn't try to be exhaustive — just enough to catch a
 * malformed or incomplete response before it reaches the database or
 * the UI (spec §28: "Never blindly trust AI-generated JSON").
 */
export function validateGeneratedContent(obj) {
  const requiredStrings = ["seoTitle", "metaDescription", "suggestedUrl", "h1", "introduction"];
  for (const key of requiredStrings) {
    if (typeof obj[key] !== "string" || obj[key].trim().length === 0) {
      throw new InvalidAiResponseError(`AI response is missing "${key}".`);
    }
  }
  if (!Array.isArray(obj.outline) || obj.outline.length === 0) {
    throw new InvalidAiResponseError('AI response is missing a valid "outline" array.');
  }
  if (!Array.isArray(obj.faq)) {
    throw new InvalidAiResponseError('AI response is missing a valid "faq" array.');
  }
  return {
    seoTitle: obj.seoTitle,
    metaDescription: obj.metaDescription,
    suggestedUrl: obj.suggestedUrl,
    h1: obj.h1,
    introduction: obj.introduction,
    outline: obj.outline.filter((x) => typeof x === "string"),
    faq: obj.faq.filter((x) => x && typeof x.q === "string" && typeof x.a === "string"),
    internalLinkSuggestions: Array.isArray(obj.internalLinkSuggestions) ? obj.internalLinkSuggestions : [],
    externalLinkSuggestions: Array.isArray(obj.externalLinkSuggestions) ? obj.externalLinkSuggestions : [],
    schemaSuggestion: typeof obj.schemaSuggestion === "object" && obj.schemaSuggestion !== null ? obj.schemaSuggestion : {},
  };
}

export function validateOptimizationResult(obj) {
  if (typeof obj.currentScore !== "number" || obj.currentScore < 0 || obj.currentScore > 100) {
    throw new InvalidAiResponseError('AI response has an invalid "currentScore".');
  }
  if (!Array.isArray(obj.suggestions) || obj.suggestions.length === 0) {
    throw new InvalidAiResponseError('AI response is missing a valid "suggestions" array.');
  }
  const suggestions = obj.suggestions.filter(
    (s) => s && typeof s.action === "string" && typeof s.detail === "string"
  );
  if (suggestions.length === 0) {
    throw new InvalidAiResponseError("AI response's suggestions were malformed.");
  }
  return { currentScore: Math.round(obj.currentScore), suggestions };
}
