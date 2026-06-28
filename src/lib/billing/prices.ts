/**
 * Stripe Price ID configuration — binds BillingPlanTier to environment variables.
 * Server-only: import from API routes and webhook handlers, not client components.
 *
 * @see src/types/billing.types.ts
 * @see .env.local.example
 */

import type { BillingPlanTier, SubscriptionTierDb } from "@/types/billing.types";
import { MANUAL_TIER_AMOUNTS_PKR } from "@/types/billing.types";

// ---------------------------------------------------------------------------
// Layout map — tier → env var → human label (verification / docs)
// ---------------------------------------------------------------------------

export interface BillingPlanConfig {
  tier: BillingPlanTier;
  envVar: string;
  label: string;
  billingInterval: "month" | "quarter";
}

export const BILLING_PLAN_LAYOUT: Record<BillingPlanTier, BillingPlanConfig> = {
  premium_monthly: {
    tier: "premium_monthly",
    envVar: "STRIPE_PRICE_PREMIUM_MONTHLY",
    label: "Premium Monthly",
    billingInterval: "month",
  },
  premium_quarterly: {
    tier: "premium_quarterly",
    envVar: "STRIPE_PRICE_PREMIUM_QUARTERLY",
    label: "Premium Quarterly",
    billingInterval: "quarter",
  },
};

const TIER_TO_ENV_VAR: Record<BillingPlanTier, string> = {
  premium_monthly: BILLING_PLAN_LAYOUT.premium_monthly.envVar,
  premium_quarterly: BILLING_PLAN_LAYOUT.premium_quarterly.envVar,
};

export const BILLING_PLAN_TIERS: readonly BillingPlanTier[] = [
  "premium_monthly",
  "premium_quarterly",
];

// ---------------------------------------------------------------------------
// Stripe core env keys (validated at runtime on first access)
// ---------------------------------------------------------------------------

export const STRIPE_ENV_KEYS = {
  secretKey: "STRIPE_SECRET_KEY",
  webhookSecret: "STRIPE_WEBHOOK_SECRET",
  publishableKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
} as const;

// ---------------------------------------------------------------------------
// Runtime safety — fail fast with architectural errors when env is missing
// ---------------------------------------------------------------------------

function requireEnv(name: string, context?: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    const where = context ? ` (${context})` : "";
    throw new Error(
      `[billing/prices] Missing required environment variable "${name}"${where}. ` +
        "Provision it in .env.local (see .env.local.example) before invoking Stripe billing."
    );
  }
  return value.trim();
}

export function requireStripeSecretKey(): string {
  return requireEnv(STRIPE_ENV_KEYS.secretKey, "Stripe SDK initialization");
}

export function requireStripeWebhookSecret(): string {
  return requireEnv(STRIPE_ENV_KEYS.webhookSecret, "webhook signature verification");
}

export function requireStripePublishableKey(): string {
  return requireEnv(STRIPE_ENV_KEYS.publishableKey, "client checkout bootstrap");
}

export function isBillingPlanTier(value: string): value is BillingPlanTier {
  return (BILLING_PLAN_TIERS as readonly string[]).includes(value);
}

/**
 * Resolve Stripe Price id for a checkout plan tier.
 * Throws if STRIPE_PRICE_PREMIUM_MONTHLY / STRIPE_PRICE_PREMIUM_QUARTERLY are unset.
 */
export function getStripePriceIdForPlan(tier: BillingPlanTier): string {
  const envVar = TIER_TO_ENV_VAR[tier];
  const priceId = requireEnv(envVar, `getStripePriceIdForPlan("${tier}")`);
  if (!priceId.startsWith("price_")) {
    throw new Error(
      `[billing/prices] Invalid Stripe Price id for "${tier}" from ${envVar}: ` +
        `expected value starting with "price_", got "${priceId}". ` +
        "Create a Price in Stripe Dashboard and paste the correct id into .env.local."
    );
  }
  return priceId;
}

/** Alias matching plan.md / checkout-api contract naming */
export function getPriceIdForTier(tier: BillingPlanTier): string {
  return getStripePriceIdForPlan(tier);
}

/**
 * Returns env var name for a tier (for logging without reading secret values).
 */
export function getEnvVarNameForPlan(tier: BillingPlanTier): string {
  return TIER_TO_ENV_VAR[tier];
}

/**
 * Validate all plan price env vars are set — call during server boot or route init.
 */
export function assertAllBillingPlanPricesConfigured(): void {
  for (const tier of BILLING_PLAN_TIERS) {
    getStripePriceIdForPlan(tier);
  }
}

/**
 * Build a read-only map of tier → price id for server diagnostics (never expose to client bundle).
 */
export function getBillingPlanPriceIdMap(): Record<BillingPlanTier, string> {
  return {
    premium_monthly: getStripePriceIdForPlan("premium_monthly"),
    premium_quarterly: getStripePriceIdForPlan("premium_quarterly"),
  };
}

/** Maps checkout plan to `profiles.subscription_tier` / `subscriptions.tier` */
export function mapBillingPlanToSubscriptionTier(
  plan: BillingPlanTier
): SubscriptionTierDb {
  return plan === "premium_monthly" ? "referral" : "direct";
}

/** PKR amount for plan (monthly → referral, quarterly → direct) */
export function getAmountForBillingPlan(plan: BillingPlanTier): number {
  const tier = mapBillingPlanToSubscriptionTier(plan);
  return MANUAL_TIER_AMOUNTS_PKR[tier];
}
