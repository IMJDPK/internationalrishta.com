# Quickstart — Hybrid Billing

**Branch:** `001-phase-c-monetization`

## 1. Dependencies

```bash
npm install stripe
```

## 2. Environment (`.env.local`)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_REFERRAL=price_...
STRIPE_PRICE_ID_DIRECT=price_...
SUPABASE_SERVICE_ROLE_KEY=...  # already required
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Database

Run in Supabase SQL Editor:

1. `supabase/hybrid-billing-migration.sql` (created during implementation from plan §1)

## 4. Stripe CLI (local webhook)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy `whsec_...` to `STRIPE_WEBHOOK_SECRET`.

## 5. Dev server

```bash
npm run dev
```

## 6. Manual test — Stripe

1. Sign in → `/en/pricing`
2. Click **Pay with Card** → complete test card `4242...`
3. Return to pricing with `?checkout=success`
4. Verify `subscriptions` row + `profiles.account_active = true`

## 7. Manual test — Bank receipt

1. Click **Upload Bank Receipt**
2. Upload PNG proof + transaction id
3. Verify `payment_notifications` + Storage object
4. Admin dashboard → approve → `account_active = true`

## 8. Verify RLS

- Second user cannot SELECT first user's proof path via Storage API
