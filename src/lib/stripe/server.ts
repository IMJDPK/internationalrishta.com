/**
 * Stripe SDK singleton — server-only.
 * NEVER import from client components.
 */

import Stripe from "stripe";
import { requireStripeSecretKey } from "@/lib/billing/prices";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(requireStripeSecretKey(), {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeInstance;
}
