# Contract — `POST /api/stripe/create-checkout`

**Auth:** Supabase session cookie (authenticated users only)  
**Runtime:** Node.js

## Request

```json
{
  "tier": "referral" | "direct"
}
```

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
| 400 | `{ "error": "Invalid tier" }` | Bad tier |
| 500 | `{ "error": "Checkout failed" }` | Stripe / config error |

## Server behavior (non-code spec)

1. Resolve user via `createServerClient` + `getUser()`
2. Map `tier` → `STRIPE_PRICE_ID_REFERRAL` or `STRIPE_PRICE_ID_DIRECT`
3. `stripe.checkout.sessions.create`:
   - `mode: 'subscription'`
   - `line_items: [{ price: priceId, quantity: 1 }]`
   - `client_reference_id: user.id`
   - `metadata: { user_id, tier }`
   - `success_url: ${APP_URL}/${locale}/pricing?checkout=success`
   - `cancel_url: ${APP_URL}/${locale}/pricing?checkout=cancel`
4. Return session.url

## Forbidden

- Exposing `STRIPE_SECRET_KEY` to client
- Creating Checkout without `client_reference_id`
