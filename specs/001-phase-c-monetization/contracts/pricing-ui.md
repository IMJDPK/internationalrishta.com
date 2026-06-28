# Contract — Pricing UI & Manual Upload

**Route:** `src/app/[locale]/pricing/page.tsx`  
**i18n:** `common.pricingPage`, `common.pricingCheckout`

## Premium card CTAs

| CTA | Auth | Action |
|-----|------|--------|
| Pay with Card | Required | POST `/api/stripe/create-checkout` → redirect |
| Upload Bank Receipt | Required | Open `ManualProofUpload` modal |

## Query param states

| Param | UI |
|-------|-----|
| `checkout=success` | Success banner; "processing" if webhook pending |
| `checkout=cancel` | Cancel banner |
| (none) | Default |

## `ManualProofUpload` component (new)

**Path:** `src/components/billing/ManualProofUpload.tsx`

| Step | Action |
|------|--------|
| 1 | Show bank details (from i18n / shared config) |
| 2 | File input: image/pdf, max 10MB |
| 3 | Optional `transaction_id` field |
| 4 | Upload to `payment-proofs/{userId}/{notificationId}/{file}` |
| 5 | INSERT `payment_notifications` with `screenshot_url` = path |
| 6 | Show pending state via i18n |

## RTL

All new UI uses logical Tailwind (`ps`, `pe`, `text-start`, `start-*`).

## `useSubscription` update

`hasPremium` = `profile.account_active === true` (not tier string heuristics).
