# Contract — Bureau Directory UI

**Route:** `/[locale]/bureau`  
**Components:** `BureauDirectory`, `BureauDirectorySearch`, `BureauCard`, `BureauDirectoryEmpty`

## Data query

| Rule | Value |
|------|-------|
| Table | `marriage_bureaus` |
| Filter | `is_approved = true` (required in query + RLS) |
| Sort | `city` ascending |
| Fields | `id, name, city, address, phone, email, referral_code, rating, total_referrals` |

## Search

- Client filter on `city` (case-insensitive contains)
- Empty filter shows all approved bureaus

## Card content

| Element | i18n key |
|---------|----------|
| Bureau name | (data) |
| City / address | (data) |
| Referral code label | `common.bureau.directory.referralCode` |
| Copy button | `common.bureau.directory.copyCode` |
| Phone CTA | `common.bureau.directory.call` |
| Email CTA | `common.bureau.directory.email` |
| Referral count | `common.bureau.directory.referrals` |

## RTL

- All spacing: logical Tailwind (`ms-`, `me-`, `text-start`)
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## Forbidden

- Mock bureau arrays in production code path
- Display `owner_id`, `payment_receipt_url`, `approved_by`
