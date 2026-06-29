# Bureau Partners Directory — Feature Constitution

**Feature:** Phase D — Bureau Partners Directory & Referral Commissions  
**Branch:** `20260629-203913-bureau-partners-directory`  
**Directory:** `.specify/bureau-partners-directory/`  
**Project:** International Rishta (Next.js 15 + Supabase)  
**Version:** 1.0.0 | **Ratified:** 2026-06-29 | **Last Amended:** 2026-06-29

<!--
Sync Impact Report
- Version: (new) → 1.0.0
- Added: Full Phase D feature constitution (bureau directory, referral, commissions)
- Extends: supabase/schema.sql, bureau-approval-migration.sql, Phase C billing activation
- Templates: pending — plan/spec/tasks not yet generated for this feature
- Deferred: Weekly payout batch job (commission_payouts aggregation) — Phase E
-->

This document is the **Laws of this Feature**. All spec, plan, and implementation work for
Bureau Partners MUST comply. It extends Phase D in `docs/initial-development-doc-001.md`,
builds on the existing `marriage_bureaus` table in `supabase/schema.sql`, and hooks into
subscription activation from Phase C (`src/lib/billing/webhook-handlers.ts`,
`src/lib/billing/approve-manual-payment.ts`).

---

## 1. Feature Boundary

### 1.1 In scope

- **Bureau registration:** Authenticated users submit bureau applications; data persists to
  `public.marriage_bureaus` (replace mock registration UI).
- **Admin approval:** `admin_users` approve or reject bureaus before they appear in the public
  directory.
- **Public directory:** `src/app/[locale]/bureau/page.tsx` lists approved bureaus from Supabase
  (replace `BureauDirectory` mock data).
- **Referral attribution:** Link end-users to bureaus via `profiles.referred_by_bureau_id`
  (existing column) and optional `referral_code` at signup/checkout.
- **Commission ledger:** New `public.bureau_commissions` table records calculated payouts when
  a referred user's subscription activates (`paid = true`).
- **Dynamic payout rules:** Per-bureau `commission_type` and `commission_rate` on
  `marriage_bureaus`.
- **Bureau owner read model:** Owners view their own commission ledger rows (RLS-enforced).

### 1.2 Out of scope (deferred)

- Bureau owner dashboard UI (earnings charts, payout requests) — ledger API only in MVP.
- Weekly payout execution (`commission_payouts` batch, `/api/payouts/run-weekly`) — Phase E.
- License transfer marketplace, per-city cap enforcement (20/city) — future hardening.
- QR scanner for referral codes — Phase 2 per dev doc.
- Automated bureau registration fee verification (manual admin flow reuses existing patterns).

### 1.3 Product reference (README / dev doc)

| Concept | Value |
|---------|-------|
| Bureau referral subscription | PKR 3,999/month (`tier = referral`) |
| Direct subscription | PKR 4,999/month (`tier = direct`) |
| Default bureau commission | 20% of referral subscription (PKR 800/month) |
| Bureau application fee | PKR 20,000 (non-refundable; due at submission; admin-verified manually) |
| Bureau registration fee | PKR 200,000 (due only after admin approval) |
| Total bureau investment | PKR 220,000 (application + registration) |
| Directory gate | `is_approved = true` only |

---

## 2. Data Model Laws

Base schema: `supabase/schema.sql`. Approval workflow: `supabase/bureau-approval-migration.sql`.
Phase C subscriptions: `subscriptions` with `source_channel`, `paid`, `tier`, `bureau_id`,
`commission_amount` (existing columns — commission **calculation** moves to `bureau_commissions`).

### 2.1 `public.marriage_bureaus` (extended)

Existing columns MUST be preserved (`owner_id`, `name`, `city`, `license_number`,
`referral_code`, `verified`, `status`, etc.). This feature **adds**:

| Column | Type | Rule |
|--------|------|------|
| **is_approved** | `boolean` NOT NULL DEFAULT `false` | **Directory gate.** MUST be `true` for public directory display. Set only by admin approval (service role or admin API). |
| **commission_type** | `text` NOT NULL | CHECK `commission_type IN ('flat', 'percentage')`. Default `'percentage'`. |
| **commission_rate** | `numeric(10, 4)` NOT NULL | If `percentage`: decimal rate (e.g. `0.2000` = 20%). If `flat`: fixed PKR amount per activation. MUST be `> 0`. |
| **approved_at** | `timestamptz` | Set when `is_approved` flips to `true`. |
| **approved_by** | `uuid` FK → `admin_users.id` | Admin who approved. |

**Law — approval consistency:**

When admin approves a bureau, the system MUST atomically set:

- `is_approved = true`
- `status = 'approved'` (existing column)
- `verified = true` (existing column)
- `approved_at`, `approved_by`

Rejected bureaus MUST have `is_approved = false` and `status = 'rejected'`.

**Law — payout rule immutability:**

`commission_type` and `commission_rate` MAY be updated by admins only (service role or
admin API). Changes MUST NOT retroactively alter existing `bureau_commissions` rows
(amounts are snapshotted at creation).

### 2.2 `public.profiles` — referral link (existing)

| Column | Rule |
|--------|------|
| `referred_by_bureau_id` | `uuid` FK → `marriage_bureaus.id`, nullable. Set once at signup or first checkout when user enters a valid `referral_code`. |
| `referral_code` | Text copy of bureau code for audit; optional. |

**Law:** `referred_by_bureau_id` MUST reference a bureau where `is_approved = true` at
attribution time. Users MUST NOT self-assign bureau ids via client-side updates; attribution
MUST occur through server-validated referral code lookup or admin correction.

**Law:** Commission accrual requires BOTH:

1. `profiles.referred_by_bureau_id IS NOT NULL`, AND
2. Activated subscription with `tier = 'referral'` and `paid = true`

Direct-tier subscriptions (`tier = 'direct'`) MUST NOT generate bureau commissions.

### 2.3 `public.bureau_commissions` (new ledger)

| Column | Type | Rule |
|--------|------|------|
| `id` | `uuid` PK | Server-generated |
| `bureau_id` | `uuid` FK → `marriage_bureaus` NOT NULL | Earning bureau |
| `user_id` | `uuid` FK → `profiles` NOT NULL | Referred user |
| `subscription_id` | `uuid` FK → `subscriptions` NOT NULL UNIQUE | One commission row per paid subscription period activation |
| `subscription_amount` | `numeric(10,2)` NOT NULL | PKR amount at activation |
| `commission_type` | `text` NOT NULL | Snapshot: `'flat'` \| `'percentage'` |
| `commission_rate` | `numeric(10,4)` NOT NULL | Snapshot of bureau rate at calculation |
| `commission_amount` | `numeric(10,2)` NOT NULL | Calculated payout |
| `status` | `text` NOT NULL | CHECK `status IN ('accrued', 'paid', 'void')`. Default `'accrued'`. |
| `accrued_at` | `timestamptz` NOT NULL DEFAULT `now()` | |
| `paid_at` | `timestamptz` | Set when status → `paid` (Phase E payout job) |
| `void_reason` | `text` | Required when `status = 'void'` |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | |

**Law — calculation:**

```
IF commission_type = 'percentage':
  commission_amount = round(subscription_amount * commission_rate, 2)
IF commission_type = 'flat':
  commission_amount = commission_rate   -- flat PKR per activation
```

**Law — idempotency:**

Insert into `bureau_commissions` MUST use `subscription_id` UNIQUE constraint. Duplicate
activation handlers (Stripe webhook retry, manual approve replay) MUST NOT create duplicate
ledger rows.

**Law — subscription linkage:**

On commission creation, `subscriptions.bureau_id` and `subscriptions.commission_amount`
SHOULD be updated to mirror the ledger row for backward compatibility with existing reports.

### 2.4 Commission trigger points (Phase C integration)

Commission accrual MUST run in **service-role** code paths only, immediately after a
subscription row is inserted with `paid = true`:

| Trigger | Location |
|---------|----------|
| Stripe activation | `handleCheckoutSessionCompleted` in `webhook-handlers.ts` |
| Manual activation | `approveManualPaymentNotification` in `approve-manual-payment.ts` |

Shared logic MUST live in `src/lib/bureau/accrue-commission.ts` (single source of truth).

**Algorithm (normative):**

1. Load `profiles.referred_by_bureau_id` for `subscription.user_id`.
2. If null → skip (no commission).
3. If `subscription.tier !== 'referral'` → skip.
4. Load bureau; if `!is_approved` → skip and log warning (do not accrue for unapproved bureau).
5. Snapshot `commission_type`, `commission_rate`; compute `commission_amount`.
6. INSERT `bureau_commissions` (idempotent on `subscription_id`).
7. UPDATE `subscriptions` set `bureau_id`, `commission_amount`.

---

## 3. Directory UI & Frontend Laws

### 3.1 Public directory query

`src/app/[locale]/bureau/page.tsx` and `src/components/BureauDirectory.tsx` MUST:

- Query Supabase for bureaus WHERE **`is_approved = true`** only.
- MUST NOT render mock/static bureau arrays in production code paths.
- Support city search/filter server-side or client-side on approved rows only.
- Display public fields only: `name`, `city`, `address`, `phone`, `email`, `referral_code`,
  `rating`, `total_referrals` — never expose `owner_id`, payment receipts, or admin notes.

**Law:** Pending, rejected, or unapproved bureaus MUST NOT appear in directory results even
if the client crafts a query — RLS enforces this at the database layer.

### 3.2 Internationalization (next-intl)

- All user-facing strings MUST use `useTranslations` / `getTranslations`.
- Namespace: `common.bureau.*` (extend existing keys in `locales/en/common.json` and
  `locales/ur/common.json`).
- No hardcoded English/Urdu in bureau components added or modified by this feature.

### 3.3 RTL & Tailwind logical properties

- MUST use logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`,
  `start-*`, `end-*`, `border-s-*`, `border-e-*`.
- MUST NOT use physical `ml-*`, `mr-*`, `pl-*`, `pr-*`, `text-left`, `text-right` in new or
  refactored bureau UI.
- Layout MUST render correctly in Urdu (`dir="rtl"`) without mirrored breakage.

### 3.4 Registration flow

- `src/app/[locale]/bureau/register/page.tsx` MUST persist to `marriage_bureaus` on submit.
- New rows: `is_approved = false`, `status = 'pending'`, `owner_id = auth.uid()`.
- `referral_code` MUST be unique (server-generated or validated uniqueness).
- User sees pending state after submit; no directory listing until admin approval.

---

## 4. Security & Row Level Security

### 4.1 `marriage_bureaus` policies

| Operation | Actor | Rule |
|-----------|-------|------|
| INSERT | `authenticated` | `owner_id = auth.uid()` |
| SELECT (own) | `authenticated` | `owner_id = auth.uid()` — any status |
| SELECT (public) | `anon`, `authenticated` | **`is_approved = true`** only |
| UPDATE (own) | `authenticated` | `owner_id = auth.uid()` AND `is_approved = false` — registration edits only |
| UPDATE (approve) | `service_role` / admin API | Sets `is_approved`, `status`, `verified` |
| DELETE | — | Forbidden for owners; admin service role only |

Existing `bureau-approval-migration.sql` policies using `status = 'approved' AND verified = true`
MUST be updated to use **`is_approved = true`** as the single public SELECT predicate.

### 4.2 `bureau_commissions` policies

| Operation | Actor | Rule |
|-----------|-------|------|
| INSERT | `service_role` only | Via accrual function |
| SELECT | Bureau owner | `bureau_id` IN (SELECT id FROM marriage_bureaus WHERE owner_id = auth.uid()) |
| SELECT | Admin | `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` |
| UPDATE | `service_role` only | Payout status changes (Phase E) |
| DELETE | — | Forbidden |

**Law:** Bureau owners MUST NOT read other bureaus' commission rows. Users (referred members)
MUST NOT read commission rows.

### 4.3 `profiles.referred_by_bureau_id`

- Users MAY read their own `referred_by_bureau_id`.
- Users MUST NOT UPDATE `referred_by_bureau_id` directly via client Supabase — set via
  server action or signup API after referral code validation.

### 4.4 Admin approval

- Bureau approval MUST go through `admin_users` gate (existing `/admin/dashboard` bureau tab
  or dedicated API route with service role).
- Profile-only approve shortcuts MUST NOT set `is_approved` without bureau record validation.

---

## 5. API & Server Laws

### 5.1 Required routes (minimum)

| Route | Purpose |
|-------|---------|
| `POST /api/bureau/register` | Validate + insert bureau registration |
| `GET /api/bureau/directory` | Optional server cache; or direct Supabase client query with RLS |
| `POST /api/admin/approve-bureau` | Admin approve/reject (extend existing dashboard) |
| `POST /api/referral/attribute` | Validate referral code → set `referred_by_bureau_id` |

### 5.2 Forbidden

- Client-side `supabase.from('bureau_commissions').insert()` — accrual is server-only.
- Public listing query without `is_approved = true` filter.
- Hardcoded commission amounts in UI (always derive from bureau rules or ledger).

---

## 6. Migration & Compatibility

1. Add columns to `marriage_bureaus`: `is_approved`, `commission_type`, `commission_rate`,
   `approved_at`, `approved_by`.
2. Backfill: `is_approved = true` WHERE `status = 'approved' AND verified = true`.
3. Create `bureau_commissions` table + indexes on `bureau_id`, `user_id`, `subscription_id`.
4. Replace RLS public SELECT policy to use `is_approved`.
5. Do NOT drop `commission_payouts` — Phase E aggregates from `bureau_commissions`.

Migration file naming: `supabase/migrations/YYYYMMDDHHMMSS_bureau_partners_directory.sql`.

---

## 7. Quality Gates (pre-merge)

- [ ] Directory shows zero mock bureaus; only `is_approved = true` rows.
- [ ] Registration creates pending bureau; not visible in directory until admin approves.
- [ ] Referral code attribution sets `referred_by_bureau_id` server-side.
- [ ] Stripe + manual subscription activation creates `bureau_commissions` row for referral tier.
- [ ] Duplicate webhook does not duplicate commission row.
- [ ] Bureau owner can SELECT own commissions; cannot SELECT others'.
- [ ] en + ur locale keys complete for new bureau strings.
- [ ] RTL audit: no physical margin/padding in bureau components.

---

## 8. Governance

- This constitution overrides conflicting ad-hoc bureau implementation choices.
- Amendments require version bump (semver) and sync to `spec.md` / `plan.md` / `tasks.md`
  when generated.
- Phase C billing constitution remains authoritative for payment activation; this document
  governs bureau directory, referral, and commission accrual only.

**Compliance review:** Run `/speckit-analyze` after tasks are generated to verify coverage of
sections 2–5.
