/**
 * URL validation for any feature that fetches a user-supplied website
 * (the analyzer, the crawler, monitoring jobs). Blocks requests aimed
 * at internal infrastructure instead of the public web.
 *
 * This is intentionally conservative: reject on any doubt.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

// Cloud metadata endpoints (AWS/GCP/Azure/DigitalOcean all use this IP).
const BLOCKED_EXACT_IPS = new Set(["169.254.169.254"]);

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
  if (a === 0) return true; // 0.0.0.0/8

  return false;
}

function isPrivateIPv6(hostname) {
  const h = hostname.toLowerCase();
  return (
    h === "::1" ||
    h.startsWith("fc") ||
    h.startsWith("fd") || // unique local
    h.startsWith("fe80") // link-local
  );
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates a user-supplied website URL before it is ever handed to a
 * fetch/crawl job. Returns { valid: true, url: URL } or
 * { valid: false, reason: string }.
 *
 * Note: this checks the literal hostname/IP in the URL. DNS can still
 * resolve a "safe-looking" hostname to a private IP at request time
 * (DNS rebinding), so the actual crawler fetch must ALSO be made
 * through an egress path that re-validates the resolved IP or runs in
 * a network-isolated worker. This function is the first gate, not the
 * only one.
 */
export function validateCrawlableUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { valid: false, reason: "That doesn't look like a valid URL." };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { valid: false, reason: "Only http and https URLs are supported." };
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, reason: "That host can't be analyzed." };
  }

  if (BLOCKED_EXACT_IPS.has(hostname)) {
    return { valid: false, reason: "That host can't be analyzed." };
  }

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { valid: false, reason: "Private IP addresses can't be analyzed." };
    }
  }

  if (hostname.includes(":") && isPrivateIPv6(hostname)) {
    return { valid: false, reason: "Private IP addresses can't be analyzed." };
  }

  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { valid: false, reason: "That host can't be analyzed." };
  }

  if (url.port && !["80", "443", ""].includes(url.port)) {
    return { valid: false, reason: "Only standard web ports (80/443) are supported." };
  }

  return { valid: true, url };
}

/** Crawl-wide safety limits (section 36/37). */
export const CRAWL_LIMITS = {
  maxPages: 50,
  maxDepth: 3,
  maxResponseBytes: 5 * 1024 * 1024, // 5MB per page
  requestTimeoutMs: 10_000,
  respectRobotsTxt: true,
};
