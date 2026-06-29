# Data Model — Bureau Partners Directory

**Branch:** `20260629-203913-bureau-partners-directory`  
**Constitution:** `.specify/bureau-partners-directory/constitution.md`

## Entity Relationship

```text
profiles (1) ── referred_by ──> marriage_bureaus (1)
marriage_bureaus (1) ──< bureau_commissions (N)
profiles (1) ──< bureau_commissions (N)  [referred user]
subscriptions (1) ──< bureau_commissions (1)  [UNIQUE subscription_id]
admin_users (1) ──< marriage_bureaus.approved_by
```

## `public.marriage_bureaus` (extended)

| Field | Type | Notes |
|-------|------|-------|
| `is_approved` | `boolean` | Directory gate; default `false` |
| `commission_type` | `text` | `'flat'` \| `'percentage'` |
| `commission_rate` | `numeric(10,4)` | Decimal rate or flat PKR |
| `approved_at` | `timestamptz` | Set on approval |
| `approved_by` | `uuid` FK | → `admin_users` |

Existing: `owner_id`, `referral_code`, `status`, `verified`, `total_referrals`, etc.

## `public.profiles` (referral)

| Field | Type | Notes |
|-------|------|-------|
| `referred_by_bureau_id` | `uuid` FK | Write-once for end-users (trigger) |
| `referral_code` | `text` | Audit copy of code used |

## `public.bureau_commissions` (new)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `uuid` PK | |
| `bureau_id` | `uuid` FK | Earning bureau |
| `user_id` | `uuid` FK | Referred member |
| `subscription_id` | `uuid` FK UNIQUE | Idempotency key |
| `subscription_amount` | `numeric(10,2)` | PKR at activation |
| `commission_type` | `text` | Snapshot |
| `commission_rate` | `numeric(10,4)` | Snapshot |
| `commission_amount` | `numeric(10,2)` | Computed payout |
| `status` | `text` | `accrued` \| `paid` \| `void` |

## State transitions

### Bureau approval

```text
registration submit → status=pending, is_approved=false
admin approve       → status=approved, verified=true, is_approved=true
admin reject        → status=rejected, is_approved=false
```

### Commission accrual

```text
subscription paid=true (tier=referral) + referred_by_bureau_id set
  → INSERT bureau_commissions (status=accrued)
  → UPDATE subscriptions.bureau_id, commission_amount
```

### Rate change mid-cycle

```text
Existing bureau_commissions rows: immutable
Next subscription activation: snapshots new commission_type/rate
```
