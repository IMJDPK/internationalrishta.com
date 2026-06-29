# Feature Specification — Hybrid Billing (Stripe + Manual)

**Branch:** `001-phase-c-monetization`  
**Constitution:** `.specify/monetization-stripe-hybrid/constitution.md`  
**Status:** Implementation complete — remediation sync (docs + admin UX)

## Overview

Premium access is sold via two checkout plans (`premium_monthly`, `premium_quarterly`) on the pricing page. Users may pay by **Stripe card** or **manual bank transfer** (proof upload). Both paths write to a unified `subscriptions` ledger and set `profiles.account_active`. Stripe lifecycle events are handled by a signed webhook route.

## User Stories

### US1 — Pay with Card (Stripe)

Authenticated user selects a premium plan on the pricing page, completes Stripe Checkout, and receives premium access when the webhook confirms payment.

**Acceptance criteria**

- [ ] Pricing page shows Free plus two premium cards (monthly and quarterly), each with **Pay with Card** and **Upload Bank Receipt** CTAs.
- [ ] `POST /api/stripe/create-checkout` accepts `tier: premium_monthly | premium_quarterly` and optional `locale`; returns `{ url }` for redirect.
- [ ] Checkout session uses `client_reference_id` equal to the authenticated user id.
- [ ] Session metadata includes `user_id`, `plan` (billing plan tier), and `tier` (`referral` for monthly, `direct` for quarterly).
- [ ] Success and cancel URLs return to `/{locale}/pricing?checkout=success|cancel` with localized banner feedback.
- [ ] On `checkout.session.completed`, webhook inserts `subscriptions` (`source_channel=stripe`, `paid=true`) and updates `profiles` (`account_active=true`, `payment_status=verified`, `subscription_tier` from metadata).
- [ ] Unauthenticated users cannot start checkout (401).
- [ ] Invalid or missing `tier` returns 400.

### US2 — Upload Bank Receipt (Manual)

Authenticated user uploads proof to `payment-proofs`, submits `payment_notifications`, and sees pending state until admin verifies.

**Acceptance criteria**

- [ ] Manual upload modal accepts JPEG, PNG, WebP, or PDF up to 10 MB; rejects invalid types/sizes with localized errors.
- [ ] File is stored at `payment-proofs/{user_id}/{uuid}_receipt.{ext}` (private bucket).
- [ ] `payment_notifications` row is inserted with `status=pending`, amount matching plan (monthly → PKR 3,999 / referral; quarterly → PKR 4,999 / direct), and `screenshot_url` as storage path.
- [ ] User sees success state explaining admin verification is required before premium activates.
- [ ] User cannot read another user's proof object (Storage RLS: folder prefix = own `user_id`).
- [ ] All manual-upload strings live under `common.pricingCheckout.manualProofUpload` (en + ur).

### US3 — Admin verification (manual payments)

Admin verifies manual payment; system creates `subscriptions` row and activates account via service-role API (not profile-only shortcut).

**Acceptance criteria**

- [ ] Admin dashboard **Manual Payments** tab lists `payment_notifications` where `status=pending` with amount, method, transaction id, and storage path.
- [ ] Approve calls `POST /api/admin/approve-manual-payment` with `action=approve`; sets notification `verified`, inserts `subscriptions` (`source_channel=manual`, `paid=true`, `payment_notification_id`, `admin_approved_by`), and updates `profiles` (`account_active=true`, `payment_status=verified`).
- [ ] Reject calls same API with `action=reject`; sets notification `rejected` without activating account.
- [ ] Only users in `admin_users` can call the approve API.
- [ ] **Pending Users** tab does not offer profile-only approve when a pending `payment_notification` exists for that user; UI directs admin to Manual Payments tab.

### US4 — Subscription lifecycle (Stripe)

Webhook handles renewal updates, cancellation, and failed payments per constitution.

**Acceptance criteria**

- [ ] `POST /api/webhooks/stripe` verifies signature with raw body and `STRIPE_WEBHOOK_SECRET`.
- [ ] Each Stripe event id is processed once via `stripe_webhook_events` (`id`, `type`, `created_at`, `processed_at`).
- [ ] `customer.subscription.updated` updates subscription period and profile `subscription_status`.
- [ ] `customer.subscription.deleted` marks subscription cancelled; access rules follow period end.
- [ ] `invoice.payment_failed` updates profile/subscription to reflect past-due or failed state without silent activation.

## Non-functional

- Webhook signature verification mandatory (reject unsigned/invalid payloads).
- All pricing/checkout and manual-upload strings localized (en/ur).
- RLS on Storage (`payment-proofs`) and `subscriptions` SELECT-only for authenticated users on own rows; no client INSERT/UPDATE on `subscriptions`.

## Edge cases

- User submits manual proof then also pays by card: webhook and manual flows both write ledger rows; latest paid subscription drives `useSubscription` display.
- Checkout cancelled: user remains on pricing with cancel banner; no subscription row created.
- Duplicate webhook delivery: idempotency table prevents double activation.
