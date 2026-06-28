/**
 * Client-safe plan metadata for pricing UI (no Stripe env access).
 */

import {
  BILLING_PLAN_LAYOUT,
  BILLING_PLAN_TIERS,
  getAmountForBillingPlan,
  mapBillingPlanToSubscriptionTier,
} from "@/lib/billing/prices";
import type { BillingPlanTier } from "@/types/billing.types";

export interface PricingPlanCardData {
  planTier: BillingPlanTier;
  label: string;
  billingInterval: "month" | "quarter";
  amountPkr: number;
  subscriptionTierDb: ReturnType<typeof mapBillingPlanToSubscriptionTier>;
  intervalKey: "perMonth" | "perQuarter";
}

export const PRICING_PLAN_CARDS: PricingPlanCardData[] = BILLING_PLAN_TIERS.map(
  (planTier) => {
    const layout = BILLING_PLAN_LAYOUT[planTier];
    return {
      planTier,
      label: layout.label,
      billingInterval: layout.billingInterval,
      amountPkr: getAmountForBillingPlan(planTier),
      subscriptionTierDb: mapBillingPlanToSubscriptionTier(planTier),
      intervalKey:
        layout.billingInterval === "month" ? "perMonth" : "perQuarter",
    };
  }
);

export function formatPkrAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}
