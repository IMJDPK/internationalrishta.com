# Quickstart — Bureau Partners Directory (Phase D)

## Prerequisites

- Phase C billing deployed (subscriptions activation paths live)
- Supabase CLI or dashboard access
- Branch: `20260629-203913-bureau-partners-directory`

## 1. Apply migration

```bash
# From repo root — paste SQL or run migration file
supabase db push
# OR execute supabase/migrations/20260629210000_bureau_partners.sql in SQL editor
```

## 2. Seed test bureau (SQL editor)

```sql
-- After creating a test auth user, insert pending bureau then approve via admin
UPDATE marriage_bureaus
SET is_approved = true, status = 'approved', verified = true,
    commission_type = 'percentage', commission_rate = 0.20
WHERE referral_code = 'TEST-LHE';
```

## 3. Test referral flow

1. Visit `http://localhost:3000/en/auth/signup?ref=TEST-LHE`
2. Complete signup
3. Verify profile: `SELECT referred_by_bureau_id, referral_code FROM profiles WHERE id = '<user_id>';`

## 4. Test directory

1. Open `http://localhost:3000/en/bureau`
2. Confirm only `is_approved = true` bureaus appear
3. Repeat on `http://localhost:3000/ur/bureau` for RTL

## 5. Test commission accrual

1. Set user `referred_by_bureau_id` to approved bureau
2. Activate referral-tier subscription (Stripe test or manual admin approve)
3. Verify: `SELECT * FROM bureau_commissions WHERE user_id = '<user_id>';`
4. Replay webhook — confirm no duplicate row

## 6. Stripe CLI (optional)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Complete checkout for `premium_monthly` (maps to `referral` tier) and check accrual.
