import "server-only";
import http from "node:http";
import https from "node:https";
import dns from "node:dns/promises";
import { validateCrawlableUrl, isPrivateIP, CRAWL_LIMITS } from "./urlValidation";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export class SafeFetchError extends Error {}

/**
 * Fetches a user-supplied URL for the real crawler (authenticated,
 * plan-limited callers only — see services/seo/realCrawler.js).
 *
 * Beyond validateCrawlableUrl's literal-hostname check, this:
 *  1. Resolves DNS itself and rejects any address that maps to a
 *     private/loopback/link-local/metadata range (closes the
 *     DNS-rebinding gap: a "safe" hostname can't resolve to something
 *     unsafe between validation and connection, because we pin the
 *     connection to the exact IP we just validated).
 *  2. Re-validates every redirect hop the same way, up to a hard cap.
 *  3. Enforces response size and timeout limits from CRAWL_LIMITS.
 */
export async function safeFetch(
  initialUrl,
  { timeoutMs = CRAWL_LIMITS.requestTimeoutMs, maxBytes = CRAWL_LIMITS.maxResponseBytes, maxRedirects = 3 } = {}
) {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const safety = validateCrawlableUrl(currentUrl);
    if (!safety.valid) throw new SafeFetchError(safety.reason);
    const url = safety.url;

    let addresses;
    try {
      addresses = await dns.lookup(url.hostname, { all: true });
    } catch {
      throw new SafeFetchError(`Couldn't resolve ${url.hostname}.`);
    }

    const safeAddress = addresses.find((a) => !isPrivateIP(a.address));
    if (!safeAddress) {
      throw new SafeFetchError("That host resolves to a private address and can't be analyzed.");
    }

    const result = await performRequest(url, safeAddress, timeoutMs, maxBytes);

    if (result.redirectTo) {
      currentUrl = new URL(result.redirectTo, url).toString();
      continue;
    }

    return result;
  }

  throw new SafeFetchError("Too many redirects.");
}

function performRequest(url, pinnedAddress, timeoutMs, maxBytes) {
  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === "https:";
    const lib = isHttps ? https : http;
    const startedAt = Date.now();

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: {
          "User-Agent": "SEOAutopilotBot/1.0 (+https://seoautopilot.example/bot)",
          Accept: "text/html,application/xhtml+xml",
        },
        // Pin DNS resolution to the address we already validated —
        // the actual TCP connection can't be redirected to a
        // different (unvalidated) IP by a second lookup.
        lookup: (_hostname, _options, callback) => callback(null, pinnedAddress.address, pinnedAddress.family),
        timeout: timeoutMs,
      },
      (res) => {
        if (REDIRECT_STATUSES.has(res.statusCode) && res.headers.location) {
          res.resume();
          resolve({ redirectTo: res.headers.location });
          return;
        }

        const chunks = [];
        let bytes = 0;

        res.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > maxBytes) {
            req.destroy();
            reject(new SafeFetchError("Response exceeded the size limit."));
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf-8"),
            finalUrl: url.toString(),
            responseTimeMs: Date.now() - startedAt,
            bytes,
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new SafeFetchError("The request timed out."));
    });
    req.on("error", (err) => reject(new SafeFetchError(err.message)));
    req.end();
  });
}
