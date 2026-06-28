# QA Runbook — Hybrid Billing (T056–T064)

**Branch:** `001-phase-c-monetization`  
**Constitution:** `.specify/monetization-stripe-hybrid/constitution.md`  
**Prerequisites:** Phase 1 migration applied, `.env.local` configured, Stripe test keys

---

## Environment checklist

| Variable | Required for |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All flows |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client upload + auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks + admin approval API |
| `STRIPE_SECRET_KEY` | Checkout + webhook verify |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` locally |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Checkout (hosted) |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | Monthly plan `price_...` |
| `STRIPE_PRICE_PREMIUM_QUARTERLY` | Quarterly plan `price_...` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |

1. Apply `supabase/hybrid-billing-migration.sql` (or `supabase/migrations/20260629203000_monetization_hybrid.sql`).
2. Confirm `payment-proofs` bucket is **private** and Storage policies exist.
3. Create test accounts: **User A**, **User B**, and **Admin** (row in `admin_users`).
4. Run `npm run dev` → `http://localhost:3000`

---

## Stripe CLI setup (Intel Mac) — T056

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the displayed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`, then restart `npm run dev`.

Keep `stripe listen` running in a separate terminal during checkout tests.

---

## T057 — Stripe Checkout → webhook → DB (US1)

**Goal:** Card payment creates `subscriptions` row and activates profile.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as User A | Session cookie present |
| 2 | Open `http://localhost:3000/en/pricing` | Two premium cards with dual CTAs |
| 3 | Click **Pay with Card** on Monthly plan | Redirect to Stripe Checkout |
| 4 | Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC | Payment succeeds |
| 5 | Return to `/en/pricing?checkout=success` | Green success banner |
| 6 | `stripe listen` terminal | `checkout.session.completed` forwarded |
| 7 | Supabase SQL: | |
| | `SELECT source_channel, stripe_subscription_id, paid FROM subscriptions WHERE user_id = 'USER_A_ID' ORDER BY created_at DESC LIMIT 1;` | `source_channel = stripe`, `paid = true`, stripe ids set |
| 8 | `SELECT account_active, payment_status FROM profiles WHERE id = 'USER_A_ID';` | `account_active = true`, `payment_status = verified` |

**Pass:** One subscription row; profile active; premium CTAs disabled on pricing page.

---

## T058 — Webhook idempotency (US4)

**Goal:** Duplicate `event.id` does not double-activate.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Note latest `stripe_webhook_events.id` from T057 | Row exists |
| 2 | Replay same event (Stripe Dashboard → Events → Resend) OR CLI resend | Webhook returns `200 { received: true }` |
| 3 | Count subscriptions for User A with same `stripe_subscription_id` | Exactly **one** row |
| 4 | `stripe_webhook_events` | Still **one** row per `event.id` (PK conflict skipped) |

**Pass:** No duplicate subscription insert; idempotency lock works.

---

## T059 — Subscription deleted lifecycle (US4)

**Goal:** Cancellation updates profile per end-of-period policy.

| Step | Action | Expected |
|------|--------|----------|
| 1 | With active Stripe sub from T057, run: `stripe trigger customer.subscription.deleted` | Webhook received |
| 2 | Check `profiles.subscription_status` for User A | `cancelled` or `expired` per period end |
| 3 | If period not ended, `account_active` may remain `true` until `period_end` | Matches `research.md` R5 |

**Pass:** Handler runs without 500; status fields updated appropriately.

---

## T060 — Manual proof upload (US2)

**Goal:** Upload creates Storage object + `payment_notifications` row.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as User B (not premium) | Auth OK |
| 2 | Open pricing → **Upload Bank Receipt** on a plan | `ManualProofUpload` modal opens |
| 3 | Upload small PNG or PDF (&lt; 10 MB) + optional transaction ID | Submit succeeds |
| 4 | Success message in modal (i18n) | Pending state shown |
| 5 | Supabase: `SELECT * FROM payment_notifications WHERE user_id = 'USER_B_ID' ORDER BY created_at DESC LIMIT 1;` | `status = pending`, `screenshot_url` set |
| 6 | Storage path format | `{userId}/{uuid}_receipt.{ext}` under `payment-proofs` |

**Pass:** Notification row + private storage object under User B folder.

---

## T061 — Storage RLS cross-user denial (US2)

**Goal:** User B cannot read User A's proof.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Copy User A's `screenshot_url` from `payment_notifications` | Path known |
| 2 | As User B in browser console / client: attempt `storage.from('payment-proofs').download(userAPath)` | Error or empty (403 / policy deny) |
| 3 | As User A | Download/list own path succeeds |

**Pass:** Cross-user proof access denied by RLS.

---

## T062 — Admin manual approval (US3)

**Goal:** Approve creates manual `subscriptions` row and activates profile.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as Admin → `/admin/dashboard` | Admin access OK |
| 2 | Open **Manual Payments** tab | User B pending notification visible |
| 3 | Click **Approve** | Success toast |
| 4 | SQL: `SELECT source_channel, admin_approved_by, payment_notification_id FROM subscriptions WHERE user_id = 'USER_B_ID' ORDER BY created_at DESC LIMIT 1;` | `source_channel = manual`, `admin_approved_by` = admin id |
| 5 | `profiles.account_active` for User B | `true` |

**Pass:** Manual subscription ledger + activation.

---

## T063 — RTL UI on `/ur/pricing` (US1 + US2)

**Goal:** Logical layout in Urdu locale.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `http://localhost:3000/ur/pricing` | Urdu strings; `dir=rtl` on document |
| 2 | Premium cards grid | Three columns stack gracefully; text `text-start` aligned |
| 3 | Dual CTAs on premium card | Buttons full-width; no overflow |
| 4 | Open **Upload Bank Receipt** | Modal text RTL; form fields readable |
| 5 | Visit `?checkout=success` and `?checkout=cancel` | Banners align with `border-s-*`, dismiss works |
| 6 | No `ml-`/`mr-`/`left-`/`right-` on new billing UI | DevTools class audit (optional) |

**Pass:** Visual RTL sanity on pricing, banner, and modal.

---

## T064 — Static audit sign-off

**Run on:** 2026-06-29 (update date when you execute)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS |
| `console.log` in billing stack | **None** (`src/lib/billing`, `src/components/billing`, pricing API routes, `useSubscription`) |
| `console.error` in API routes | Present only for server error paths (create-checkout, webhooks, admin approve) — acceptable |
| `any` in billing stack | **None** in Phase C billing modules; admin dashboard pending rows typed |

**Billing files audited:**

- `src/lib/billing/*`
- `src/components/billing/*`
- `src/app/api/stripe/create-checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/admin/approve-manual-payment/route.ts`
- `src/app/[locale]/pricing/page.tsx`
- `src/hooks/useSubscription.ts`

---

## Sign-off

| Tester | Date | T057–T063 | Notes |
|--------|------|-----------|-------|
| | | ☐ | |

Feature ready for merge when all boxes checked and T064 audit row confirmed.
