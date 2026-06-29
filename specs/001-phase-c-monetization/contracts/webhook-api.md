# Contract — `POST /api/webhooks/stripe`

**Auth:** Stripe signature (`stripe-signature` header)  
**Runtime:** Node.js (raw body required)

## Request

- Body: raw Stripe event JSON (unparsed until verified)
- Header: `stripe-signature`

## Success `200`

```json
{ "received": true }
```

## Errors

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{ "error": "Missing signature" }` | No header |
| 400 | `{ "error": "Invalid signature" }` | Verification failed |
| 500 | `{ "error": "Handler failed" }` | DB error after verify |

## Event handlers

| Event | DB action (service role) |
|-------|--------------------------|
| `checkout.session.completed` | Idempotency check → UPSERT `subscriptions` → UPDATE `profiles` |
| `customer.subscription.updated` | Sync `period_end`, `stripe_subscription_id` |
| `customer.subscription.deleted` | `subscription_status = cancelled`; schedule deactivation |
| `invoice.payment_failed` | Mark past_due / notify |

## Idempotency

Before handler: `INSERT INTO stripe_webhook_events (event_id, event_type) ON CONFLICT DO NOTHING`
If conflict → return 200 immediately.

## Forbidden

- Parsing `request.json()` before `constructEvent`
- Using anon Supabase client for writes
