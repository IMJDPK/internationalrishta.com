# Data Model — Hybrid Billing

**Branch:** `001-phase-c-monetization`  
**Constitution:** `.specify/monetization-stripe-hybrid/constitution.md`

## Entity Relationship

```text
profiles (1) ──< subscriptions (N)
profiles (1) ──< payment_notifications (N)
payment_notifications (1) ── optional FK ── subscriptions (1)
admin_users (1) ──< subscriptions.admin_approved_by
storage.objects (payment-proofs) ── referenced by payment_notifications.screenshot_url
stripe_webhook_events (audit / idempotency)
```

## `public.subscriptions` (extended)

| Field | Type | Notes |
|-------|------|-------|
| `source_channel` | `text` CHECK `stripe\|manual` | Required when `paid = true` |
| `stripe_customer_id` | `text` | Stripe path |
| `stripe_subscription_id` | `text` UNIQUE (partial) | Stripe path |
| `price_id` | `text` | Stripe Price id |
| `payment_notification_id` | `uuid` FK | Manual path |
| `admin_approved_by` | `uuid` FK → `admin_users` | Manual path after verify |

**Invariant (application-enforced):**

- `source_channel = 'stripe'` → stripe ids + price_id NOT NULL; manual FKs NULL
- `source_channel = 'manual'` → `payment_notification_id` + `admin_approved_by` NOT NULL when paid; stripe fields NULL

## `public.payment_notifications` (existing)

No schema change required. `screenshot_url` stores storage path (not public URL).

## `public.profiles` (activation fields — existing)

| Field | Stripe webhook | Admin manual |
|-------|----------------|--------------|
| `payment_status` | `verified` | `verified` |
| `account_active` | `true` | `true` |
| `subscription_tier` | `referral` or `direct` from metadata | from profile / notification amount |
| `subscription_status` | `active` | `active` |
| `payment_method` | `stripe` | `raast` / `hbl` / etc. |

## `public.stripe_webhook_events` (new)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `text` PK | Stripe event id (e.g. `evt_...`) |
| `type` | `text` NOT NULL | e.g. `checkout.session.completed` |
| `created_at` | `timestamptz` | default `now()` — row insert time |
| `processed_at` | `timestamptz` | default `now()` — handler completion time |

RLS enabled with **no policies** — service role only.

## State transitions

### Manual path

```text
payment_notifications.status:
  pending → verified | rejected

profiles.account_active:
  false → true (on admin verify + subscription row)

subscriptions:
  INSERT on admin verify (paid=true, source_channel=manual)
```

### Stripe path

```text
checkout.session.completed:
  INSERT subscriptions (paid=true, source_channel=stripe)
  UPDATE profiles (account_active=true)

customer.subscription.deleted:
  profiles.subscription_status = cancelled
  account_active remains true until period_end (then false via job or subscription.updated)

invoice.payment_failed:
  profiles.subscription_status or flag → past_due (extend profiles or subscription row)
```

## Storage: `payment-proofs`

| Property | Value |
|----------|-------|
| Public | `false` |
| Max size | 10 MB (app + optional bucket config) |
| MIME | jpeg, png, webp, pdf |
| Path | `{user_id}/{uuid}_receipt.{ext}` |
