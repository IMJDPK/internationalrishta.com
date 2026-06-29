# Implementation Plan — Hybrid Billing (Stripe + Manual Bank Transfer)

**Branch:** `001-phase-c-monetization`  
**Date:** 2026-06-29  
**Feature laws:** `.specify/monetization-stripe-hybrid/constitution.md`  
**Specs dir:** `specs/001-phase-c-monetization/`

## Summary

Unify premium monetization into a single `subscriptions` ledger supporting **Stripe Checkout**
(card) and **manual bank transfer** (proof upload + admin verify). Ship a Supabase migration
(extended `subscriptions`, `payment-proofs` bucket + RLS, webhook idempotency table), two App
Router API routes (`/api/stripe/create-checkout`, `/api/webhooks/stripe`), and pricing-page
dual CTAs with next-intl. Activation gates premium features via `profiles.account_active`.

---

## Technical Context

| Item | Value |
|------|-------|
| Language | TypeScript 5.7 (strict) |
| Framework | Next.js 15 App Router (`src/app/`) |
| Payments | Stripe Checkout (subscription mode) + existing manual admin flow |
| Backend | Supabase Postgres, Auth, Storage |
| Auth transport | `@supabase/ssr` — browser `client.ts`, server `server.ts`, service role in API routes only |
| i18n | `next-intl` 3.4 — `locales/en`, `locales/ur` |
| Styling | Tailwind 3.4 + logical properties |
| New dependency | `stripe` (^17) — not yet in `package.json` |
| Base schema | `supabase/schema.sql` |
| Payment migration | `supabase/COMPLETE_PAYMENT_ADMIN_MIGRATION.sql` |
| Pricing UI | `src/app/[locale]/pricing/page.tsx` |
| Manual reference | `src/app/[locale]/payment-instructions/page.tsx` |
| Admin verify | `src/app/admin/dashboard/page.tsx` (extend for `subscriptions` insert) |
| Premium gate | `src/hooks/useSubscription.ts` (align to `account_active`) |
| API routes | **None exist today** — first App Router API routes in project |
| Testing | Manual gates (constitution §7); Stripe CLI for webhooks |

---

## Constitution Check

| Gate | Status | Plan section |
|------|--------|--------------|
| Unified `subscriptions` with Stripe + manual fields | ✅ | §1 SQL |
| Webhook signature + raw body at `/api/webhooks/stripe` | ✅ | §2.2 |
| `payment-proofs` private bucket + RLS | ✅ | §1 SQL |
| Pricing dual CTAs + next-intl | ✅ | §3 |
| No client INSERT on `subscriptions` | ✅ | §2 RLS |
| Service role only in webhook/admin server paths | ✅ | §2 |
| `client_reference_id` = auth uid | ✅ | §2.1 |
| Logical Tailwind RTL on new UI | ✅ | §3 |

**Pre-design gate:** PASS  
**Post-design gate:** PASS (see `research.md`, `data-model.md`, `contracts/`)

---

## Project Structure

### Documentation

```text
.specify/monetization-stripe-hybrid/
├── constitution.md
└── plan.md                    # mirror of specs plan

specs/001-phase-c-monetization/
├── plan.md                    # this file
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── checkout-api.md
    ├── webhook-api.md
    └── pricing-ui.md
```

### Source (to create / modify)

```text
supabase/
├── hybrid-billing-migration.sql       # NEW — from §1 below
└── migrations/
    └── 20260629180000_hybrid_billing.sql  # NEW — copy of migration

src/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   └── create-checkout/
│   │   │       └── route.ts           # NEW
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts           # NEW
│   └── [locale]/
│       └── pricing/
│           └── page.tsx               # MODIFY — dual CTAs
├── components/
│   └── billing/
│       ├── ManualProofUpload.tsx      # NEW
│       └── CheckoutStatusBanner.tsx   # NEW — success/cancel query states
├── lib/
│   ├── stripe/
│   │   ├── server.ts                  # NEW — Stripe SDK singleton
│   │   └── prices.ts                  # NEW — tier → price_id map
│   └── supabase/
│       └── service.ts                 # NEW — service role client (server-only)
└── hooks/
    └── useSubscription.ts             # MODIFY — account_active gate

locales/
├── en/common.json                     # MODIFY — pricingCheckout keys
└── ur/common.json                     # MODIFY — pricingCheckout keys
```

**Structure decision:** Single Next.js app; no separate backend service. Stripe + Supabase
integration lives in App Router API routes and client components per existing patterns.

---

## 1. Database Migration Layout

**File to create:** `supabase/hybrid-billing-migration.sql`  
**Also copy to:** `supabase/migrations/20260629180000_hybrid_billing.sql`  
**Run after:** `schema.sql` + `COMPLETE_PAYMENT_ADMIN_MIGRATION.sql`

```sql
-- =============================================================================
-- Hybrid Billing — subscriptions extension + payment-proofs Storage + webhook log
-- Branch: 001-phase-c-monetization
-- Constitution: .specify/monetization-stripe-hybrid/constitution.md
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Extend public.subscriptions (unified Stripe + manual ledger)
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS source_channel text
    CHECK (source_channel IN ('stripe', 'manual'));

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS price_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_notification_id uuid
    REFERENCES public.payment_notifications(id);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS admin_approved_by uuid
    REFERENCES public.admin_users(id);

-- Partial unique: one Stripe subscription id per row when present
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_uidx
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_payment_notification_id_idx
  ON public.subscriptions (payment_notification_id)
  WHERE payment_notification_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_source_channel_idx
  ON public.subscriptions (source_channel);

COMMENT ON COLUMN public.subscriptions.source_channel IS
  'stripe = Checkout/webhook path; manual = bank proof + admin approval';
COMMENT ON COLUMN public.subscriptions.price_id IS
  'Stripe Price id at checkout (stripe path only)';

-- ---------------------------------------------------------------------------
-- 2. Stripe webhook idempotency / audit
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service role / superuser accesses this table

-- ---------------------------------------------------------------------------
-- 3. subscriptions RLS — read own; no client writes
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Intentionally NO INSERT/UPDATE/DELETE policies for authenticated users.
-- Webhook + admin paths use service role or SECURITY DEFINER RPC.

-- ---------------------------------------------------------------------------
-- 4. Storage bucket: payment-proofs (private)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ---------------------------------------------------------------------------
-- 5. Storage RLS — authenticated INSERT/SELECT on own folder only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "payment_proofs_insert_own" ON storage.objects;
CREATE POLICY "payment_proofs_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "payment_proofs_select_own_or_admin" ON storage.objects;
CREATE POLICY "payment_proofs_select_own_or_admin"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "payment_proofs_update_own" ON storage.objects;
CREATE POLICY "payment_proofs_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- No DELETE policy — proofs retained for audit

COMMIT;
```

### Admin dashboard extension (application layer)

When admin approves via `payment_notifications`, server/admin client MUST:

1. `UPDATE payment_notifications SET status = 'verified', verified_by, verified_at`
2. `INSERT INTO subscriptions (...)` with `source_channel = 'manual'`, `payment_notification_id`,
   `admin_approved_by`, `paid = true`, period fields
3. `UPDATE profiles` — `account_active = true`, `payment_status = 'verified'`,
   `subscription_status = 'active'`

Extend `approveUser` in `src/app/admin/dashboard/page.tsx` or add dedicated payment queue tab.

---

## 2. Backend API Pipeline

### 2.1 `POST /api/stripe/create-checkout`

**Path:** `src/app/api/stripe/create-checkout/route.ts`

| Step | Detail |
|------|--------|
| Runtime | `export const runtime = 'nodejs'` |
| Auth | `createServerClient` from `@/lib/supabase/server` → `getUser()` → 401 if null |
| Input | JSON `{ tier: 'referral' \| 'direct' }` |
| Price map | `STRIPE_PRICE_ID_REFERRAL` / `STRIPE_PRICE_ID_DIRECT` from env via `lib/stripe/prices.ts` |
| Stripe call | `stripe.checkout.sessions.create` |
| Correlation | **`client_reference_id: user.id`** (Supabase `auth.uid()`) |
| Metadata | `{ user_id: user.id, tier }` for webhook fallback |
| Mode | `subscription` |
| URLs | `success_url`: `{APP_URL}/{locale}/pricing?checkout=success` |
| | `cancel_url`: `{APP_URL}/{locale}/pricing?checkout=cancel` |
| Locale | Accept `locale` from body or `Accept-Language` / default `en` |
| Response | `{ url: session.url }` |
| Errors | 401 unauthorized, 400 bad tier, 500 Stripe failure (no secret leakage) |

**Supporting modules:**

- `src/lib/stripe/server.ts` — `new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion })`
- `src/lib/supabase/service.ts` — service role client; **import only from API routes**

**Not a Server Action:** Constitution and Stripe redirect flow require a dedicated API route
(returning URL to client). Client calls `fetch('/api/stripe/create-checkout', { method: 'POST' })`.

### 2.2 `POST /api/webhooks/stripe`

**Path:** `src/app/api/webhooks/stripe/route.ts`

| Step | Detail |
|------|--------|
| Runtime | `export const runtime = 'nodejs'` |
| Raw body | `const rawBody = await request.text()` — **never** `request.json()` first |
| Signature | Header `stripe-signature`; missing → 400 |
| Verify | `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` |
| Invalid sig | 400, no DB writes |
| Idempotency | `INSERT stripe_webhook_events (event_id, event_type) ON CONFLICT DO NOTHING`; if 0 rows → return 200 |
| DB client | `createServiceClient()` with `SUPABASE_SERVICE_ROLE_KEY` |

**Event switch (pseudocode structure — implement in route handler):**

```text
switch (event.type) {

  case 'checkout.session.completed':
    - session = event.data.object
    - userId = session.client_reference_id || session.metadata.user_id
    - subscriptionId = session.subscription
    - customerId = session.customer
    - tier = session.metadata.tier
  - Fetch Stripe Subscription for period_start/end, items[0].price.id
  - UPSERT subscriptions:
      user_id, tier, amount (from tier map), source_channel='stripe',
      stripe_customer_id, stripe_subscription_id, price_id,
      payment_method='stripe', payment_reference=session.id,
      paid=true, paid_at=now(), period_start, period_end
  - UPDATE profiles:
      account_active=true, payment_status='verified',
      subscription_status='active', subscription_tier=tier,
      payment_method='stripe', payment_verified_at=now()
    break

  case 'customer.subscription.updated':
    - sub = event.data.object
  - UPDATE subscriptions SET period_end, stripe_subscription_id
      WHERE stripe_subscription_id = sub.id
    break

  case 'customer.subscription.deleted':
    - sub = event.data.object
  - UPDATE profiles SET subscription_status='cancelled'
      WHERE id = (SELECT user_id FROM subscriptions
                  WHERE stripe_subscription_id = sub.id LIMIT 1)
  - If sub.cancel_at_period_end === false OR period ended:
      SET account_active=false, subscription_status='expired'
    break

  case 'invoice.payment_failed':
    - invoice = event.data.object
  - UPDATE profiles SET subscription_status='cancelled' OR add past_due flag
    break

  default:
    - log type; no op
}
```

**Stripe Dashboard:** Enable events: `checkout.session.completed`,
`customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

**Local dev:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 2.3 Environment variables (add to `.env.local.example`)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_REFERRAL=price_...
STRIPE_PRICE_ID_DIRECT=price_...
```

---

## 3. Frontend UI Flow

### 3.1 Pricing page — `src/app/[locale]/pricing/page.tsx`

**Current state:** Single "Upgrade to Premium" link to signup; no payment flows.

**Required changes:**

| Area | Change |
|------|--------|
| Auth probe | On mount: `getUser()`; store `isAuthenticated`, `profile` (`account_active`, tier) |
| Premium card CTAs | Replace single link with two buttons (stacked on mobile, row on `md+`) |
| Pay with Card | `handleStripeCheckout()` → POST create-checkout → redirect to `url` |
| Upload Receipt | Opens `ManualProofUpload` modal (`useState` or dialog) |
| Active subscriber | If `account_active`: show badge + disable CTAs; i18n `pricingCheckout.alreadyActive` |
| Unauthenticated | Both CTAs redirect to `/${locale}/auth/signin?returnUrl=/${locale}/pricing` |
| Query params | Read `checkout=success\|cancel` → render `CheckoutStatusBanner` |
| i18n | All new strings under `common.pricingCheckout` in en/ur |
| RTL | `flex gap-3`, `text-start`, `ps`/`pe` on buttons and modal |
| Hardcoded text | Move "Unlock video…", "Free", "PREMIUM" badge strings to i18n where missing |

**Tier selection:** Default tier from `profile.subscription_tier` (`referral` vs `direct`).
Optional tier toggle on Premium card if user has no tier yet.

### 3.2 Checkout success / cancel — landing UX

**No new routes.** Use pricing page query params:

| URL | Component | Behavior |
|-----|-----------|----------|
| `/[locale]/pricing?checkout=success` | `CheckoutStatusBanner` variant `success` | Thank user; note webhook may take seconds; poll profile `account_active` optional |
| `/[locale]/pricing?checkout=cancel` | `CheckoutStatusBanner` variant `cancel` | User cancelled Stripe; offer retry CTA |

**File:** `src/components/billing/CheckoutStatusBanner.tsx` — dismissible banner at top of pricing hero.

### 3.3 Manual proof upload — `src/components/billing/ManualProofUpload.tsx`

| Step | Implementation |
|------|----------------|
| Display | Bank details (reuse amounts 3999/4999 from profile tier; mirror payment-instructions data) |
| Generate id | `crypto.randomUUID()` for `notificationId` before upload |
| Validate file | MIME whitelist + size ≤ 10MB client-side |
| Storage path | `{userId}/{notificationId}/{sanitizedFilename}` |
| Upload | `supabase.storage.from('payment-proofs').upload(path, file)` |
| DB insert | `payment_notifications`: user_id, email, amount, payment_method, transaction_id, screenshot_url=path, status=pending |
| Success UI | i18n pending message; close modal |
| Error UI | i18n upload/validation errors |

Auth required — component assumes parent verified session.

### 3.4 `useSubscription.ts` alignment

```text
hasPremium = profile.account_active === true
tier = hasPremium ? 'premium' : 'free'
```

Remove reliance on `subscription_tier === 'premium' \| 'bureau'` strings that do not match schema.

### 3.5 Admin dashboard

- Add payment notifications queue (pending `payment_notifications`)
- On verify: create `subscriptions` row per §1 admin extension
- Set `admin_approved_by` to current admin id

---

## 4. File Impact Matrix

| File | Action | Purpose |
|------|--------|---------|
| `supabase/hybrid-billing-migration.sql` | CREATE | DB + Storage |
| `src/app/api/stripe/create-checkout/route.ts` | CREATE | Checkout Session |
| `src/app/api/webhooks/stripe/route.ts` | CREATE | Webhook handler |
| `src/lib/stripe/server.ts` | CREATE | Stripe SDK |
| `src/lib/stripe/prices.ts` | CREATE | Tier → price_id |
| `src/lib/supabase/service.ts` | CREATE | Service role client |
| `src/app/[locale]/pricing/page.tsx` | MODIFY | Dual CTAs |
| `src/components/billing/ManualProofUpload.tsx` | CREATE | Manual flow |
| `src/components/billing/CheckoutStatusBanner.tsx` | CREATE | Success/cancel |
| `src/hooks/useSubscription.ts` | MODIFY | account_active |
| `src/app/admin/dashboard/page.tsx` | MODIFY | subscriptions on verify |
| `locales/en/common.json` | MODIFY | pricingCheckout |
| `locales/ur/common.json` | MODIFY | pricingCheckout |
| `.env.local.example` | MODIFY | Stripe keys |
| `package.json` | MODIFY | add `stripe` |

---

## 5. Verification Gates (pre-merge)

1. Migration applies cleanly on staging Supabase.
2. Stripe test Checkout → webhook → `subscriptions` + `account_active`.
3. Duplicate webhook `event_id` does not double-activate.
4. Manual upload → Storage + `payment_notifications`.
5. Cross-user proof access denied (RLS).
6. Admin verify → manual `subscriptions` row with `admin_approved_by`.
7. `/ur/pricing` RTL on CTAs and modal.
8. Invalid webhook signature → 400, zero DB changes.

See `quickstart.md` for step-by-step local setup.

---

## 6. Phase 2 Boundary (NOT in this command)

`/speckit-tasks` will generate `tasks.md` with ordered implementation tasks.
**No Next.js application code** is produced by this plan document.

---

## Related Artifacts

| Artifact | Path |
|----------|------|
| Constitution | `.specify/monetization-stripe-hybrid/constitution.md` |
| Research | `specs/001-phase-c-monetization/research.md` |
| Data model | `specs/001-phase-c-monetization/data-model.md` |
| Contracts | `specs/001-phase-c-monetization/contracts/` |
| Quickstart | `specs/001-phase-c-monetization/quickstart.md` |
