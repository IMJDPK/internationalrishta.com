import {
  dispatchStripeWebhookEvent,
  tryAcquireWebhookEventLock,
} from "@/lib/billing/webhook-handlers";
import { requireStripeWebhookSecret } from "@/lib/billing/prices";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      requireStripeWebhookSecret()
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const acquired = await tryAcquireWebhookEventLock(
    supabase,
    event.id,
    event.type
  );

  if (!acquired) {
    return NextResponse.json({ received: true });
  }

  try {
    await dispatchStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhooks/stripe] handler error", event.type, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
