/**
 * Billing types aligned to hybrid billing migration and constitution.
 * @see supabase/migrations/20260629203000_monetization_hybrid.sql
 * @see .specify/monetization-stripe-hybrid/constitution.md
 */

// ---------------------------------------------------------------------------
// Domain enums (Postgres CHECK constraints + application layer)
// ---------------------------------------------------------------------------

/** `subscriptions.source_channel` */
export type SourceChannel = "stripe" | "manual";

/** `subscriptions.tier` and `profiles.subscription_tier` */
export type SubscriptionTierDb = "referral" | "direct";

/** Checkout plan identifiers bound to Stripe Price env vars in prices.ts */
export type BillingPlanTier = "premium_monthly" | "premium_quarterly";

/** `payment_notifications.status` */
export type PaymentNotificationStatus = "pending" | "verified" | "rejected";

/** `profiles.payment_status` */
export type ProfilePaymentStatus =
  | "pending"
  | "payment_sent"
  | "verified"
  | "failed";

/** `profiles.subscription_status` */
export type ProfileSubscriptionStatus = "active" | "cancelled" | "expired";

/** Manual proof upload MIME whitelist (matches Storage bucket) */
export type PaymentProofMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "application/pdf";

// ---------------------------------------------------------------------------
// PKR reference amounts (manual bank transfer path)
// ---------------------------------------------------------------------------

export const MANUAL_TIER_AMOUNTS_PKR: Record<SubscriptionTierDb, number> = {
  referral: 3999,
  direct: 4999,
};

export const PAYMENT_PROOF_MAX_BYTES = 10 * 1024 * 1024;

export const PAYMENT_PROOF_ALLOWED_MIME_TYPES: readonly PaymentProofMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

// ---------------------------------------------------------------------------
// Database row types (snake_case — mirrors Postgres columns)
// ---------------------------------------------------------------------------

/** `public.subscriptions` — base + hybrid billing columns */
export interface DbSubscriptionRow {
  id: string;
  user_id: string;
  tier: SubscriptionTierDb;
  amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  paid: boolean;
  paid_at: string | null;
  period_start: string;
  period_end: string;
  bureau_id: string | null;
  commission_amount: number | null;
  commission_paid: boolean;
  created_at: string;
  source_channel: SourceChannel | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  payment_notification_id: string | null;
  admin_approved_by: string | null;
}

/** `public.stripe_webhook_events` */
export interface DbStripeWebhookEventRow {
  id: string;
  type: string;
  created_at: string;
  processed_at: string;
}

/** `public.payment_notifications` */
export interface DbPaymentNotificationRow {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  payment_method: string;
  amount: number;
  transaction_id: string | null;
  screenshot_url: string | null;
  status: PaymentNotificationStatus;
  admin_notes: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
}

/** `profiles` billing-related columns used by checkout and paywall */
export interface DbProfileBillingRow {
  id: string;
  subscription_tier: SubscriptionTierDb;
  subscription_status: ProfileSubscriptionStatus;
  payment_status: ProfilePaymentStatus | null;
  account_active: boolean;
  payment_method: string | null;
  payment_amount: number | null;
  payment_verified_at: string | null;
}

// ---------------------------------------------------------------------------
// Application billing status (client / API DTOs)
// ---------------------------------------------------------------------------

export type BillingEntitlementStatus =
  | "free"
  | "active"
  | "pending_verification"
  | "past_due"
  | "cancelled"
  | "expired";

export interface BillingProfileStatus {
  account_active: boolean;
  payment_status: ProfilePaymentStatus | null;
  subscription_tier: SubscriptionTierDb;
  subscription_status: ProfileSubscriptionStatus;
  entitlement: BillingEntitlementStatus;
  has_premium: boolean;
}

export interface ManualPaymentSubmission {
  user_id: string;
  email: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  screenshot_path: string;
  tier: SubscriptionTierDb;
}

// ---------------------------------------------------------------------------
// Stripe webhook payload shapes (minimal — handler maps to DB writes)
// ---------------------------------------------------------------------------

export type StripeWebhookEventType =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed";

export interface StripeWebhookEventEnvelope<T = unknown> {
  id: string;
  type: StripeWebhookEventType | string;
  created: number;
  data: {
    object: T;
  };
}

export interface StripeCheckoutSessionPayload {
  id: string;
  object: "checkout.session";
  mode: "subscription" | "payment" | "setup" | null;
  customer: string | null;
  subscription: string | null;
  client_reference_id: string | null;
  metadata: Record<string, string>;
  payment_status: string | null;
  status: string | null;
}

export interface StripeSubscriptionPayload {
  id: string;
  object: "subscription";
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
}

export interface StripeInvoicePayload {
  id: string;
  object: "invoice";
  customer: string | null;
  subscription: string | null;
  status: string | null;
  payment_intent: string | null;
}

/** Row shape for idempotency INSERT into stripe_webhook_events */
export interface StripeWebhookEventInsert {
  id: string;
  type: string;
  created_at?: string;
  processed_at?: string;
}

/** Metadata expected on Checkout Session for hybrid billing correlation */
export interface StripeCheckoutMetadata {
  user_id: string;
  tier: SubscriptionTierDb | BillingPlanTier | string;
  plan?: BillingPlanTier;
}
