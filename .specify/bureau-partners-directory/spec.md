# Feature Specification — Bureau Partners Directory (Phase D)

**Feature Branch:** `20260629-203913-bureau-partners-directory`  
**Spec Directory:** `specs/002-phase-d-bureau-partners/`  
**Constitution:** `.specify/bureau-partners-directory/constitution.md`  
**Created:** 2026-06-29  
**Status:** Draft — ready for `/speckit-plan`

**Input:** Phase D — Bureau partner registration, public directory, referral attribution, and commission accrual on subscription activation. Replaces mock bureau UI with persisted data governed by admin approval and dynamic payout rules.

## Overview

Licensed marriage bureaus register on the platform, are reviewed by admins (including setting per-bureau commission rules), and appear in a searchable public directory once approved. End-users arriving via bureau referral links are permanently attributed to that bureau. When a referred user activates a **referral-tier** subscription (Phase C billing), the platform logs a commission row in `bureau_commissions` using the bureau's rate at activation time.

**Depends on:** Phase C hybrid billing (subscription activation via Stripe webhook and manual admin approval).

**Out of scope (Phase D):** Bureau owner earnings dashboard, weekly payout execution, QR referral scanner, per-city license cap enforcement.

---

## User Scenarios & Testing

### US1 — Bureau Registration & Admin Approval (Priority: P1)

A licensed bureau owner completes the multi-step registration form, submits business details (and optionally payment proof in a later hardening phase), and waits for admin review. An admin approves the bureau, optionally configures `commission_type` (`flat` or `percentage`) and `commission_rate`, and the bureau becomes eligible for directory listing and referral attribution.

**Why this priority:** Without persisted, approved bureaus there is no directory, no valid referral codes, and no commission beneficiaries.

**Independent test:** Submit a bureau application as an authenticated user, approve it in admin with a custom commission rate, verify `is_approved = true` and rate fields saved.

#### Acceptance Criteria

- **AC1.1:** An authenticated user can submit bureau registration and a `marriage_bureaus` row is created with `owner_id` equal to their user id, `is_approved = false`, and `status = 'pending'`.
- **AC1.2:** Default commission on new bureau rows is `commission_type = 'percentage'` and `commission_rate = 0.2000` (20%) unless admin overrides at approval time.
- **AC1.3:** Admin approval atomically sets `is_approved = true`, `status = 'approved'`, `verified = true`, `approved_at`, and `approved_by`; rejected bureaus remain `is_approved = false` with `status = 'rejected'`.
- **AC1.4:** Admin can set `commission_type` to `'flat'` or `'percentage'` and `commission_rate` to a positive value; invalid combinations (zero/negative rate, unknown type) are rejected with a clear admin-facing error.
- **AC1.5:** A bureau owner can view their own pending or rejected application status on `/bureau/register` but cannot self-approve or set `is_approved = true`.

---

### US2 — Bureau Directory UI (Priority: P1)

A member (or visitor where policy allows) opens the bureau landing page, searches bureaus by city, and sees only admin-approved partners with contact details and referral codes. The experience works in English and Urdu with correct RTL layout.

**Why this priority:** The directory is the primary discovery surface connecting users to bureau partners and referral codes.

**Independent test:** Seed approved and unapproved bureaus; confirm directory lists only approved rows, city filter works, and Urdu locale renders without layout breakage.

#### Acceptance Criteria

- **AC2.1:** The directory query returns only bureaus where `is_approved = true`; pending or rejected bureaus never appear in results (enforced by query filter and database access rules).
- **AC2.2:** City search filters the displayed list; searching a city with zero approved bureaus shows a localized empty state (not an error).
- **AC2.3:** Each directory card shows at minimum: bureau name, city, address, phone, email, referral code, and rating/referral count when available; owner id and payment receipts are never shown.
- **AC2.4:** All directory and landing copy uses localized strings in both English and Urdu; no hardcoded user-facing text in bureau page components.
- **AC2.5:** In Urdu (`dir="rtl"`), bureau directory layout uses logical spacing and alignment (e.g., text-start/end) so cards, search input, and CTAs mirror correctly without overlapping or clipped content.

---

### US3 — User Referral Attribution (Priority: P2)

A prospective member arrives via a bureau referral link (URL parameter carrying referral code), signs up, and is permanently linked to that bureau in their profile. Attribution survives browser restarts and does not depend on cookies at payment time.

**Why this priority:** Accurate attribution is required before commission accrual can be fair or auditable.

**Independent test:** Visit signup with `?ref=VALID_CODE`, complete registration, confirm `profiles.referred_by_bureau_id` is set and matches the approved bureau; upgrade without cookie still accrues via profile field.

#### Acceptance Criteria

- **AC3.1:** A referral URL parameter (e.g., `ref` or `referral_code`) containing a valid code for an `is_approved = true` bureau is accepted and stored for attribution during signup.
- **AC3.2:** On successful signup, `profiles.referred_by_bureau_id` is set to the matching bureau id and `profiles.referral_code` stores the code string for audit; attribution is performed server-side, not via direct client profile updates.
- **AC3.3:** Invalid, expired, or unapproved bureau codes do not set `referred_by_bureau_id`; the user sees a non-blocking warning and may continue signup unattributed.
- **AC3.4:** `referred_by_bureau_id` is write-once for end-users: after initial attribution, users cannot change their referring bureau through the app (admin correction only).
- **AC3.5:** If a user upgrades to premium without the referral cookie present, commission eligibility still uses `profiles.referred_by_bureau_id` from signup (persistent profile link, not session cookie).

---

### US4 — Commission Accrual Engine (Priority: P2)

When a referred user's referral-tier subscription activates (Stripe webhook or manual payment approval from Phase C), the platform calculates and logs one commission row per subscription activation, snapshotted to the bureau's rules at that moment.

**Why this priority:** Commissions are the bureau partners' core economic incentive; must be correct, idempotent, and auditable.

**Independent test:** Create user with `referred_by_bureau_id`, activate referral-tier subscription via Stripe and manual paths; verify single `bureau_commissions` row each with correct math; replay webhook without duplicate row.

#### Acceptance Criteria

- **AC4.1:** On subscription insert with `paid = true` and `tier = 'referral'`, if `profiles.referred_by_bureau_id` is set and bureau `is_approved = true`, exactly one `bureau_commissions` row is created keyed by unique `subscription_id`.
- **AC4.2:** If `commission_type = 'percentage'`, `commission_amount = round(subscription_amount × commission_rate, 2)` (e.g., PKR 3,999 × 0.20 = PKR 799.80); if `commission_type = 'flat'`, `commission_amount = commission_rate` (fixed PKR per activation).
- **AC4.3:** Each ledger row snapshots `commission_type`, `commission_rate`, and `subscription_amount` at accrual time; `status` defaults to `'accrued'`.
- **AC4.4:** Direct-tier subscriptions (`tier = 'direct'`) or users without `referred_by_bureau_id` produce zero commission rows.
- **AC4.5:** Duplicate activation events (webhook retry, double manual approve) do not create a second commission row for the same `subscription_id`; accrual is idempotent.

---

## Edge Cases

| Scenario | Expected behavior |
|----------|-------------------|
| User upgrades without referral cookie | Use `profiles.referred_by_bureau_id` if set at signup; no commission if null. Cookie absence must not block accrual when profile attribution exists. |
| User never had referral attribution | Subscription activation proceeds normally; no `bureau_commissions` row. |
| Admin changes bureau rate mid-billing-cycle | New rate applies only to **future** accruals; existing `bureau_commissions` rows are immutable. Next subscription activation snapshots the rate in effect at activation timestamp. |
| Bureau de-approved after referrals but before user pays | Accrual skipped if `is_approved = false` at activation time; warning logged; no commission row. |
| User attributed to bureau A, pays direct tier | No commission (direct tier excluded). |
| User attributed to bureau A, pays referral tier | Commission credited to bureau A per AC4.2. |
| Stripe webhook and manual path both fire for same period | Idempotency on `subscription_id` prevents duplicate commission rows. |
| User attributed before bureau approved | Referral code may exist on pending bureau row but attribution requires `is_approved = true`; signup with code for pending bureau shows non-blocking invalid-code warning. |
| Bureau owner attempts to read another bureau's commissions | Denied by access rules; owner sees only rows for bureaus they own. |

---

## Requirements

### Functional Requirements

- **FR-001:** System MUST persist bureau registration submissions to `marriage_bureaus` with `is_approved = false` until admin action.
- **FR-002:** System MUST allow admins to approve or reject bureau applications and configure `commission_type` and `commission_rate`.
- **FR-003:** System MUST expose a public bureau directory filtered to `is_approved = true` with city search.
- **FR-004:** System MUST attribute signups to approved bureaus via URL referral parameter into `profiles.referred_by_bureau_id` using server-side validation.
- **FR-005:** System MUST accrue commissions on referral-tier subscription activation into `bureau_commissions` with snapshotted rates and idempotency on `subscription_id`.
- **FR-006:** System MUST skip commission accrual for direct-tier subscriptions and unattributed users.
- **FR-007:** Bureau owners MUST only read commission ledger rows for bureaus they own; members MUST NOT read commission data.
- **FR-008:** Directory and registration flows MUST be fully localized (English and Urdu) with RTL-safe layout on bureau pages.

### Key Entities

- **Marriage Bureau (`marriage_bureaus`):** Licensed partner profile; includes approval flag, referral code, and dynamic payout fields (`commission_type`, `commission_rate`).
- **User Profile (`profiles`):** Member record; includes persistent `referred_by_bureau_id` referral link.
- **Subscription (`subscriptions`):** Phase C billing period record; `tier`, `paid`, `amount` drive commission eligibility and calculation input.
- **Bureau Commission (`bureau_commissions`):** Immutable accrual ledger row per paid referral subscription activation; snapshots rate and computed payout.

---

## Success Criteria

### Measurable Outcomes

- **SC-001:** 100% of directory-listed bureaus have `is_approved = true` in QA sampling (zero pending/rejected leakage).
- **SC-002:** Referral attribution from valid signup links succeeds in ≥ 99% of test signups (invalid codes excluded).
- **SC-003:** Commission calculation matches formula in AC4.2 for 100% of test cases across percentage and flat bureau configurations.
- **SC-004:** Zero duplicate `bureau_commissions` rows per `subscription_id` under webhook retry simulation.
- **SC-005:** Bureau directory and registration flows pass bilingual QA checklist (en + ur) with no RTL layout defects on primary breakpoints.
- **SC-006:** End-to-end time from bureau registration submit to admin-visible pending queue is under 30 seconds in staging.

---

## Assumptions

- Phase C billing is deployed: subscriptions activate via Stripe webhook (`checkout.session.completed`) and manual admin approval API.
- Default referral subscription price is PKR 3,999/month (`tier = referral`); direct tier is PKR 4,999/month and excluded from bureau commission.
- Existing `marriage_bureaus`, `bureau-approval-migration.sql`, and admin bureau tab provide a starting approval workflow to extend.
- Referral URL parameter name will be finalized in plan (default assumption: `ref` query param).
- Weekly payout to bureau bank accounts (`commission_payouts` batch) is Phase E; Phase D stops at `status = 'accrued'`.
- Bureau onboarding fees: **PKR 20,000 non-refundable application fee** (due at submission) plus **PKR 200,000 registration fee** (due only after admin approval). Total investment PKR 220,000.
- Bureau registration **payment receipt upload is optional in Phase D MVP**; admin verification remains manual with no automated payment gateway.

---

## Non-Functional Requirements

- Commission accrual MUST run only in trusted server paths (same trust level as Phase C payment activation).
- Public directory MUST NOT expose private bureau fields (owner id, payment receipts, admin notes).
- All new bureau-facing UI MUST comply with project i18n and RTL conventions per constitution §3.

---

## Dependencies

| Dependency | Relationship |
|------------|--------------|
| Phase C — Hybrid Billing | Provides subscription activation hooks |
| `admin_users` | Gates bureau approval and commission admin reads |
| `docs/initial-development-doc-001.md` § Phase D | Product roadmap alignment |
| `.specify/bureau-partners-directory/constitution.md` | Architectural laws for implementation |
