import { createClient } from "@/lib/supabase/server";
import {
  getPriceIdForTier,
  isBillingPlanTier,
  mapBillingPlanToSubscriptionTier,
} from "@/lib/billing/prices";
import { getStripe } from "@/lib/stripe/server";
import type { BillingPlanTier } from "@/types/billing.types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPPORTED_LOCALES = ["en", "ur"] as const;

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

function normalizeLocale(locale: string | undefined): string {
  if (locale && SUPPORTED_LOCALES.includes(locale as "en" | "ur")) {
    return locale;
  }
  return "en";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { tier?: string; locale?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const tierInput = body.tier;
    if (!tierInput || !isBillingPlanTier(tierInput)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const tier: BillingPlanTier = tierInput;
    const locale = normalizeLocale(body.locale);
    const priceId = getPriceIdForTier(tier);
    const subscriptionTier = mapBillingPlanToSubscriptionTier(tier);
    const appUrl = getAppUrl();

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan: tier,
        tier: subscriptionTier,
      },
      success_url: `${appUrl}/${locale}/pricing?checkout=success`,
      cancel_url: `${appUrl}/${locale}/pricing?checkout=cancel`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[create-checkout] error", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
