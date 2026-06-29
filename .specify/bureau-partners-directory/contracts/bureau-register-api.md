# Contract — `POST /api/bureau/register`

**Auth:** Authenticated users only  
**Runtime:** Node.js  
**Content-Type:** `application/json` or `multipart/form-data` (if proof upload)

## Request (JSON core fields)

```json
{
  "name": "Royal Marriage Bureau",
  "city": "Lahore",
  "address": "Model Town",
  "phone": "+923001234567",
  "email": "bureau@example.com",
  "license_number": "LHE-2026-001",
  "payment_receipt_path": "optional-storage-path"
}
```

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

## Forbidden

- Client setting `is_approved=true`
- Client choosing own `referral_code` without uniqueness validation
