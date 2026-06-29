/**
 * Bureau referral cookie — staging `?ref=` until server-side attribution at signup.
 */

export const REFERRAL_COOKIE_NAME = "ir_bureau_ref";

/** 30 days in seconds */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Normalize and sanitize referral code from URL/cookie.
 * Returns null if empty or unusable after sanitization.
 */
export function sanitizeReferralCode(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase().slice(0, 32);
  const cleaned = trimmed.replace(/[^A-Z0-9-]/g, "");
  if (!cleaned || cleaned.length < 3) {
    return null;
  }
  return cleaned;
}

export function getReferralCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
  };
}

export function getReferralCookieClearOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
