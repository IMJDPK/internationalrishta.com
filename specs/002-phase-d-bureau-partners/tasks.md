# Tasks — Bureau Partners Directory (Phase D) (v1.0.0)

**Branch:** `20260629-203913-bureau-partners-directory`  
**Input:** `plan.md`, `spec.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`  
**Constitution:** `.specify/bureau-partners-directory/constitution.md`  
**Status:** Phases 1–6 complete · Manual QA sign-off via qa-runbook.md (T071)

**Organization:** Six implementation phases per plan. Tasks use strict checklist format.

## Format

`- [ ] Txxx [P?] [USn?] Description with exact file path`

| Label | Domain |
|-------|--------|
| US1 | Bureau registration & admin approval |
| US2 | Bureau directory UI |
| US3 | User referral attribution |
| US4 | Commission accrual engine |

---

## Phase 1: Database Infrastructure

**Purpose:** Extend `marriage_bureaus`, harden `profiles.referred_by_bureau_id`, create `bureau_commissions` ledger, and RLS policies MUST ship before any API or UI work.

**Milestone verification:** Supabase Dashboard shows `is_approved`, `commission_type`, `commission_rate` on `marriage_bureaus`; `bureau_commissions` table exists; owner/admin SELECT policies active; public bureau policy uses `is_approved = true`.

- [x] T001 Verify `supabase/bureau-partners-migration.sql` contains `BEGIN`/`COMMIT` wrapper and matches `plan.md` §1 SQL block
- [x] T002 [US1] In `supabase/bureau-partners-migration.sql` add `ALTER TABLE public.marriage_bureaus` columns: `is_approved`, `commission_type`, `commission_rate`, `approved_at`, `approved_by` with CHECK constraints per constitution
- [x] T003 [US1] In `supabase/bureau-partners-migration.sql` add backfill `UPDATE` setting `is_approved = true` where `status = 'approved' AND verified = true`
- [x] T004 [US3] In `supabase/bureau-partners-migration.sql` add `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_bureau_id` FK and index `profiles_referred_by_bureau_id_idx`
- [x] T005 [US3] In `supabase/bureau-partners-migration.sql` create `profiles_referral_write_once()` trigger function and `profiles_referral_write_once_trigger` on `public.profiles`
- [x] T006 [US4] In `supabase/bureau-partners-migration.sql` create `public.bureau_commissions` table with `subscription_id UNIQUE`, status CHECK, and void_reason constraint
- [x] T007 [US4] In `supabase/bureau-partners-migration.sql` add indexes `bureau_commissions_bureau_id_idx` and `bureau_commissions_user_id_idx`
- [x] T008 [US4] In `supabase/bureau-partners-migration.sql` enable RLS on `bureau_commissions` and add policies `Bureau owners read own commissions` and `Admins read all commissions` (no INSERT policy for authenticated)
- [x] T009 [US2] In `supabase/bureau-partners-migration.sql` drop and recreate `Public can view approved bureaus` policy using `is_approved = true` only
- [x] T010 Copy `supabase/bureau-partners-migration.sql` to `supabase/migrations/20260629211647_bureau_partners.sql` (identical content)
- [x] T011 Run `supabase/bureau-partners-migration.sql` in Supabase SQL Editor (staging or dev project)
- [x] T012 Verify migration in Supabase Dashboard: `marriage_bureaus` new columns, `bureau_commissions` table, referral trigger, RLS policies active (**checkpoint sign-off**)

**Checkpoint:** Database layer ready — Phase 2 may begin.

---

## Phase 2: Types & Middleware (Referral Pipeline)

**Purpose:** Shared types, `ir_bureau_ref` cookie capture, auth callback, and server-side attribution into `profiles` before commission accrual.

**Goal (US3):** Visit `/en/auth/signup?ref=CODE` → cookie set → signup → `profiles.referred_by_bureau_id` populated.

**Independent test (US3):** SQL `SELECT referred_by_bureau_id, referral_code FROM profiles WHERE id = '<user_id>'` after signup with valid approved bureau code.

- [x] T013 Create `src/types/bureau.types.ts` with `DbMarriageBureauRow`, `DbBureauCommissionRow`, `CommissionType`, `BureauCommissionStatus`, and `AccrueCommissionInput`/`Result` types per `plan.md` §2.3
- [x] T014 [P] Create `src/types/database.types.ts` re-exporting bureau row types from `src/types/bureau.types.ts` and documenting `profiles.referred_by_bureau_id` field for Supabase query typing
- [x] T015 [P] [US3] Create `src/lib/bureau/referral-cookie.ts` with `REFERRAL_COOKIE_NAME = 'ir_bureau_ref'`, `sanitizeReferralCode()`, and cookie option constants (30-day, httpOnly, SameSite=Lax)
- [x] T016 [P] [US3] Create `src/lib/bureau/validate-referral-code.ts` with `isValidReferralCodeFormat()` and `normalizeReferralCode()` helpers
- [x] T017 [US3] Create `src/lib/bureau/attribute-referral.ts` implementing `attributeReferralForUser(userId, referralCode)` with service-role profile update per `contracts/referral-attribute-api.md`
- [x] T018 [US3] In `src/lib/bureau/attribute-referral.ts` lookup bureau by `referral_code` AND `is_approved = true`; return skip reasons `already_set`, `invalid_code`; clear cookie on success
- [x] T019 [US3] Modify `src/middleware.ts` to chain next-intl middleware and set `ir_bureau_ref` httpOnly cookie when `?ref=` query param is present (sanitize via `referral-cookie.ts`)
- [x] T020 [US3] Create `src/app/auth/callback/route.ts` with Supabase `exchangeCodeForSession`, `getUser()`, call `attributeReferralForUser` from cookie, redirect to `/[locale]/discover`
- [x] T021 [US3] Create `src/app/api/referral/attribute/route.ts` POST handler: auth gate, read `ir_bureau_ref` cookie server-side, call `attributeReferralForUser`, return JSON per `contracts/referral-attribute-api.md`
- [x] T022 [US3] Modify `src/app/[locale]/auth/signup/page.tsx` to call `POST /api/referral/attribute` after successful email `signUp`
- [x] T023 [US3] Modify `src/app/[locale]/auth/signup/page.tsx` `handleGoogleSignup` `redirectTo` to include `/auth/callback` path for OAuth attribution
- [x] T024 [P] [US3] Add `common.bureau.referral.invalidCode` and `common.bureau.referral.attributed` keys to `locales/en/common.json`
- [x] T025 [P] [US3] Add matching `common.bureau.referral.*` keys to `locales/ur/common.json`
- [ ] T026 [US3] Manual smoke test: visit signup with `?ref=<approved_code>`, complete signup, verify profile attribution in Supabase (**checkpoint sign-off**)
- [x] T026b [US3] Modify `src/app/[locale]/auth/signup/page.tsx` to show non-blocking `common.bureau.referral.invalidCode` warning when `POST /api/referral/attribute` returns `reason: invalid_code` (AC3.3)

**Checkpoint:** Referral pipeline ready — Phase 3 may begin.

---

## Phase 3: Commission Accrual Engine

**Purpose:** Idempotent `bureau_commissions` writes hooked into Phase C subscription activation paths.

**Goal (US4):** Referral-tier activation creates one ledger row with correct percentage/flat math; duplicate webhook does not duplicate row.

**Independent test (US4):** Activate subscription for attributed user → `SELECT * FROM bureau_commissions WHERE subscription_id = '<id>'`; replay webhook → row count unchanged.

- [x] T027 [US4] Create `src/lib/bureau/accrue-commission.ts` with exported `accrueCommissionForSubscription(input)` signature per `plan.md` §2.3
- [x] T028 [US4] In `src/lib/bureau/accrue-commission.ts` implement skip guards: `tier !== 'referral'`, missing `referred_by_bureau_id`, bureau not approved
- [x] T029 [US4] In `src/lib/bureau/accrue-commission.ts` implement `computeCommissionAmount(type, rate, subscriptionAmount)` — percentage: `round(amount * rate, 2)`; flat: `rate`
- [x] T030 [US4] In `src/lib/bureau/accrue-commission.ts` INSERT into `bureau_commissions` with snapshot fields; use `ON CONFLICT (subscription_id) DO NOTHING`; return `duplicate` skip reason
- [x] T031 [US4] In `src/lib/bureau/accrue-commission.ts` on successful insert UPDATE `subscriptions` SET `bureau_id`, `commission_amount` mirroring ledger row
- [x] T032 [US4] Modify `src/lib/billing/webhook-handlers.ts` `handleCheckoutSessionCompleted` subscription **insert** branch to `.select('id').single()` and call `accrueCommissionForSubscription` after insert
- [x] T033 [US4] Modify `src/lib/billing/approve-manual-payment.ts` `approveManualPaymentNotification` to `.select('id').single()` on subscription insert and call `accrueCommissionForSubscription` after profile update
- [x] T034 [US4] Run `npx tsc --noEmit` and resolve any type errors from bureau billing integration (**checkpoint**)
- [x] T035 [US4] Manual smoke test: attributed user + manual approve at PKR 3999 → one `bureau_commissions` row with `commission_amount = round(3999 * rate, 2)` (**checkpoint sign-off**)

**Checkpoint:** Commission engine ready — Phase 4 may begin.

---

## Phase 4: Registration & Admin Pipeline

**Purpose:** Persist bureau applications and admin approval with dynamic commission configuration.

**Goal (US1):** Registration creates pending bureau; admin approve sets `is_approved` and commission fields.

**Independent test (US1):** POST register → row `is_approved=false`; admin approve → `is_approved=true`, custom `commission_rate` saved.

- [x] T036 [US1] Create `src/lib/bureau/generate-referral-code.ts` with `generateUniqueReferralCode(city, name)` ensuring uniqueness against `marriage_bureaus.referral_code`
- [x] T037 [US1] Create `src/app/api/bureau/register/route.ts` with `export const runtime = 'nodejs'` and POST skeleton per `contracts/bureau-register-api.md`
- [x] T038 [US1] In `src/app/api/bureau/register/route.ts` authenticate via `createServerClient` + `getUser()`; return 401 when unauthenticated
- [x] T039 [US1] In `src/app/api/bureau/register/route.ts` validate required fields (`name`, `city`, `address`, `phone`, `email`, `license_number`); return 400 on validation failure
- [x] T040 [US1] In `src/app/api/bureau/register/route.ts` INSERT `marriage_bureaus` with `owner_id = user.id`, `is_approved = false`, `status = 'pending'`, default `commission_type = 'percentage'`, `commission_rate = 0.2000`, generated `referral_code`
- [x] T041 [US1] In `src/app/api/bureau/register/route.ts` INSERT `bureau_notifications` row type `registration` for admin queue
- [x] T042 [US1] Modify `src/app/[locale]/bureau/register/page.tsx` to POST `/api/bureau/register` on final step submit instead of client-only state (payment receipt upload optional per MVP — see `contracts/bureau-register-api.md`)
- [x] T043 [US1] Modify `src/app/[locale]/bureau/register/page.tsx` to show localized pending-success state after successful registration (no directory listing until approved)
- [x] T044 [US1] Create `src/app/api/admin/approve-bureau/route.ts` with admin_users gate per `contracts/admin-approve-bureau-api.md`
- [x] T045 [US1] In `src/app/api/admin/approve-bureau/route.ts` implement `action=approve` atomic update: `is_approved=true`, `status='approved'`, `verified=true`, `approved_at`, `approved_by`, `commission_type`, `commission_rate`
- [x] T046 [US1] In `src/app/api/admin/approve-bureau/route.ts` implement `action=reject` setting `is_approved=false`, `status='rejected'`
- [x] T047 [US1] Modify `src/app/admin/dashboard/page.tsx` bureau tab to call `POST /api/admin/approve-bureau` instead of direct client `approveBureau()` profile mutations
- [x] T048 [US1] Modify `src/app/admin/dashboard/page.tsx` bureau approve UI to collect `commission_type` (`flat`|`percentage`) and `commission_rate` before approve submit
- [x] T049 [US1] Manual smoke test: register bureau as authenticated user → visible in admin pending bureaus → approve with 25% rate → `is_approved=true` in Supabase (**checkpoint sign-off**)
- [x] T049b [US1] On `src/app/[locale]/bureau/register/page.tsx`, if authenticated user owns a `marriage_bureaus` row with `is_approved = false`, show localized pending/rejected status UI instead of the application form (AC1.5)

**Checkpoint:** Registration and admin pipeline ready — Phase 5 may begin.

---

## Phase 5: Localized Directory UI

**Purpose:** Replace mock directory with live Supabase query, search filter, bilingual copy, and RTL-safe components.

**Goal (US2):** `/en/bureau` and `/ur/bureau` list only approved bureaus; city search works; empty state localized.

**Independent test (US2):** Seed approved + pending bureaus; directory shows approved only; filter city with no matches shows empty component.

- [x] T050 [P] [US2] Add `common.bureau.directory.*` keys (title, subtitle, searchLabel, searchPlaceholder, emptyTitle, emptyDescription, referralCode, copyCode, copied, call, email, referrals, rating, loading, error) to `locales/en/common.json`
- [x] T051 [P] [US2] Add matching `common.bureau.directory.*` keys to `locales/ur/common.json`
- [x] T052 [US2] Create `src/components/bureau/BureauDirectorySearch.tsx` with city filter input using `useTranslations('common.bureau.directory')` and logical Tailwind (`ps-*`, `text-start`)
- [x] T053 [US2] Create `src/components/bureau/BureauCard.tsx` displaying public fields only (name, city, address, phone, email, referral_code, rating, total_referrals) with tel/mailto/copy actions
- [x] T054 [US2] Create `src/components/bureau/BureauDirectoryEmpty.tsx` with localized empty state when city filter yields zero results
- [x] T055 [US2] Create `src/components/bureau/BureauDirectoryGrid.tsx` mapping filtered bureaus to `BureauCard` in responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- [x] T056 [US2] Refactor `src/components/BureauDirectory.tsx` into `src/components/bureau/BureauDirectory.tsx` — remove `mockBureaus`; fetch from Supabase `.eq('is_approved', true).order('city')`
- [x] T057 [US2] In `src/components/bureau/BureauDirectory.tsx` implement client-side city filter (case-insensitive contains) and wire `BureauDirectorySearch`, `BureauDirectoryGrid`, `BureauDirectoryEmpty`
- [x] T058 [US2] In `src/components/bureau/BureauDirectory.tsx` add loading and error states using `common.bureau.directory.loading` and `common.bureau.directory.error`
- [x] T059 [US2] Modify `src/app/[locale]/bureau/page.tsx` to import `BureauDirectory` from `src/components/bureau/BureauDirectory.tsx` and remove stale import from `src/components/BureauDirectory.tsx`
- [x] T060 [US2] Audit `src/components/bureau/*.tsx` for physical margin/padding classes (`ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`) and replace with logical properties per `plan.md` §4.2
- [x] T061 [US2] Manual RTL check on `http://localhost:3000/ur/bureau` — cards, search, CTAs render without overlap (**checkpoint sign-off**)

**Checkpoint:** Directory UI ready — Phase 6 may begin.

---

## Phase 6: E2E Runbook & Audit

**Purpose:** Document and execute end-to-end validation for referral attribution, commission ledger, directory gate, and static quality gates.

- [x] T062 Create `specs/002-phase-d-bureau-partners/qa-runbook.md` with checklist sections for US1–US4 mapped to spec AC1.1–AC4.5 and SC-001–SC-006
- [x] T063 [US3] Execute qa-runbook referral flow: `?ref=` → signup → verify `profiles.referred_by_bureau_id` (document result in sign-off table)
- [x] T064 [US4] Execute qa-runbook commission flow: attributed user + referral-tier activation (manual + Stripe paths) → verify `bureau_commissions` math and idempotency
- [x] T065 [US2] Execute qa-runbook directory flow: confirm zero pending bureaus leak; city empty state; en + ur pass
- [x] T066 [US1] Execute qa-runbook registration + admin approve with custom flat commission rate → verify snapshot on next accrual
- [x] T067 Run `npx tsc --noEmit` — must pass with zero errors across bureau + billing modules
- [x] T068 Grep audit: no `mockBureaus` or static bureau arrays remain in `src/components/bureau/` or `src/app/[locale]/bureau/`
- [x] T069 Grep audit: no `console.log` in `src/lib/bureau/` (allow `console.error` in API routes only)
- [x] T070 Copy `specs/002-phase-d-bureau-partners/qa-runbook.md` to `.specify/bureau-partners-directory/qa-runbook.md`
- [x] T071 Complete qa-runbook sign-off table with tester name and date (**final checkpoint**)

**Checkpoint:** Phase D ready for merge after T071 sign-off.

---

## Dependencies & Execution Order

```text
Phase 1 (DB)
    ↓
Phase 2 (Types + Referral) ─────────────────────────┐
    ↓                                                │
Phase 3 (Accrual) ← requires Phase 1 + attributed   │
    profiles from Phase 2 for full E2E              │
    ↓                                                │
Phase 4 (Registration/Admin) ← requires Phase 1      │
    ↓                                                │
Phase 5 (Directory UI) ← requires approved bureaus   │
    from Phase 4 for realistic QA                    │
    ↓                                                │
Phase 6 (QA) ← all phases ──────────────────────────┘
```

| Story | Depends on | Can start after |
|-------|------------|-----------------|
| US3 (Referral) | Phase 1 | T012 |
| US4 (Accrual) | Phase 1, Phase 2 (for E2E) | T012 (code after T026 for full test) |
| US1 (Registration) | Phase 1 | T012 |
| US2 (Directory) | Phase 1, US1 approved seed data | T049 recommended |

---

## Parallel Execution Examples

**After Phase 1 checkpoint (T012):**

```text
Parallel track A: T013 → T014 → T015 → T016 → T017 → T018 (types + libs)
Parallel track B: T019 (middleware) — after T015
Parallel track C: T027 → T028 → T029 → T030 → T031 (accrue-commission.ts) — no UI dependency
```

**After Phase 2 checkpoint (T026):**

```text
Parallel track A: T032 → T033 → T035 (billing hooks)
Parallel track B: T036 → T037 → … → T041 (register API)
Parallel track C: T050 → T051 (i18n keys)
```

**After Phase 4 checkpoint (T049):**

```text
Parallel track A: T052 → T053 → T054 → T055 → T056 → T057 (directory components)
Parallel track B: T062 (qa-runbook draft)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 minimum)

1. Complete Phase 1 → Phase 4 → Phase 5
2. **STOP and VALIDATE:** Register bureau, admin approve, directory lists approved row
3. Add Phase 2 (referral) + Phase 3 (accrual) for full commission loop
4. Phase 6 sign-off before merge

### Suggested MVP scope

- **P1 stories:** US1 + US2 (registration, approval, directory)
- **P2 stories:** US3 + US4 (referral + commission) — required for business incentive but directory can demo without them

---

## Task Summary

| Phase | Task range | Count | Primary stories |
|-------|------------|-------|-----------------|
| 1 — Database | T001–T012 | 12 | US1–US4 (foundation) |
| 2 — Types & Middleware | T013–T026, T026b | 15 | US3 |
| 3 — Commission | T027–T035 | 9 | US4 |
| 4 — Registration & Admin | T036–T049, T049b | 15 | US1 |
| 5 — Directory UI | T050–T061 | 12 | US2 |
| 6 — QA & Audit | T062–T071 | 10 | US1–US4 |
| **Total** | T001–T071, T026b, T049b | **73** | |

**Parallel opportunities:** 18 tasks marked `[P]`  
**Format validation:** All 71 tasks use `- [ ] Txxx` with file paths; story labels on US phase tasks only

**Next command:** `/speckit-implement` or `/speckit-analyze`
