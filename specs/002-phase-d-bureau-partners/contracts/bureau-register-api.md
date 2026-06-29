# Contract — `POST /api/bureau/register`

**Auth:** Authenticated users only  
**Runtime:** Node.js  
**Content-Type:** `application/json` (MVP) or `multipart/form-data` (future proof upload)

## Request (JSON core fields)

```json
{
  "name": "Royal Marriage Bureau",
  "city": "Lahore",
  "address": "Model Town",
  "phone": "+923001234567",
  "email": "bureau@example.com",
  "license_number": "LHE-2026-001",
  "payment_receipt_path": null
}
```

### MVP — payment proof (optional)

`payment_receipt_path` is **optional in Phase D MVP**. The registration form MAY show an upload control for future use, but:

- Submission MUST succeed without a receipt path.
- No Storage upload is required for MVP sign-off.
- Admin manually verifies the PKR 20,000 application fee outside this API.

## Success `201`

```json
{
  "bureauId": "uuid",
  "referralCode": "ROYAL-LHE",
  "status": "pending"
}
```

## Errors

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized" }` | No session |
| 400 | `{ "error": "Validation failed" }` | Missing required fields |
| 409 | `{ "error": "Duplicate license" }` | `license_number` taken |

## Server behavior

1. `owner_id = auth.uid()`
2. Generate unique `referral_code`
3. INSERT with `is_approved=false`, `status='pending'`, default commission `percentage` / `0.20`
4. INSERT `bureau_notifications` row for admin queue
5. Persist `payment_receipt_url` only when `payment_receipt_path` is provided (optional)

## Forbidden

- Client setting `is_approved=true`
- Client choosing own `referral_code` without uniqueness validation
