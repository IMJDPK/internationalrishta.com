/**
 * Bureau commission accrual — service role only.
 * @see .specify/bureau-partners-directory/constitution.md §2.4
 * @see specs/002-phase-d-bureau-partners/spec.md US4
 */

import { createServiceClient } from "@/lib/supabase/service";
import type {
  AccrueCommissionInput,
  AccrueCommissionResult,
  CommissionType,
} from "@/types/bureau.types";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate payout from snapshotted bureau rules.
 * - percentage: subscription_amount × commission_rate (rate is decimal, e.g. 0.20 = 20%)
 * - flat: commission_rate is fixed PKR per activation
 */
export function computeCommissionAmount(
  commissionType: CommissionType,
  commissionRate: number,
  subscriptionAmount: number
): number {
  if (commissionType === "percentage") {
    return roundMoney(subscriptionAmount * commissionRate);
  }
  return roundMoney(commissionRate);
}

/**
 * Idempotent commission accrual for a paid referral-tier subscription.
 * Relies on bureau_commissions.subscription_id UNIQUE for duplicate suppression.
 */
export async function accrueCommissionForSubscription(
  input: AccrueCommissionInput
): Promise<AccrueCommissionResult> {
  const { subscriptionId, userId, tier, subscriptionAmount } = input;

  if (tier !== "referral") {
    return { accrued: false, skippedReason: "direct_tier" };
  }

  const supabase = createServiceClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("referred_by_bureau_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `[accrue-commission] profile fetch failed: ${profileError.message}`
    );
  }

  const bureauId = profile?.referred_by_bureau_id;
  if (!bureauId) {
    return { accrued: false, skippedReason: "no_referral" };
  }

  const { data: bureau, error: bureauError } = await supabase
    .from("marriage_bureaus")
    .select("id, is_approved, commission_type, commission_rate")
    .eq("id", bureauId)
    .maybeSingle();

  if (bureauError) {
    throw new Error(
      `[accrue-commission] bureau fetch failed: ${bureauError.message}`
    );
  }

  if (!bureau) {
    return { accrued: false, skippedReason: "bureau_not_found" };
  }

  if (!bureau.is_approved) {
    console.error(
      `[accrue-commission] skip unapproved bureau ${bureauId} for user ${userId}`
    );
    return { accrued: false, skippedReason: "bureau_not_approved" };
  }

  const commissionType = bureau.commission_type as CommissionType;
  const commissionRate = Number(bureau.commission_rate);
  const commissionAmount = computeCommissionAmount(
    commissionType,
    commissionRate,
    subscriptionAmount
  );

  const { data: inserted, error: insertError } = await supabase
    .from("bureau_commissions")
    .insert({
      bureau_id: bureau.id,
      user_id: userId,
      subscription_id: subscriptionId,
      subscription_amount: subscriptionAmount,
      commission_type: commissionType,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: "accrued",
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      return { accrued: false, skippedReason: "duplicate" };
    }
    throw new Error(
      `[accrue-commission] insert failed: ${insertError.message}`
    );
  }

  if (!inserted?.id) {
    return { accrued: false, skippedReason: "duplicate" };
  }

  const { error: subscriptionUpdateError } = await supabase
    .from("subscriptions")
    .update({
      bureau_id: bureau.id,
      commission_amount: commissionAmount,
    })
    .eq("id", subscriptionId);

  if (subscriptionUpdateError) {
    throw new Error(
      `[accrue-commission] subscription mirror update failed: ${subscriptionUpdateError.message}`
    );
  }

  return {
    accrued: true,
    commissionId: inserted.id,
    commissionAmount,
  };
}

/** Alias for billing pipeline hooks */
export const accrueCommission = accrueCommissionForSubscription;
