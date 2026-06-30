# Contract — `POST /api/referral/attribute`

**Auth:** Supabase session required  
**Runtime:** Node.js

## Request

No body. Server reads `ir_bureau_ref` httpOnly cookie set by middleware.

## Success `200`

```json
{
  "attributed": true,
  "bureauId": "uuid",
  "referralCode": "ROYAL-LHE"
}
```

## Skipped `200`

```json
{
  "attributed": false,
  "reason": "already_set" | "invalid_code" | "no_cookie"
}
```

## Errors

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized" }` | No session |

## Server behavior

1. `getUser()` via server Supabase client
2. Read `ir_bureau_ref` cookie
3. Call `attributeReferralForUser(userId, code)`
4. Clear cookie on success or invalid code
5. Return JSON

## Forbidden

- Client sending `bureau_id` directly in body
- Updating `referred_by_bureau_id` when already set
