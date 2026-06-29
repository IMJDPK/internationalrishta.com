/**
 * Server-side bureau referral attribution — service role profile write.
 * @see specs/002-phase-d-bureau-partners/contracts/referral-attribute-api.md
 */

import { normalizeReferralCode } from "@/lib/bureau/validate-referral-code";
import { createServiceClient } from "@/lib/supabase/service";
import type { ReferralAttributeResult } from "@/types/bureau.types";

export async function attributeReferralForUser(
  userId: string,
  referralCode: string
): Promise<ReferralAttributeResult> {
  const supabase = createServiceClient();
  const normalized = normalizeReferralCode(referralCode);

  if (!normalized) {
    return { attributed: false, reason: "invalid_code" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("referred_by_bureau_id, referral_code")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `[attribute-referral] profile fetch failed: ${profileError.message}`
    );
  }

  if (!profile) {
    return { attributed: false, reason: "invalid_code" };
  }

  if (profile.referred_by_bureau_id) {
    return { attributed: false, reason: "already_set" };
  }

  const { data: bureau, error: bureauError } = await supabase
    .from("marriage_bureaus")
    .select("id, referral_code, is_approved")
    .eq("referral_code", normalized)
    .eq("is_approved", true)
    .maybeSingle();

  if (bureauError) {
    throw new Error(
      `[attribute-referral] bureau lookup failed: ${bureauError.message}`
    );
  }

  if (!bureau) {
    return { attributed: false, reason: "invalid_code" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      referred_by_bureau_id: bureau.id,
      referral_code: bureau.referral_code,
    })
    .eq("id", userId)
    .is("referred_by_bureau_id", null);

  if (updateError) {
    throw new Error(
      `[attribute-referral] profile update failed: ${updateError.message}`
    );
  }

  return {
    attributed: true,
    bureauId: bureau.id,
    referralCode: bureau.referral_code,
  };
}
