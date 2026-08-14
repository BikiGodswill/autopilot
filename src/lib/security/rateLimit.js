import "server-only";

const buckets = new Map();

// Prevent unbounded memory growth from one-off IPs hammering once and
// never returning — sweep old entries periodically.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(windowMs) {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, timestamps] of buckets.entries()) {
    const recent = timestamps.filter((t) => now - t < windowMs);
    if (recent.length === 0) buckets.delete(key);
    else buckets.set(key, recent);
  }
}

/**
 * In-memory sliding-window rate limiter. Suitable for a single-instance
 * deployment. A multi-instance/serverless production deployment needs a
 * shared store instead (Upstash Redis, etc) — this function's signature
 * is designed so that swap only touches this file.
 */
export function rateLimit(key, { windowMs = 60_000, max = 20 } = {}) {
  sweep(windowMs);

  const now = Date.now();
  const bucket = buckets.get(key) ?? [];
  const recent = bucket.filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    const retryAfterMs = windowMs - (now - recent[0]);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true };
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
