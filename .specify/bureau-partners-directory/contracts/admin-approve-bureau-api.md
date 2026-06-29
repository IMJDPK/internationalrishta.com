# Contract — `POST /api/admin/approve-bureau`

**Auth:** `admin_users` only  
**Runtime:** Node.js

## Request

```json
{
  "bureauId": "uuid",
  "action": "approve" | "reject",
  "commissionType": "percentage" | "flat",
  "commissionRate": 0.2
}
```

`commissionType` / `commissionRate` required when `action=approve`.

## Success `200`

```json
{
  "bureauId": "uuid",
  "isApproved": true,
  "status": "approved"
}
```

## Errors

| Status | Body | Cause |
|--------|------|-------|
| 401 | `{ "error": "Unauthorized" }` | Not admin |
| 400 | `{ "error": "Invalid commission" }` | Rate ≤ 0 or bad type |
| 404 | `{ "error": "Bureau not found" }` | |

## Approve behavior

Sets atomically: `is_approved=true`, `status='approved'`, `verified=true`, `approved_at`, `approved_by`, commission fields.

## Reject behavior

Sets: `is_approved=false`, `status='rejected'`.
