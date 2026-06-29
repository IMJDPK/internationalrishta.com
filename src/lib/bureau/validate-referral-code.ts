import { sanitizeReferralCode } from "@/lib/bureau/referral-cookie";

/** Matches generated codes like ROYAL-LHE */
const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{3,10}-[A-Z]{3}$/;

export function normalizeReferralCode(code: string): string {
  return sanitizeReferralCode(code) ?? code.trim().toUpperCase();
}

export function isValidReferralCodeFormat(code: string): boolean {
  const normalized = normalizeReferralCode(code);
  return REFERRAL_CODE_PATTERN.test(normalized);
}
