/**
 * Server-side manual payment approval — service role writes to subscriptions.
 */

import { createServiceClient } from "@/lib/supabase/service";
import type { SubscriptionTierDb } from "@/types/billing.types";

function tierFromAmount(amount: number): SubscriptionTierDb {
  if (amount <= 3999) {
    return "referral";
  }
  return "direct";
}

export async function approveManualPaymentNotification(
  notificationId: string,
  adminId: string
): Promise<void> {
  const supabase = createServiceClient();

  const { data: notification, error: fetchError } = await supabase
    .from("payment_notifications")
    .select("*")
    .eq("id", notificationId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `[approve-manual-payment] fetch failed: ${fetchError.message}`
    );
  }

  if (!notification) {
    throw new Error(
      "[approve-manual-payment] pending notification not found"
    );
  }

  const tier = tierFromAmount(notification.amount);
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const verifiedAt = now.toISOString();

  const { error: notifyError } = await supabase
    .from("payment_notifications")
    .update({
      status: "verified",
      verified_by: adminId,
      verified_at: verifiedAt,
    })
    .eq("id", notificationId)
    .eq("status", "pending");

  if (notifyError) {
    throw new Error(
      `[approve-manual-payment] notification update failed: ${notifyError.message}`
    );
  }

  const { error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: notification.user_id,
      tier,
      amount: notification.amount,
      payment_method: notification.payment_method,
      payment_reference: notification.transaction_id,
      paid: true,
      paid_at: verifiedAt,
      period_start: verifiedAt,
      period_end: periodEnd.toISOString(),
      source_channel: "manual",
      payment_notification_id: notificationId,
      admin_approved_by: adminId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      price_id: null,
    });

  if (subscriptionError) {
    throw new Error(
      `[approve-manual-payment] subscription insert failed: ${subscriptionError.message}`
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      account_active: true,
      payment_status: "verified",
      subscription_status: "active",
      subscription_tier: tier,
      payment_method: notification.payment_method,
      payment_amount: notification.amount,
      payment_verified_at: verifiedAt,
      payment_verified_by: adminId,
    })
    .eq("id", notification.user_id);

  if (profileError) {
    throw new Error(
      `[approve-manual-payment] profile update failed: ${profileError.message}`
    );
  }
}

export async function rejectManualPaymentNotification(
  notificationId: string,
  adminId: string,
  adminNotes?: string
): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("payment_notifications")
    .update({
      status: "rejected",
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      admin_notes: adminNotes ?? null,
    })
    .eq("id", notificationId)
    .eq("status", "pending");

  if (error) {
    throw new Error(
      `[approve-manual-payment] rejection failed: ${error.message}`
    );
  }
}
