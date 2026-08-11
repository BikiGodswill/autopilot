/**
 * Lightweight, dependency-free validators. Kept centralized so every
 * API route and form uses the same rules (DRY — see spec §3).
 */

export function validateEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  if (typeof password !== "string") return { valid: false, reason: "Password is required." };
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters." };
  }
  return { valid: true };
}

export function validateWebsiteUrl(url) {
  if (typeof url !== "string" || url.trim().length === 0) {
    return { valid: false, reason: "A website URL is required." };
  }
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return { valid: true, url: parsed.toString() };
  } catch {
    return { valid: false, reason: "Enter a valid website URL." };
  }
}

export function validateRequiredString(value, fieldName, { max = 500 } = {}) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, reason: `${fieldName} is required.` };
  }
  if (value.length > max) {
    return { valid: false, reason: `${fieldName} must be under ${max} characters.` };
  }
  return { valid: true };
}

/** Wraps a route handler body in a consistent try/validate/respond shape. */
export function apiSuccess(data) {
  return { success: true, data, error: null };
}

export function apiError(code, message) {
  return { success: false, data: null, error: { code, message } };
}
