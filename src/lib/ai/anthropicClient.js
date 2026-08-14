import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let cachedClient = null;

function getClient() {
  if (!process.env.AI_API_KEY) {
    throw new Error("AI_API_KEY is not set.");
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey: process.env.AI_API_KEY });
  }
  return cachedClient;
}

const DEFAULT_MODEL = process.env.AI_MODEL || "claude-sonnet-5";

/**
 * Sends a single-turn prompt and returns the raw text response.
 * Callers are responsible for parsing/validating the result — this
 * function makes no assumptions about output shape.
 */
export async function completeWithAnthropic(prompt, { maxTokens = 2000, temperature = 0.7 } = {}) {
  const client = getClient();

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) {
    throw new Error("AI provider returned no text content.");
  }
  return textBlock.text;
}
