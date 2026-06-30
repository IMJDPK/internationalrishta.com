# Phase D QA Runbook — Bureau Partners Directory

**Branch:** `20260629-203913-bureau-partners-directory`  
**Constitution:** `.specify/bureau-partners-directory/constitution.md`  
**Spec:** `specs/002-phase-d-bureau-partners/spec.md`  
**Generated:** 2026-06-29 (Phase 6 — T062)

---

## Prerequisites

| Item | Requirement |
|------|-------------|
| Environment | Local `npm run dev` or staging with Supabase + Phase C billing |
| Migration | `supabase/migrations/20260629211647_bureau_partners.sql` applied |
| Auth redirect | `/auth/callback` in Supabase Auth redirect URLs (Google OAuth) |
| Admin user | Row in `admin_users` for approval flows |
| Tools | Browser DevTools (Application → Cookies), Supabase SQL Editor |

**Commission math reference**

| Type | Formula |
|------|---------|
| `percentage` | `commission_amount = round(subscription_amount × commission_rate, 2)` |
| `flat` | `commission_amount = commission_rate` (PKR) |

Example: PKR 3,999 × `0.20` → **PKR 799.80**

---

## Static audit checklist (T067–T069)

| Check | Command / action | Expected | Result |
|-------|------------------|----------|--------|
| T067 TypeScript | `npx tsc --noEmit` | Exit 0 | ☐ PASS |
| T068 No mock bureaus | `rg mockBureaus src/components/bureau src/app/[locale]/bureau` | No matches | ☐ PASS |
| T069 No debug logs | `rg console\.log src/lib/bureau/` | No matches | ☐ PASS |

---

## US3 — Referral flow (AC3.1–AC3.5, SC-002)

**Maps:** `src/middleware.ts`, `src/lib/bureau/referral-cookie.ts`, `src/app/api/referral/attribute/route.ts`, `src/app/auth/callback/route.ts`

### R1 — Middleware cookie capture (AC3.1)

1. Ensure an **approved** bureau exists with known `referral_code` (e.g. `ROYAL-LHE`).
   ```sql
   SELECT id, referral_code, is_approved FROM marriage_bureaus
   WHERE referral_code = 'ROYAL-LHE' AND is_approved = true;
   ```
2. Open a **private/incognito** window.
3. Visit: `http://localhost:3000/en/auth/signup?ref=ROYAL-LHE`
4. DevTools → **Application** → **Cookies** → your origin.
5. Confirm cookie **`ir_bureau_ref`** exists with value `ROYAL-LHE` (or normalized uppercase).
6. Confirm cookie flags: **HttpOnly**, **SameSite=Lax**, path `/`.

| Step | Pass? | Notes |
|------|-------|-------|
| R1 cookie set | ☐ | |

### R2 — Email signup attribution (AC3.2)

1. Complete email signup on the same session (after R1).
2. After signup, confirm `POST /api/referral/attribute` ran (Network tab) or OAuth used `/auth/callback`.
3. In Supabase SQL:
   ```sql
   SELECT id, referred_by_bureau_id, referral_code
   FROM profiles
   WHERE email = '<test_email>';
   ```
4. `referred_by_bureau_id` MUST equal the approved bureau id; `referral_code` MUST match.

| Step | Pass? | Notes |
|------|-------|-------|
| R2 profile attributed | ☐ | |

### R3 — Invalid / unapproved code (AC3.3)

1. New incognito session; visit signup with `?ref=INVALID-XXX` or code for **pending** bureau.
2. Complete signup.
3. Confirm `referred_by_bureau_id` IS NULL.
4. UI shows non-blocking warning (`common.bureau.referral.invalidCode`) — signup still succeeds.

| Step | Pass? | Notes |
|------|-------|-------|
| R3 invalid code warning | ☐ | |

### R4 — Write-once guard (AC3.4)

1. Attempt to change `referred_by_bureau_id` via client/profile update as end-user.
2. Expect rejection (trigger / API skip `already_set`).

| Step | Pass? | Notes |
|------|-------|-------|
| R4 immutable referral | ☐ | |

### R5 — Accrual without cookie (AC3.5)

1. User from R2 with attribution set; clear `ir_bureau_ref` cookie manually.
2. Activate referral-tier subscription (manual or Stripe).
3. Commission MUST still accrue via `profiles.referred_by_bureau_id`.

| Step | Pass? | Notes |
|------|-------|-------|
| R5 cookie not required at pay | ☐ | |

---

## US1 — Registration gate & admin approval (AC1.1–AC1.5, SC-006)

**Maps:** `BureauRegisterGate.tsx`, `POST /api/bureau/register`, `POST /api/admin/approve-bureau`, admin dashboard

### G1 — Bureau registration submit (AC1.1, AC1.2)

1. Sign in as a user **without** an existing bureau row.
2. Visit `http://localhost:3000/en/bureau/register` — full application form visible.
3. Submit required fields (payment receipt optional per MVP).
4. SQL verify:
   ```sql
   SELECT owner_id, is_approved, status, commission_type, commission_rate, referral_code
   FROM marriage_bureaus
   WHERE owner_id = '<user_id>'
   ORDER BY created_at DESC LIMIT 1;
   ```
5. Expect: `is_approved = false`, `status = 'pending'`, `commission_type = 'percentage'`, `commission_rate = 0.2000`, unique `referral_code`.

| Step | Pass? | Notes |
|------|-------|-------|
| G1 row created | ☐ | |
| G1 under 30s in admin queue (SC-006) | ☐ | |

### G2 — Register gate intercept (AC1.5)

1. Revisit `http://localhost:3000/en/bureau/register` as same owner.
2. **Form MUST NOT appear** — pending status UI from `BureauRegisterGate` instead.
3. Repeat on `http://localhost:3000/ur/bureau/register` — RTL layout, logical spacing, no overlap.

| Step | Pass? | Notes |
|------|-------|-------|
| G2 EN gate | ☐ | |
| G2 UR RTL gate (SC-005) | ☐ | |

### G3 — Admin approve with commission (AC1.3, AC1.4)

1. Admin → **Pending Bureaus** tab (`is_approved = false`).
2. Set commission: e.g. **percentage** `0.25` (25%) or **flat** `500`.
3. Approve via `POST /api/admin/approve-bureau`.
4. SQL:
   ```sql
   SELECT is_approved, status, verified, approved_at, approved_by,
          commission_type, commission_rate, referral_code
   FROM marriage_bureaus WHERE id = '<bureau_id>';
   ```
5. Expect: `is_approved = true`, `status = 'approved'`, `verified = true`, commission fields saved.

| Step | Pass? | Notes |
|------|-------|-------|
| G3 admin approve | ☐ | |

### G4 — Admin reject

1. Register second test bureau; admin **Reject**.
2. Expect: `is_approved = false`, `status = 'rejected'`; owner sees rejected status on register page.

| Step | Pass? | Notes |
|------|-------|-------|
| G4 reject flow | ☐ | |

### G5 — Referral code uniqueness

1. Register two bureaus with same city/name pattern.
2. Confirm distinct `referral_code` values (collision suffix if needed).

| Step | Pass? | Notes |
|------|-------|-------|
| G5 unique codes | ☐ | |

---

## US2 — Directory UI (AC2.1–AC2.5, SC-001, SC-005)

**Maps:** `src/components/bureau/BureauDirectory.tsx`, `src/app/[locale]/bureau/page.tsx`

### D1 — Approved-only listing (AC2.1, SC-001)

1. Seed one **pending** (`is_approved = false`) and one **approved** bureau.
2. Open `http://localhost:3000/en/bureau`.
3. Only approved bureau appears; pending never listed.

| Step | Pass? | Notes |
|------|-------|-------|
| D1 no leakage | ☐ | |

### D2 — URL search (AC2.2)

1. Visit `http://localhost:3000/en/bureau?q=Royal&city=LHE`.
2. Grid filters correctly; shareable URL preserves state after refresh.
3. Visit with city that matches nothing → localized **empty state** (not error).

| Step | Pass? | Notes |
|------|-------|-------|
| D2 search + empty | ☐ | |

### D3 — Card public fields (AC2.3)

1. Card shows: name, city, address, phone, email, referral code, rating, referrals.
2. No `owner_id`, payment receipts, or admin fields visible.

| Step | Pass? | Notes |
|------|-------|-------|
| D3 card fields | ☐ | |

### D4 — Bilingual + RTL (AC2.4, AC2.5, SC-005)

1. `http://localhost:3000/ur/bureau` — Urdu copy, RTL, cards/search/CTAs without overlap.

| Step | Pass? | Notes |
|------|-------|-------|
| D4 Urdu RTL | ☐ | |

---

## US4 — Commission accrual (AC4.1–AC4.5, SC-003, SC-004)

**Maps:** `src/lib/bureau/accrue-commission.ts`, `webhook-handlers.ts`, `approve-manual-payment.ts`

### C1 — Manual payment path (AC4.1, AC4.2)

1. User with `referred_by_bureau_id` set to **approved** bureau (rate e.g. `0.20`).
2. Submit manual payment proof; admin approves (`tier = referral`, amount **3999**).
3. SQL:
   ```sql
   SELECT bc.*, s.bureau_id, s.commission_amount
   FROM bureau_commissions bc
   JOIN subscriptions s ON s.id = bc.subscription_id
   WHERE bc.user_id = '<user_id>'
   ORDER BY bc.created_at DESC LIMIT 1;
   ```
4. Expect one row: `commission_amount = 799.80` for 20%; snapshots match bureau rate at activation.

| Step | Pass? | Notes |
|------|-------|-------|
| C1 manual accrual | ☐ | |

### C2 — Flat commission snapshot (AC4.2, T066)

1. Approve a test bureau with `commission_type = flat`, `commission_rate = 500`.
2. New attributed user pays referral tier.
3. Expect `commission_amount = 500.00` regardless of subscription amount (minus rounding).

| Step | Pass? | Notes |
|------|-------|-------|
| C2 flat rate | ☐ | |

### C3 — Stripe webhook path (AC4.1)

1. Complete Stripe checkout for referral tier (`premium_monthly` → `referral`).
2. Verify `bureau_commissions` row on subscription **insert** (not update-only path).

| Step | Pass? | Notes |
|------|-------|-------|
| C3 Stripe accrual | ☐ | |

### C4 — Skip guards (AC4.4)

| Case | Expected |
|------|----------|
| `tier = direct` | No commission row |
| No `referred_by_bureau_id` | No commission row |
| Bureau `is_approved = false` at pay time | No commission row |

| Step | Pass? | Notes |
|------|-------|-------|
| C4 skip direct | ☐ | |
| C4 skip unattributed | ☐ | |
| C4 skip unapproved bureau | ☐ | |

### C5 — Idempotency (AC4.5, SC-004)

1. Replay same Stripe webhook event or re-call manual approve for same subscription.
2. `SELECT count(*) FROM bureau_commissions WHERE subscription_id = '<id>'` → **1**.

| Step | Pass? | Notes |
|------|-------|-------|
| C5 no duplicate | ☐ | |

---

## Acceptance criteria traceability

| AC | Runbook section | Verified |
|----|-----------------|----------|
| AC1.1–AC1.5 | G1–G4 | ☐ |
| AC2.1–AC2.5 | D1–D4 | ☐ |
| AC3.1–AC3.5 | R1–R5 | ☐ |
| AC4.1–AC4.5 | C1–C5 | ☐ |
| SC-001 | D1 | ☐ |
| SC-002 | R1–R2 | ☐ |
| SC-003 | C1–C2 | ☐ |
| SC-004 | C5 | ☐ |
| SC-005 | G2, D4 | ☐ |
| SC-006 | G1 | ☐ |

---

## Sign-off (T071)

| Tester | Date | Environment | US1 | US2 | US3 | US4 | Static audits | Overall |
|--------|------|-------------|-----|-----|-----|-----|---------------|---------|
| _Your name_ | _YYYY-MM-DD_ | local / staging | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ **PASS** / ☐ **FAIL** |

**Phase D merge criteria:** All sections PASS; no open CRITICAL defects; `tsc --noEmit` clean.

---

## Quick SQL reference

```sql
-- Pending bureaus (admin queue)
SELECT id, name, city, status, is_approved, referral_code
FROM marriage_bureaus
WHERE is_approved = false AND status <> 'rejected';

-- Profile attribution
SELECT referred_by_bureau_id, referral_code FROM profiles WHERE id = '<user_id>';

-- Commission ledger
SELECT * FROM bureau_commissions WHERE subscription_id = '<subscription_id>';
```
