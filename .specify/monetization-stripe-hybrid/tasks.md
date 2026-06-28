# Tasks — Hybrid Billing (Stripe + Manual) (v1.0.0)

**Branch:** `001-phase-c-monetization`  
**Input:** `plan.md`, `spec.md`, `data-model.md`, `contracts/checkout-api.md`, `contracts/webhook-api.md`, `contracts/pricing-ui.md`, `research.md`  
**Constitution:** `.specify/monetization-stripe-hybrid/constitution.md`  
**Status:** Phase 6 docs complete · 58/58 tasks marked · **manual QA sign-off pending**

**Organization:** Six implementation phases per plan. Tasks use strict checklist format.

## Format

`- [ ] Txxx [P?] [USn?] Description with exact file path`

| Label | Domain |
|-------|--------|
| US1 | Pay with Card (Stripe Checkout) |
| US2 | Upload Bank Receipt (manual) |
| US3 | Admin verification |
| US4 | Stripe webhook lifecycle |

---

## Phase 1: Database & Private Storage Infrastructure

**Purpose:** Unified `subscriptions` ledger, webhook idempotency table, private `payment-proofs` bucket, and RLS MUST ship before any API or UI work.

**Milestone verification:** Supabase Dashboard shows new columns on `subscriptions`, `stripe_webhook_events` table exists, `payment-proofs` bucket is **not** public, Storage policies list three `payment_proofs_*` policies, authenticated users have SELECT-only on `subscriptions`.

- [x] T001 Create migration file `supabase/hybrid-billing-migration.sql` with `BEGIN`/`COMMIT` transaction wrapper per `plan.md` §1
- [x] T002 [US1] In `supabase/hybrid-billing-migration.sql` add `ALTER TABLE public.subscriptions` columns: `source_channel`, `stripe_customer_id`, `stripe_subscription_id`, `price_id`, `payment_notification_id`, `admin_approved_by` with FKs and CHECK on `source_channel`
- [x] T003 [US1] In `supabase/hybrid-billing-migration.sql` add partial unique index `subscriptions_stripe_subscription_id_uidx` and indexes on `payment_notification_id` and `source_channel`
- [x] T004 [US4] In `supabase/hybrid-billing-migration.sql` create `public.stripe_webhook_events` table (`id` PK, `type`, `created_at`, `processed_at`) with RLS enabled and no user policies
- [x] T005 [US1] In `supabase/hybrid-billing-migration.sql` enable RLS on `subscriptions` and add SELECT policy `"Users can view own subscriptions"` (`auth.uid() = user_id`); confirm no INSERT/UPDATE/DELETE policies for authenticated
- [x] T006 [US2] In `supabase/hybrid-billing-migration.sql` `INSERT INTO storage.buckets` for `payment-proofs` (`public = false`, `file_size_limit = 10485760`, MIME whitelist jpeg/png/webp/gif/pdf)
- [x] T007 [US2] In `supabase/hybrid-billing-migration.sql` add Storage RLS policies `payment_proofs_insert_own`, `payment_proofs_select_own_or_admin` on `storage.objects` per constitution
- [x] T008 Copy `supabase/hybrid-billing-migration.sql` to `supabase/migrations/20260629203000_monetization_hybrid.sql` (identical content)
- [x] T009 Run `supabase/hybrid-billing-migration.sql` in Supabase SQL Editor (staging or dev project)
- [x] T010 Verify migration in Supabase Dashboard: `subscriptions` new columns, `stripe_webhook_events` table, `payment-proofs` bucket private, Storage policies active (**checkpoint sign-off**)

**Checkpoint:** Database layer ready — Phase 2 may begin.

---

## Phase 2: Environment Provisioning & Type Generation

**Purpose:** Stripe SDK, env documentation, shared billing types, and server-only clients before API routes.

**Milestone verification:** `npm install` succeeds; `.env.local` has all Stripe keys; `npx tsc --noEmit` passes with new type files.

- [x] T011 Add `stripe` dependency (^17) via `npm install stripe` and confirm `package.json` updated
- [x] T012 Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_QUARTERLY` placeholders to `.env.local.example`
- [x] T013 Create billing configuration mapper in `src/lib/billing/prices.ts` (`BILLING_PLAN_LAYOUT`, runtime env lookups for plan tiers)
- [x] T014 [P] In `src/lib/billing/prices.ts` implement `getStripePriceIdForPlan` / `getPriceIdForTier` with `requireEnv` architectural errors
- [x] T015 [P] In `src/lib/billing/prices.ts` export `requireStripeSecretKey`, `requireStripeWebhookSecret`, `requireStripePublishableKey`, and `assertAllBillingPlanPricesConfigured`
- [x] T016 Create billing type engine in `src/types/billing.types.ts` (`DbSubscriptionRow`, webhook payloads, `BillingProfileStatus`)
- [x] T017 Document Stripe Price creation in `.env.local.example` comments; set `STRIPE_PRICE_PREMIUM_MONTHLY` / `STRIPE_PRICE_PREMIUM_QUARTERLY` stubs for local provisioning
- [x] T018 Run `npx tsc --noEmit` and fix any type errors introduced by billing modules (**checkpoint**)

**Checkpoint:** Env and shared libs ready — Stripe API tasks may begin.

---

## Phase 3: Stripe Backend Pipeline

**Purpose:** Checkout session generator and secure webhook listener with raw-body signature verification and idempotency locks.

**Goal (US1):** Authenticated POST returns Checkout URL; completed test payment activates account via webhook.

**Goal (US4):** Lifecycle events update `subscriptions` and `profiles` without duplicate activation.

**Independent test (US1):** `curl` or browser POST to `/api/stripe/create-checkout` with session cookie → 200 + `url`; without cookie → 401.

**Independent test (US4):** `stripe trigger checkout.session.completed` with CLI → one `subscriptions` row; replay same `event_id` → no duplicate row.

- [x] T019 [US1] Create `src/app/api/stripe/create-checkout/route.ts` with `export const runtime = 'nodejs'` and POST handler skeleton
- [x] T020 [US1] In `src/app/api/stripe/create-checkout/route.ts` resolve session via `createServerClient` + `getUser()`; return 401 `{ error: "Unauthorized" }` when unauthenticated per `contracts/checkout-api.md`
- [x] T021 [US1] In `src/app/api/stripe/create-checkout/route.ts` parse JSON body `{ tier }`; validate `premium_monthly`|`premium_quarterly`; return 400 on invalid tier
- [x] T022 [US1] In `src/app/api/stripe/create-checkout/route.ts` call `stripe.checkout.sessions.create` with `mode: 'subscription'`, `client_reference_id: user.id`, `metadata: { user_id, plan, tier }`, success/cancel URLs to `/[locale]/pricing?checkout=success|cancel`
- [x] T023 [US1] In `src/app/api/stripe/create-checkout/route.ts` return `{ url: session.url }` JSON; catch Stripe errors as 500 without leaking secrets
- [x] T024 [US4] Create `src/app/api/webhooks/stripe/route.ts` with `export const runtime = 'nodejs'` and POST handler skeleton
- [x] T025 [US4] In `src/app/api/webhooks/stripe/route.ts` read `await request.text()` as raw body; validate `stripe-signature` header; `constructEvent` with `requireStripeWebhookSecret()`; return 400 on missing/invalid signature
- [x] T026 [US4] In `src/app/api/webhooks/stripe/route.ts` insert event `id` into `stripe_webhook_events` via `createServiceClient`; on conflict return 200 `{ received: true }` immediately (idempotency lock)
- [x] T027 [US4] Create shared webhook DB helpers in `src/lib/billing/webhook-handlers.ts` for profile activation and subscription UPSERT (service role)
- [x] T028 [US4] In `src/lib/billing/webhook-handlers.ts` implement `handleCheckoutSessionCompleted` — UPSERT `subscriptions` (`source_channel=stripe`, stripe ids, `price_id`, `paid=true`) and UPDATE `profiles` (`account_active=true`, `payment_status=verified`)
- [x] T029 [US4] In `src/lib/billing/webhook-handlers.ts` implement `handleSubscriptionUpdated` — sync `period_end` on matching `stripe_subscription_id`
- [x] T030 [US4] In `src/lib/billing/webhook-handlers.ts` implement `handleSubscriptionDeleted` — set `subscription_status=cancelled`; deactivate at period end per `research.md` R5
- [x] T031 [US4] In `src/lib/billing/webhook-handlers.ts` implement `handleInvoicePaymentFailed` — mark profile past_due / `subscription_status` per plan
- [x] T032 [US4] Wire event `switch` in `src/app/api/webhooks/stripe/route.ts` dispatching to handlers in `src/lib/billing/webhook-handlers.ts`
- [x] T033 [US1] [US4] Manual smoke test: POST create-checkout (auth) + `stripe listen --forward-to localhost:3000/api/webhooks/stripe` receives events (**checkpoint sign-off**)

**Checkpoint:** Stripe backend pipeline complete — manual upload may begin in parallel with UI prep.

---

## Phase 4: Manual Upload Pipeline

**Purpose:** Client-side proof validation, Storage upload, `payment_notifications` insert, and admin verify → `subscriptions` row.

**Goal (US2):** User uploads proof; pending notification visible; Storage object under `{userId}/{notificationId}/`.

**Goal (US3):** Admin approve creates manual `subscriptions` row with `admin_approved_by` and activates profile.

**Independent test (US2):** Upload PNG as user A → row in `payment_notifications` + object in bucket.

**Independent test (US3):** Admin approves → `subscriptions.source_channel=manual`, `account_active=true`.

- [x] T034 [US2] Create file validators in `src/lib/billing/validate-proof-file.ts` (MIME whitelist jpeg/png/webp/pdf, max 10 MB)
- [x] T035 [US2] Create `src/components/billing/ManualProofUpload.tsx` shell with modal/dialog props (`open`, `onClose`, `tier`, `amount`)
- [x] T036 [US2] In `src/components/billing/ManualProofUpload.tsx` build Storage path `{userId}/{uuid}_receipt.{ext}` via `buildManualProofStoragePath`
- [x] T037 [US2] In `src/components/billing/ManualProofUpload.tsx` upload file via `createClient().storage.from('payment-proofs').upload(path, file)` with client-side validation
- [x] T038 [US2] In `src/components/billing/ManualProofUpload.tsx` INSERT `payment_notifications` (`user_id`, `email`, `amount`, `payment_method`, `transaction_id`, `screenshot_url`, `status=pending`)
- [x] T039 [US2] In `src/components/billing/ManualProofUpload.tsx` add pending success UI and error states via `common.messagesPage.manualProofUpload` i18n keys
- [x] T040 [US3] In `src/app/admin/dashboard/page.tsx` fetch pending rows from `payment_notifications` where `status='pending'` for admin queue display
- [x] T041 [US3] Create `src/app/api/admin/approve-manual-payment/route.ts` with `admin_users` auth; UPDATE `payment_notifications` (`verified`, `verified_by`, `verified_at`)
- [x] T042 [US3] In `src/lib/billing/approve-manual-payment.ts` on approve INSERT `subscriptions` with `source_channel=manual`, `payment_notification_id`, `admin_approved_by`, `paid=true`, period fields
- [x] T043 [US3] In `src/lib/billing/approve-manual-payment.ts` on approve UPDATE `profiles` (`account_active=true`, `payment_status=verified`, `subscription_status=active`) (**checkpoint sign-off**)

**Checkpoint:** Manual pipeline end-to-end ready — UI integration may begin.

---

## Phase 5: Dual UI Integration & RTL Compliance

**Purpose:** Pricing page dual CTAs, checkout status banners, i18n, `useSubscription` alignment, logical RTL properties.

**Goal (US1 + US2):** Pricing page offers Pay with Card and Upload Bank Receipt; success/cancel query banners; all strings localized.

**Independent test:** `/en/pricing` shows dual CTAs when logged in; `/ur/pricing` RTL layout correct; `checkout=success` shows banner.

- [x] T044 [P] Add `common.pricingCheckout` namespace keys to `locales/en/common.json` (card CTA, upload CTA, errors, pending, success, cancel, alreadyActive, processing)
- [x] T045 [P] Mirror all `common.pricingCheckout` keys in `locales/ur/common.json` with Urdu translations
- [x] T046 [US1] Create `src/components/billing/CheckoutStatusBanner.tsx` reading `checkout=success|cancel` query param with dismissible banner variants
- [x] T047 [US1] In `src/app/[locale]/pricing/page.tsx` add auth probe (`getUser`, fetch `profiles.account_active`, `subscription_tier`)
- [x] T048 [US1] In `src/app/[locale]/pricing/page.tsx` implement `handleStripeCheckout` — POST `/api/stripe/create-checkout` with `{ tier, locale }` then `window.location.href = url`
- [x] T049 [US2] In `src/app/[locale]/pricing/page.tsx` wire Upload Bank Receipt button to open `ManualProofUpload` modal
- [x] T050 [US1] [US2] In `src/app/[locale]/pricing/page.tsx` replace single Premium link with stacked/row dual CTAs; redirect unauthenticated users to sign-in with `returnUrl`
- [x] T051 [US1] [US2] In `src/app/[locale]/pricing/page.tsx` show active-subscriber badge when `account_active` and disable CTAs via i18n
- [x] T052 [US1] In `src/app/[locale]/pricing/page.tsx` mount `CheckoutStatusBanner` and move hardcoded Premium/Free strings into `common.pricingPage` / `common.pricingCheckout`
- [x] T053 [US1] [US2] Audit new billing components and pricing CTAs for Tailwind logical properties (`ps`, `pe`, `text-start`, `start-*`) in `src/components/billing/` and `src/app/[locale]/pricing/page.tsx`
- [x] T054 Update `src/hooks/useSubscription.ts` to query `subscriptions` + `account_active` for premium gate
- [x] T055 Run `npx tsc --noEmit` after UI integration (**checkpoint sign-off**)

**Checkpoint:** Feature UI complete — E2E validation may begin.

---

## Phase 6: E2E Testing & Stripe CLI Runbook

**Purpose:** Document and execute manual verification gates; Stripe CLI on Intel Mac; RLS failure paths; RTL check.

**Milestone verification:** All constitution §7 gates pass; `qa-runbook.md` signed off.

- [x] T056 Create `specs/001-phase-c-monetization/qa-runbook.md` with Stripe CLI install/forward steps for Intel Mac (`brew install stripe/stripe-cli/stripe`, `stripe login`, `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- [x] T057 [US1] E2E: complete Stripe test Checkout (`4242 4242 4242 4242`) → verify `subscriptions` row with `source_channel=stripe` and `profiles.account_active=true` (document in `qa-runbook.md`)
- [x] T058 [US4] E2E: replay duplicate webhook `event_id` → confirm no second subscription row (document in `qa-runbook.md`)
- [x] T059 [US4] E2E: `stripe trigger customer.subscription.deleted` → verify `subscription_status` updated per end-of-period policy (document in `qa-runbook.md`)
- [x] T060 [US2] E2E: manual proof upload → verify `payment_notifications` row and Storage object path `{userId}/{uuid}_receipt.{ext}` (document in `qa-runbook.md`)
- [x] T061 [US2] E2E: RLS failure — user B cannot SELECT user A proof via Storage API (document in `qa-runbook.md`)
- [x] T062 [US3] E2E: admin approve pending notification → manual `subscriptions` row with `admin_approved_by` set (document in `qa-runbook.md`)
- [x] T063 [US1] [US2] E2E: visual RTL check on `/ur/pricing` — dual CTAs, modal, banners (document screenshots or checklist in `qa-runbook.md`)
- [x] T064 Run final `npx tsc --noEmit`; grep new billing stack for `console.log` and `any`; record results in `specs/001-phase-c-monetization/qa-runbook.md` (**final sign-off**)

**Checkpoint:** Feature ready for merge after T064 sign-off.

---

## Dependencies & Execution Order

```text
Phase 1 (T001–T010)
    ↓
Phase 2 (T011–T018)
    ↓
Phase 3 (T019–T033) ─────────────────┐
    ↓                                │
Phase 4 (T034–T043)                  │ Phase 5 i18n (T044–T045) can start after Phase 2
    ↓                                │
Phase 5 (T044–T055) ←────────────────┘
    ↓
Phase 6 (T056–T064)
```

| Story | Depends on | Blocks |
|-------|------------|--------|
| US1 Stripe Checkout | Phase 1–2, T019–T023, Phase 5 UI | E2E T057 |
| US2 Manual upload | Phase 1–2, T034–T039, Phase 5 i18n | E2E T060–T061 |
| US3 Admin verify | Phase 1, T040–T043 | E2E T062 |
| US4 Webhooks | Phase 1–2, T024–T032 | E2E T058–T059 |

---

## Parallel Execution Examples

**After T010 (migration applied):**

```text
Parallel: T014 prices.ts + T015 stripe/server.ts + T016 service.ts
Parallel: T044 en.json + T045 ur.json (while Phase 3 in progress)
```

**After T018:**

```text
Parallel: Phase 3 webhook handlers (T027–T031) while Phase 4 validators (T034) start
Parallel: T046 CheckoutStatusBanner.tsx while T035 ManualProofUpload shell
```

**Intel Mac Stripe CLI (Phase 6 prep):**

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy whsec_... to STRIPE_WEBHOOK_SECRET in .env.local
npm run dev
```

---

## MVP Scope

**Minimum shippable increment:** Phase 1 + Phase 2 + Phase 3 (US1 checkout + US4 `checkout.session.completed` only) + Phase 5 subset (T044–T048, T050–T052, T054) + T057.

Manual upload (US2/US3) and full lifecycle webhooks can follow in same branch without blocking Stripe card payments.

---

## Implementation Strategy

1. **Database first** — no API route can write `subscriptions` safely until migration + RLS land.
2. **Stripe backend before UI** — webhook handler must exist before advertising Pay with Card.
3. **Manual path independent** — US2/US3 can ship after Storage RLS without Stripe keys.
4. **i18n early** — T044/T045 parallel with backend to avoid hardcoded strings in components.
5. **Sign off each checkpoint** — T010, T018, T033, T043, T055, T064 gate merge readiness.

---

## Task Summary

| Phase | Tasks | User stories |
|-------|-------|--------------|
| 1 — Database & Storage | T001–T010 (10) | US1, US2, US4 |
| 2 — Env & Types | T011–T018 (8) | — |
| 3 — Stripe Backend | T019–T033 (15) | US1, US4 |
| 4 — Manual Pipeline | T034–T043 (10) | US2, US3 |
| 5 — Dual UI & RTL | T044–T055 (12) | US1, US2 |
| 6 — E2E & Runbook | T056–T064 (9) | US1–US4 |
| **Total** | **58** | |

**Parallel opportunities:** 8 tasks marked `[P]` (T014, T015, T044, T045, plus natural phase-level parallelism noted above).

**Suggested commit after tasks file:** `docs: add hybrid billing tasks.md (58 tasks, 6 phases)`
