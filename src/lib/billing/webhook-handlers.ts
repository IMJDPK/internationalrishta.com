/**
 * Stripe webhook DB handlers — service role only.
 * @see specs/001-phase-c-monetization/contracts/webhook-api.md
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import {
  getAmountForBillingPlan,
  isBillingPlanTier,
  mapBillingPlanToSubscriptionTier,
} from "@/lib/billing/prices";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  StripeCheckoutSessionPayload,
  StripeInvoicePayload,
  StripeSubscriptionPayload,
  SubscriptionTierDb,
} from "@/types/billing.types";

// ---------------------------------------------------------------------------
// Idempotency lock
// ---------------------------------------------------------------------------

/**
 * Attempt to record a Stripe event. Returns false if already processed (duplicate delivery).
 */
export async function tryAcquireWebhookEventLock(
  supabase: SupabaseClient,
  eventId: string,
  eventType: string
): Promise<boolean> {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: eventId,
    type: eventType,
  });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    throw new Error(
      `[webhook-handlers] Failed idempotency insert for ${eventId}: ${error.message}`
    );
  }

  return true;
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// ---------------------------------------------------------------------------

export async function handleCheckoutSessionCompleted(
  session: StripeCheckoutSessionPayload
): Promise<void> {
  const supabase = createServiceClient();
  const stripe = getStripe();

  const userId =
    session.client_reference_id ?? session.metadata?.user_id ?? null;
  if (!userId) {
    throw new Error(
      "[webhook-handlers] checkout.session.completed missing user correlation"
    );
  }

  const planMeta = session.metadata?.plan ?? session.metadata?.tier;
  let subscriptionTier: SubscriptionTierDb = "direct";
  let amount = getAmountForBillingPlan("premium_monthly");

  if (planMeta && isBillingPlanTier(planMeta)) {
    subscriptionTier = mapBillingPlanToSubscriptionTier(planMeta);
    amount = getAmountForBillingPlan(planMeta);
  } else if (
    session.metadata?.tier === "referral" ||
    session.metadata?.tier === "direct"
  ) {
    subscriptionTier = session.metadata.tier;
    amount =
      subscriptionTier === "referral" ? 3999 : 4999;
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;

  if (!stripeSubscriptionId) {
    throw new Error(
      "[webhook-handlers] checkout.session.completed missing subscription id"
    );
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );

  const priceId =
    stripeSubscription.items.data[0]?.price?.id ??
    session.metadata?.price_id ??
    null;

  const periodStart = new Date(
    stripeSubscription.current_period_start * 1000
  ).toISOString();
  const periodEnd = new Date(
    stripeSubscription.current_period_end * 1000
  ).toISOString();
  const now = new Date().toISOString();

  const subscriptionRow = {
    user_id: userId,
    tier: subscriptionTier,
    amount,
    payment_method: "stripe",
    payment_reference: session.id,
    paid: true,
    paid_at: now,
    period_start: periodStart,
    period_end: periodEnd,
    source_channel: "stripe",
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    price_id: priceId,
    payment_notification_id: null,
    admin_approved_by: null,
  };

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(subscriptionRow)
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(
        `[webhook-handlers] subscriptions update failed: ${updateError.message}`
      );
    }
  } else {
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert(subscriptionRow);

    if (insertError) {
      throw new Error(
        `[webhook-handlers] subscriptions insert failed: ${insertError.message}`
      );
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      account_active: true,
      payment_status: "verified",
      subscription_status: "active",
      subscription_tier: subscriptionTier,
      payment_method: "stripe",
      payment_verified_at: now,
      payment_amount: amount,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(
      `[webhook-handlers] profiles activation failed: ${profileError.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// ---------------------------------------------------------------------------

export async function handleSubscriptionUpdated(
  subscription: StripeSubscriptionPayload
): Promise<void> {
  const supabase = createServiceClient();

  const periodStart = new Date(
    subscription.current_period_start * 1000
  ).toISOString();
  const periodEnd = new Date(
    subscription.current_period_end * 1000
  ).toISOString();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      period_start: periodStart,
      period_end: periodEnd,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      price_id: subscription.items.data[0]?.price?.id ?? null,
      paid: subscription.status === "active" || subscription.status === "trialing",
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(
      `[webhook-handlers] subscription.updated sync failed: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted — keep access until period end (research R5)
// ---------------------------------------------------------------------------

export async function handleSubscriptionDeleted(
  subscription: StripeSubscriptionPayload
): Promise<void> {
  const supabase = createServiceClient();

  const { data: subRow } = await supabase
    .from("subscriptions")
    .select("user_id, period_end")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (!subRow?.user_id) {
    return;
  }

  const periodEndMs = new Date(subRow.period_end).getTime();
  const nowMs = Date.now();
  const periodEnded = nowMs >= periodEndMs;
  const immediate =
    !subscription.cancel_at_period_end && subscription.status === "canceled";

  const profileUpdate: Record<string, unknown> = {
    subscription_status: "cancelled",
  };

  if (immediate || periodEnded) {
    profileUpdate.account_active = false;
    profileUpdate.subscription_status = "expired";
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", subRow.user_id);

  if (profileError) {
    throw new Error(
      `[webhook-handlers] subscription.deleted profile update failed: ${profileError.message}`
    );
  }

  if (immediate || periodEnded) {
    await supabase
      .from("subscriptions")
      .update({ paid: false })
      .eq("stripe_subscription_id", subscription.id);
  }
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// ---------------------------------------------------------------------------

export async function handleInvoicePaymentFailed(
  invoice: StripeInvoicePayload
): Promise<void> {
  const supabase = createServiceClient();

  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : null;

  let userId: string | null = null;

  if (subscriptionId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }

  if (!userId && invoice.customer) {
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", invoice.customer)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    userId = data?.user_id ?? null;
  }

  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "cancelled",
      payment_status: "failed",
    })
    .eq("id", userId);

  if (error) {
    throw new Error(
      `[webhook-handlers] invoice.payment_failed profile update failed: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// Stripe.Event dispatcher helper
// ---------------------------------------------------------------------------

export async function dispatchStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as StripeCheckoutSessionPayload
      );
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(
        event.data.object as StripeSubscriptionPayload
      );
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(
        event.data.object as StripeSubscriptionPayload
      );
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(
        event.data.object as StripeInvoicePayload
      );
      break;
    default:
      break;
  }
}
