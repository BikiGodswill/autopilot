import "server-only";
import { generateMockContent, optimizeMockContent } from "./mockAiProvider";

/**
 * Single entry point for every AI call in the app (spec §27). Routes and
 * services call THIS, never a provider SDK directly — so switching
 * providers later means editing this file only.
 *
 * Today: no AI_API_KEY is configured, so every call routes to the mock
 * provider and results are marked `demo: true`. Once AI_API_KEY is set,
 * branch here to a real provider client (kept out of this scaffold since
 * no credentials are available yet).
 */
export async function generateContent(payload) {
  if (!process.env.AI_API_KEY) {
    return generateMockContent(payload);
  }
  // TODO: call the configured provider (process.env.AI_API_PROVIDER)
  // and return the same shape as generateMockContent.
  return generateMockContent(payload);
}

export async function optimizeContent(payload) {
  if (!process.env.AI_API_KEY) {
    return optimizeMockContent(payload);
  }
  // TODO: call the configured provider.
  return optimizeMockContent(payload);
}
