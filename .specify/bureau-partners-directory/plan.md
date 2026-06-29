# Implementation Plan — Bureau Partners Directory (Phase D)

**Branch:** `20260629-203913-bureau-partners-directory`  
**Date:** 2026-06-29  
**Feature laws:** `.specify/bureau-partners-directory/constitution.md`  
**Specs dir:** `specs/002-phase-d-bureau-partners/`

## Summary

Replace mock bureau UI with a persisted partner network: extend `marriage_bureaus` with dynamic
payout rules and `is_approved`, create `bureau_commissions` ledger with strict RLS, capture `?ref=`
referral codes through middleware + auth callback into `profiles.referred_by_bureau_id`, and hook
commission accrual into Phase C subscription activation (`webhook-handlers.ts`,
`approve-manual-payment.ts`).

---

## Technical Context

| Item | Value |
|------|-------|
| Language | TypeScript 5.7 (strict) |
| Framework | Next.js 15 App Router (`src/app/`) |
| Backend | Supabase Postgres, Auth, Storage |
| Auth transport | `@supabase/ssr` — `client.ts`, `server.ts`, service role in API routes |
| i18n | `next-intl` 3.4 — `locales/en`, `locales/ur` |
| Styling | Tailwind 3.4 + **logical properties** (RTL) |
| Base schema | `supabase/schema.sql` |
| Bureau workflow | `supabase/bureau-approval-migration.sql` |
| Phase C billing | `src/lib/billing/webhook-handlers.ts`, `approve-manual-payment.ts` |
| Bureau UI (mock) | `src/app/[locale]/bureau/page.tsx`, `BureauDirectory.tsx` |
| Registration UI | `src/app/[locale]/bureau/register/page.tsx` (no DB submit today) |
| Admin bureau tab | `src/app/admin/dashboard/page.tsx` |
| Middleware | `src/middleware.ts` (next-intl only today — extend for `?ref=`) |
| Auth callback | **Does not exist** — create `src/app/auth/callback/route.ts` |
| Referral param | `ref` (query string) |
| Referral cookie | `ir_bureau_ref` (httpOnly, 30-day, path `/`) |
| Testing | Manual QA + Supabase local; Stripe CLI optional for accrual E2E |

---

## Constitution Check

| Gate | Status | Plan section |
|------|--------|--------------|
| `is_approved` directory gate | ✅ | §1 SQL, §3 |
| Dynamic `commission_type` / `commission_rate` | ✅ | §1 SQL |
| `bureau_commissions` ledger + idempotency | ✅ | §1 SQL, §2.3 |
| `profiles.referred_by_bureau_id` server attribution | ✅ | §2.1–§2.2 |
| Commission accrual on Phase C activation only | ✅ | §2.3 |
| Bureau owner SELECT own commissions only | ✅ | §1 SQL RLS |
| next-intl + logical Tailwind on bureau UI | ✅ | §3, §4 |
| No client INSERT on `bureau_commissions` | ✅ | §1 SQL RLS |

**Pre-design gate:** PASS  
**Post-design gate:** PASS (see `research.md`, `data-model.md`, `contracts/`)

---

## Project Structure

### Documentation

```text
.specify/bureau-partners-directory/
├── constitution.md
├── spec.md
└── plan.md                         # mirror of specs plan

specs/002-phase-d-bureau-partners/
├── plan.md                         # this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── bureau-register-api.md
    ├── referral-attribute-api.md
    ├── admin-approve-bureau-api.md
    └── bureau-directory-ui.md
```

### Source (to create / modify)

```text
supabase/
├── bureau-partners-migration.sql           # NEW — from §1 below
└── migrations/
    └── 20260629210000_bureau_partners.sql  # NEW — copy of migration

src/
├── middleware.ts                           # MODIFY — capture ?ref= cookie
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                    # NEW — OAuth + referral attribution
│   ├── api/
│   │   ├── bureau/
│   │   │   └── register/
│   │   │       └── route.ts                # NEW
│   │   ├── referral/
│   │   │   └── attribute/
│   │   │       └── route.ts                # NEW
│   │   └── admin/
│   │       └── approve-bureau/
│   │           └── route.ts                # NEW
│   ├── [locale]/
│   │   ├── bureau/
│   │   │   ├── page.tsx                    # MODIFY — wire directory
│   │   │   └── register/page.tsx           # MODIFY — POST register API
│   │   └── auth/
│   │       └── signup/page.tsx             # MODIFY — call attribute after signUp
│   └── admin/dashboard/page.tsx            # MODIFY — commission fields on approve
├── components/
│   └── bureau/
│       ├── BureauDirectory.tsx             # MOVE/refactor from components/
│       ├── BureauDirectorySearch.tsx       # NEW
│       ├── BureauCard.tsx                  # NEW
│       └── BureauDirectoryEmpty.tsx        # NEW
├── lib/
│   └── bureau/
│       ├── accrue-commission.ts            # NEW
│       ├── attribute-referral.ts           # NEW — validate ref code → profile
│       ├── referral-cookie.ts              # NEW — cookie name + parse helpers
│       └── validate-referral-code.ts       # NEW
├── types/
│   └── bureau.types.ts                     # NEW
└── lib/billing/
    ├── webhook-handlers.ts                 # MODIFY — call accrue after subscription insert
    └── approve-manual-payment.ts           # MODIFY — call accrue after subscription insert

locales/
├── en/common.json                          # MODIFY — common.bureau.directory.*
└── ur/common.json                          # MODIFY — common.bureau.directory.*
```

---

## §1 Database Migration

**File:** `supabase/bureau-partners-migration.sql`  
**Copy to:** `supabase/migrations/20260629210000_bureau_partners.sql`

> **Note:** `profiles.referred_by_bureau_id` already exists in `schema.sql`. Migration uses
> `IF NOT EXISTS` for idempotency and adds a write-once guard trigger.

```sql
-- ============================================================================
-- Phase D — Bureau Partners Directory
-- Extends marriage_bureaus, creates bureau_commissions, hardens referral + RLS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. marriage_bureaus — payout rules + directory gate
-- ---------------------------------------------------------------------------

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'percentage'
    CHECK (commission_type IN ('flat', 'percentage')),
  ADD COLUMN IF NOT EXISTS commission_rate numeric(10, 4) NOT NULL DEFAULT 0.2000
    CHECK (commission_rate > 0),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.admin_users(id);

COMMENT ON COLUMN public.marriage_bureaus.is_approved IS
  'Directory gate — true only after admin approval';
COMMENT ON COLUMN public.marriage_bureaus.commission_rate IS
  'percentage: decimal rate (0.20 = 20%); flat: fixed PKR per activation';

-- Backfill from legacy status/verified
UPDATE public.marriage_bureaus
SET is_approved = true
WHERE status = 'approved' AND verified = true AND is_approved = false;

-- ---------------------------------------------------------------------------
-- 2. profiles — referred_by_bureau_id (column may already exist)
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_bureau_id uuid
    REFERENCES public.marriage_bureaus(id);

CREATE INDEX IF NOT EXISTS profiles_referred_by_bureau_id_idx
  ON public.profiles(referred_by_bureau_id);

-- Write-once: end-users cannot change referral bureau after set
CREATE OR REPLACE FUNCTION public.profiles_referral_write_once()
RETURNS trigger AS $$
BEGIN
  IF OLD.referred_by_bureau_id IS NOT NULL
     AND NEW.referred_by_bureau_id IS DISTINCT FROM OLD.referred_by_bureau_id
     AND auth.uid() = OLD.id
     AND NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  THEN
    RAISE EXCEPTION 'referred_by_bureau_id is immutable for end-users';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_referral_write_once_trigger ON public.profiles;
CREATE TRIGGER profiles_referral_write_once_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_referral_write_once();

-- ---------------------------------------------------------------------------
-- 3. bureau_commissions — accrual ledger
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bureau_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bureau_id uuid NOT NULL REFERENCES public.marriage_bureaus(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subscription_id uuid NOT NULL UNIQUE REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  subscription_amount numeric(10, 2) NOT NULL,
  commission_type text NOT NULL CHECK (commission_type IN ('flat', 'percentage')),
  commission_rate numeric(10, 4) NOT NULL,
  commission_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'accrued'
    CHECK (status IN ('accrued', 'paid', 'void')),
  accrued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bureau_commissions_void_reason_check CHECK (
    status <> 'void' OR void_reason IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS bureau_commissions_bureau_id_idx
  ON public.bureau_commissions(bureau_id);
CREATE INDEX IF NOT EXISTS bureau_commissions_user_id_idx
  ON public.bureau_commissions(user_id);

ALTER TABLE public.bureau_commissions ENABLE ROW LEVEL SECURITY;

-- INSERT: service role only (no client policy)
-- SELECT: bureau owner sees own bureau rows
CREATE POLICY "Bureau owners read own commissions"
  ON public.bureau_commissions FOR SELECT
  TO authenticated
  USING (
    bureau_id IN (
      SELECT id FROM public.marriage_bureaus WHERE owner_id = auth.uid()
    )
  );

-- SELECT: admins read all
CREATE POLICY "Admins read all commissions"
  ON public.bureau_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 4. marriage_bureaus RLS — replace public policy with is_approved
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view approved bureaus" ON public.marriage_bureaus;

CREATE POLICY "Public can view approved bureaus"
  ON public.marriage_bureaus FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);
```

---

## §2 Backend Pipeline & Hooks

### 2.1 Referral capture — middleware (`src/middleware.ts`)

**Flow:**

```text
User visits /en/auth/signup?ref=ROYAL-LHE
        │
        ▼
middleware.ts
  1. Run next-intl locale routing (existing)
  2. If searchParams.has('ref'):
       set httpOnly cookie ir_bureau_ref=<code> (30 days, SameSite=Lax, path=/)
  3. Continue redirect/locale handling
```

**Implementation notes:**

- Wrap `createMiddleware` from `next-intl`; read `request.nextUrl.searchParams.get('ref')`.
- Sanitize: trim, uppercase, max length 32; strip non `[A-Z0-9-]` characters.
- Cookie is a **staging** value only; profile attribution happens server-side at signup.

### 2.2 Referral persistence — auth callback + attribute API

**New route:** `src/app/auth/callback/route.ts`

```text
OAuth / email confirmation redirect
        │
        ▼
auth/callback/route.ts
  1. exchangeCodeForSession (Supabase SSR)
  2. getUser()
  3. attributeReferralForUser(userId)  ← reads ir_bureau_ref cookie
  4. redirect → /[locale]/discover or /profile
```

**New lib:** `src/lib/bureau/attribute-referral.ts`

```typescript
export async function attributeReferralForUser(
  userId: string,
  referralCode: string
): Promise<{ attributed: boolean; bureauId?: string; reason?: string }>
```

**Logic:**

1. Load profile; if `referred_by_bureau_id` already set → return `{ attributed: false, reason: 'already_set' }`.
2. Lookup `marriage_bureaus` where `referral_code = upper(code)` AND `is_approved = true`.
3. If not found → return `{ attributed: false, reason: 'invalid_code' }`.
4. Service-role UPDATE `profiles` SET `referred_by_bureau_id`, `referral_code`.
5. Clear `ir_bureau_ref` cookie.

**Email signup path** (`signup/page.tsx`):

After successful `signUp`, call `POST /api/referral/attribute` with session (or invoke
`attributeReferralForUser` server action) so email users get the same attribution without OAuth
callback.

**New route:** `POST /api/referral/attribute` — auth required; reads cookie server-side; calls
`attributeReferralForUser`. See `contracts/referral-attribute-api.md`.

### 2.3 Commission accrual — `src/lib/bureau/accrue-commission.ts`

**Signature:**

```typescript
import type { SubscriptionTierDb } from "@/types/billing.types";

export type AccrueCommissionSkipReason =
  | "no_referral"
  | "direct_tier"
  | "bureau_not_approved"
  | "bureau_not_found"
  | "duplicate";

export interface AccrueCommissionInput {
  subscriptionId: string;
  userId: string;
  tier: SubscriptionTierDb;
  subscriptionAmount: number;
}

export interface AccrueCommissionResult {
  accrued: boolean;
  commissionId?: string;
  commissionAmount?: number;
  skippedReason?: AccrueCommissionSkipReason;
}

/**
 * Idempotent commission accrual for a paid referral-tier subscription.
 * Service-role only — never call from client components.
 */
export async function accrueCommissionForSubscription(
  input: AccrueCommissionInput
): Promise<AccrueCommissionResult>;
```

**Internal algorithm:**

1. If `tier !== 'referral'` → skip (`direct_tier`).
2. Load `profiles.referred_by_bureau_id` for `userId`; null → skip (`no_referral`).
3. Load bureau (`commission_type`, `commission_rate`, `is_approved`); not approved → skip.
4. Compute `commission_amount` per constitution (percentage × amount OR flat rate).
5. `INSERT bureau_commissions ... ON CONFLICT (subscription_id) DO NOTHING RETURNING id`.
6. If inserted: `UPDATE subscriptions SET bureau_id, commission_amount`.
7. Return `{ accrued: true, commissionId, commissionAmount }` or `{ accrued: false, skippedReason: 'duplicate' }`.

### 2.4 Phase C hook points

#### A. `src/lib/billing/webhook-handlers.ts` — `handleCheckoutSessionCompleted`

**Current:** inserts/updates `subscriptions`, then updates `profiles` (lines ~149–177).

**Change:** After successful subscription insert (not update path on first activation), capture
returned `subscription.id`:

```typescript
// After insert branch (~line 149):
const { data: inserted, error: insertError } = await supabase
  .from("subscriptions")
  .insert(subscriptionRow)
  .select("id")
  .single();

// ... existing error handling ...

await accrueCommissionForSubscription({
  subscriptionId: inserted.id,
  userId,
  tier: subscriptionTier,
  subscriptionAmount: amount,
});
```

On **update** path (existing stripe_subscription_id), call accrual only if transitioning to
new paid period (optional Phase D MVP: accrue on insert path only).

#### B. `src/lib/billing/approve-manual-payment.ts` — `approveManualPaymentNotification`

**Current:** `.insert({...})` without `.select()` (~line 63).

**Change:**

```typescript
const { data: inserted, error: subscriptionError } = await supabase
  .from("subscriptions")
  .insert({ /* existing fields */ })
  .select("id")
  .single();

// ... existing profile update ...

await accrueCommissionForSubscription({
  subscriptionId: inserted.id,
  userId: notification.user_id,
  tier,
  subscriptionAmount: notification.amount,
});
```

### 2.5 Bureau registration API

**New:** `POST /api/bureau/register` — authenticated; inserts `marriage_bureaus` with
`is_approved=false`, generates unique `referral_code`, stores payment proof path.
See `contracts/bureau-register-api.md`.

### 2.6 Admin bureau approval API

**New:** `POST /api/admin/approve-bureau` — admin gate; sets `is_approved`, commission fields.
Extends existing admin dashboard bureau tab. See `contracts/admin-approve-bureau-api.md`.

---

## §3 Frontend Architecture

### 3.1 Component tree — `src/app/[locale]/bureau/page.tsx`

```text
BureauPage (server or client shell — keep existing hero from landing)
├── Navigation
├── BureauLandingHero                    # existing motion hero — common.bureau.landing
├── BureauBenefits                       # existing — CTA → /bureau/register
├── BureauDirectorySection               # NEW wrapper
│   ├── BureauDirectorySearch            # city text input + optional city dropdown
│   │     props: value, onChange, placeholder from common.bureau.directory.search*
│   └── BureauDirectoryGrid
│         ├── BureauCard (× N)           # one per approved bureau
│         │     props: name, city, address, phone, email, referralCode, rating, totalReferrals
│         │     actions: tel:, mailto:, copy referral code
│         └── BureauDirectoryEmpty       # when filter yields zero results
└── Footer
```

### 3.2 Data loading — `BureauDirectory.tsx` refactor

**Remove:** `mockBureaus` static array.

**Add:** Supabase client query in `useEffect` or React Server Component fetch:

```typescript
supabase
  .from("marriage_bureaus")
  .select("id, name, city, address, phone, email, referral_code, rating, total_referrals")
  .eq("is_approved", true)
  .order("city", { ascending: true });
```

**Filter:** Client-side `searchCity` filters `city` (case-insensitive) — matches AC2.2.

**Security:** Query still passes RLS (`is_approved = true`); explicit `.eq` is defense in depth.

### 3.3 Registration page

`bureau/register/page.tsx` → on submit, `POST /api/bureau/register` with multipart proof;
show localized pending state; redirect to status view or dashboard message.

### 3.4 Admin dashboard

Extend bureau approve handler to send `commission_type`, `commission_rate` in approve payload;
set `is_approved` via API (not direct client update on protected fields).

---

## §4 i18n & RTL

### 4.1 Required namespaces

Extend `common.bureau` in **both** `locales/en/common.json` and `locales/ur/common.json`:

| Namespace key | Purpose |
|---------------|---------|
| `common.bureau.landing.*` | Hero, stats, benefits (exists — audit only) |
| `common.bureau.register.*` | Multi-step registration (exists — audit only) |
| `common.bureau.directory.title` | Directory section heading |
| `common.bureau.directory.subtitle` | Directory description |
| `common.bureau.directory.searchLabel` | Search input label |
| `common.bureau.directory.searchPlaceholder` | e.g. "Search by city…" |
| `common.bureau.directory.emptyTitle` | No results title |
| `common.bureau.directory.emptyDescription` | No results body |
| `common.bureau.directory.referralCode` | Card label |
| `common.bureau.directory.copyCode` | Copy CTA |
| `common.bureau.directory.copied` | Copy success toast |
| `common.bureau.directory.call` | Phone CTA |
| `common.bureau.directory.email` | Email CTA |
| `common.bureau.directory.referrals` | "{count} referrals" |
| `common.bureau.directory.rating` | Rating display |
| `common.bureau.directory.loading` | Fetch spinner |
| `common.bureau.directory.error` | Load failure |
| `common.bureau.referral.invalidCode` | Signup non-blocking warning |
| `common.bureau.referral.attributed` | Success banner on signup |

**Usage:**

```typescript
const t = useTranslations("common.bureau.directory");
```

### 4.2 RTL / Tailwind logical properties mandate

| Avoid | Use instead |
|-------|-------------|
| `ml-*`, `mr-*` | `ms-*`, `me-*` |
| `pl-*`, `pr-*` | `ps-*`, `pe-*` |
| `text-left`, `text-right` | `text-start`, `text-end` |
| `left-*`, `right-*` | `start-*`, `end-*` |
| `border-l-*`, `border-r-*` | `border-s-*`, `border-e-*` |
| `space-x-*` (in RTL rows) | `gap-*` with flex |

All new bureau directory components MUST pass RTL audit on `/ur/bureau` before merge.

---

## Implementation Phases

| Phase | Scope | Key deliverables |
|-------|-------|------------------|
| **1 — DB** | §1 migration applied | `bureau_commissions`, extended `marriage_bureaus`, RLS |
| **2 — Referral** | §2.1–§2.2 | middleware cookie, auth callback, attribute API |
| **3 — Accrual** | §2.3–§2.4 | `accrue-commission.ts`, webhook + manual hooks |
| **4 — Bureau CRUD** | §2.5–§2.6 | register API, admin approve API |
| **5 — UI** | §3–§4 | directory from DB, i18n keys, RTL refactor |
| **6 — QA** | spec SC-001–SC-006 | manual runbook (future `qa-runbook.md`) |

---

## Generated Artifacts

| File | Purpose |
|------|---------|
| `research.md` | Resolved technical decisions |
| `data-model.md` | Entity reference |
| `contracts/*.md` | API + UI contracts |
| `quickstart.md` | Local dev steps |

**Next command:** `/speckit-tasks`
