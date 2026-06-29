# Research — Hybrid Billing (Stripe + Manual)

**Branch:** `001-phase-c-monetization`  
**Date:** 2026-06-29

## R1 — Stripe Checkout vs Payment Links

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Checkout Session API | **Use `stripe.checkout.sessions.create` via server route** | Supports `client_reference_id`, subscription mode, metadata, success/cancel URLs | Payment Links (less control over user correlation); Elements (more UI work) |

## R2 — Webhook raw body in Next.js App Router

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Route handler | **`export const runtime = 'nodejs'`** + `await request.text()` | Stripe requires raw body for signature verification | Edge runtime (body already parsed); Pages Router legacy config |

## R3 — DB writes from webhook

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Service role client | **`createClient(url, SUPABASE_SERVICE_ROLE_KEY)` in route only** | Bypasses RLS for trusted server writes; constitution forbids client INSERT on subscriptions | SECURITY DEFINER RPC (valid; more migration work) |

## R4 — Idempotency for webhook retries

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| `stripe_webhook_events` table | **INSERT `event_id` UNIQUE; skip if exists** | Stripe retries failed webhooks; prevents double activation | Stripe-only dedup without persistence (unsafe on crash mid-write) |

## R5 — Subscription cancellation policy

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| End of period | **On `customer.subscription.deleted`, set `subscription_status = cancelled`; keep `account_active` until `period_end`** | Standard SaaS entitlement; constitution default | Immediate revoke (harsher UX) |

## R6 — Manual proof storage path

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Path pattern | **`{user_id}/{notification_id}/{filename}`** | RLS folder check on first segment; unique per submission | Flat bucket (harder RLS); public bucket (forbidden) |

## R7 — PKR pricing in Stripe

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Env-mapped Price IDs | **`STRIPE_PRICE_ID_REFERRAL`, `STRIPE_PRICE_ID_DIRECT`** | Constitution: never hardcode price_id in UI; Dashboard controls amount/currency | Dynamic `price_data` (harder to audit) |

Create Prices in Stripe Dashboard for PKR 3,999 / 4,999 (or USD equivalent if PKR not enabled on account — document actual currency in Dashboard).

## R8 — `useSubscription` alignment

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Primary gate | **`profiles.account_active === true`** | Single source of truth after webhook or admin | `subscription_tier` only (current hook ignores `account_active`) |

## R9 — Success/cancel UX

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| Query params on pricing | **`/[locale]/pricing?checkout=success|cancel`** | Constitution; no new routes required | Dedicated `/checkout/success` pages (extra routing) |

## R10 — npm dependency

| | Decision | Rationale | Alternatives |
|---|----------|-----------|--------------|
| `stripe` package | **Add `stripe@^17`** | Official SDK for Checkout + webhooks | Raw fetch to Stripe API (more error-prone) |

All NEEDS CLARIFICATION items from Technical Context resolved.
