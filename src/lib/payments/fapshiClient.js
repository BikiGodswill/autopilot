import "server-only";

export class FapshiError extends Error {}

function getBaseUrl() {
  const env = process.env.FAPSHI_ENV || "sandbox";
  return env === "live" ? "https://live.fapshi.com" : "https://sandbox.fapshi.com";
}

function getAuthHeaders() {
  const apiUser = process.env.FAPSHI_API_USER;
  const apiKey = process.env.FAPSHI_API_KEY;
  if (!apiUser || !apiKey) {
    throw new FapshiError("FAPSHI_API_USER / FAPSHI_API_KEY are not configured.");
  }
  return { apiuser: apiUser, apikey: apiKey, "Content-Type": "application/json" };
}

async function fapshiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new FapshiError(`Fapshi returned a non-JSON response (HTTP ${res.status}).`);
  }

  if (!res.ok) {
    throw new FapshiError(json?.message || `Fapshi request failed (HTTP ${res.status}).`);
  }

  return json;
}

/**
 * Creates a Fapshi-hosted checkout link (the "Initiate Pay" flow).
 * Chosen over "Direct Pay" deliberately: Direct Pay collects the
 * customer's phone number directly in our own UI and pushes a charge
 * to it, which shifts more input-validation and fraud responsibility
 * onto us. Initiate Pay hands the actual payment form (MTN MoMo /
 * Orange Money selection, phone entry, OTP confirmation) to Fapshi's
 * own hosted page — simpler and safer for a subscription checkout.
 *
 * amount must be an integer XAF value, minimum 100.
 */
export async function initiatePay({ amount, email, redirectUrl, userId, externalId, message }) {
  if (!Number.isInteger(amount) || amount < 100) {
    throw new FapshiError("Amount must be an integer of at least 100 XAF.");
  }
  return fapshiRequest("/initiate-pay", {
    method: "POST",
    body: { amount, email, redirectUrl, userId, externalId, message },
  });
}

/** Returns the current status of a transaction: CREATED | SUCCESSFUL | FAILED | EXPIRED. */
export async function getPaymentStatus(transId) {
  return fapshiRequest(`/payment-status/${encodeURIComponent(transId)}`);
}

export async function expirePay(transId) {
  return fapshiRequest("/expire-pay", { method: "POST", body: { transId } });
}
