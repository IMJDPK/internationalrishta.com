/**
 * Deterministic referral code generation with DB uniqueness checks.
 * Format: {NAME_PART}-{CITY_CODE} e.g. ROYAL-LHE
 * @see src/lib/bureau/validate-referral-code.ts
 */

import { createServiceClient } from "@/lib/supabase/service";

const CITY_CODES: Record<string, string> = {
  KARACHI: "KHI",
  LAHORE: "LHE",
  ISLAMABAD: "ISB",
  RAWALPINDI: "RWP",
  FAISALABAD: "FSD",
  MULTAN: "MUL",
  PESHAWAR: "PEW",
  QUETTA: "QTA",
  SIALKOT: "SKT",
  GUJRANWALA: "GJW",
  HYDERABAD: "HYD",
  BAHAWALPUR: "BWP",
  SARGODHA: "SGD",
  SUKKUR: "SKR",
  LARKANA: "LRK",
  MARDAN: "MRD",
};

export function namePartFromBureauName(name: string): string {
  const token =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, " ")
      .trim()
      .split(/\s+/)[0] ?? "BUREAU";
  return token.slice(0, 10) || "BUREAU";
}

export function cityCodeFromCity(city: string): string {
  const key = city.trim().toUpperCase();
  if (CITY_CODES[key]) {
    return CITY_CODES[key];
  }
  const alpha = key.replace(/[^A-Z]/g, "");
  return (alpha.slice(0, 3) || "XXX").padEnd(3, "X");
}

export function buildReferralCodeCandidate(
  city: string,
  name: string,
  attempt = 0
): string {
  const cityCode = cityCodeFromCity(city);
  const baseName = namePartFromBureauName(name);
  const namePart =
    attempt === 0 ? baseName : `${baseName.slice(0, 9)}${attempt}`;
  return `${namePart}-${cityCode}`;
}

async function isReferralCodeTaken(code: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("marriage_bureaus")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();

  if (error) {
    throw new Error(
      `[generate-referral-code] uniqueness check failed: ${error.message}`
    );
  }

  return Boolean(data?.id);
}

/**
 * Generate a referral code unique across marriage_bureaus.referral_code.
 * Retries with numeric suffix on the name segment when collisions occur.
 */
export async function generateUniqueReferralCode(
  city: string,
  name: string
): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = buildReferralCodeCandidate(city, name, attempt);
    const taken = await isReferralCodeTaken(candidate);
    if (!taken) {
      return candidate;
    }
  }

  throw new Error(
    "[generate-referral-code] exhausted attempts generating unique code"
  );
}
