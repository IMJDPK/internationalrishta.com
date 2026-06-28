# Contract — `POST /api/stripe/create-checkout`

**Auth:** Supabase session cookie (authenticated users only)  
**Runtime:** Node.js

## Request

```json
{
  "tier": "premium_monthly" | "premium_quarterly",
  "locale": "en" | "ur"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `tier` | yes | Checkout plan id; maps to Stripe Price via env |
| `locale` | no | Redirect locale for success/cancel URLs; defaults to `en` |

### Tier → Stripe Price mapping

| `tier` | Env var | `profiles.subscription_tier` |
|--------|---------|------------------------------|
| `premium_monthly` | `STRIPE_PRICE_PREMIUM_MONTHLY` | `referral` |
| `premium_quarterly` | `STRIPE_PRICE_PREMIUM_QUARTERLY` | `direct` |

## Success `200`

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

Client redirects: `window.location.href = url`

## Errors

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized" }` | No session |
| 400 | `{ "error": "Invalid tier" }` | Missing/invalid `tier` |
| 500 | `{ "error": "Checkout failed" }` | Stripe / config error |

## Server behavior (non-code spec)

1. Resolve user via `createServerClient` + `getUser()`
2. Validate `tier` with `isBillingPlanTier()` (`premium_monthly` \| `premium_quarterly`)
3. Map `tier` → `STRIPE_PRICE_PREMIUM_MONTHLY` or `STRIPE_PRICE_PREMIUM_QUARTERLY`
4. Map plan to subscription tier: monthly → `referral`, quarterly → `direct`
5. `stripe.checkout.sessions.create`:
   - `mode: 'subscription'`
   - `line_items: [{ price: priceId, quantity: 1 }]`
   - `client_reference_id: user.id`
   - `metadata: { user_id, plan, tier }` where `plan` is billing plan tier and `tier` is subscription tier
   - `success_url: ${APP_URL}/${locale}/pricing?checkout=success`
   - `cancel_url: ${APP_URL}/${locale}/pricing?checkout=cancel`
6. Return `session.url`

## Forbidden

- Exposing `STRIPE_SECRET_KEY` to client
- Creating Checkout without `client_reference_id`
