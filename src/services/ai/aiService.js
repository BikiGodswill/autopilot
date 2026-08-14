import "server-only";
import { generateMockContent, optimizeMockContent } from "./mockAiProvider";
import { completeWithAnthropic } from "@/lib/ai/anthropicClient";
import { buildContentGenerationPrompt, buildContentOptimizationPrompt } from "./prompts";
import { extractJson, validateGeneratedContent, validateOptimizationResult, InvalidAiResponseError } from "./validateAiResponse";

/**
 * Single entry point for every AI call in the app (spec §27). Routes and
 * services call THIS, never a provider SDK directly — so switching
 * providers later means editing this file (and lib/ai/<provider>Client.js)
 * only.
 *
 * Without AI_API_KEY set, every call routes to the mock provider and
 * results are marked `demo: true` — this keeps local/demo environments
 * working with zero configuration. With AI_API_KEY set, calls go to
 * Anthropic; a response that fails JSON validation throws rather than
 * silently substituting mock data, so a broken integration is visible
 * instead of quietly serving fake content as real.
 */
export async function generateContent(payload) {
  if (!process.env.AI_API_KEY) {
    return generateMockContent(payload);
  }

  const prompt = buildContentGenerationPrompt(payload);
  const raw = await completeWithAnthropic(prompt, { maxTokens: 2500 });
  const parsed = extractJson(raw);
  const validated = validateGeneratedContent(parsed);

  return { ...validated, demo: false, contentType: payload.contentType, targetWordCount: payload.wordCount };
}

export async function optimizeContent(payload) {
  if (!process.env.AI_API_KEY) {
    return optimizeMockContent(payload);
  }

  const prompt = buildContentOptimizationPrompt(payload);
  const raw = await completeWithAnthropic(prompt, { maxTokens: 1200 });
  const parsed = extractJson(raw);
  const validated = validateOptimizationResult(parsed);

  return { ...validated, demo: false };
}

export { InvalidAiResponseError };
