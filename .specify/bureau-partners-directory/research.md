# Research — Bureau Partners Directory (Phase D)

**Date:** 2026-06-29  
**Plan:** `specs/002-phase-d-bureau-partners/plan.md`

## R1 — Referral parameter capture

**Decision:** `?ref=<referral_code>` captured in `middleware.ts` → httpOnly cookie `ir_bureau_ref`; persisted to `profiles` at signup via auth callback + `/api/referral/attribute`.

**Rationale:** Middleware runs on all locale routes without changing every link. Cookie bridges anonymous landing → signup. Profile field is source of truth for commission (survives cookie loss).

**Alternatives considered:**
- localStorage only — rejected (not sent server-side, lost on upgrade).
- Query param on signup URL only — rejected (users navigate away before signup).

## R2 — Auth callback location

**Decision:** `src/app/auth/callback/route.ts` (locale-agnostic, Supabase recommended path).

**Rationale:** No callback route exists today. OAuth `redirectTo` must include `/auth/callback`. Email confirmation can use same handler.

**Alternatives considered:**
- `[locale]/auth/callback` — adds locale complexity to Supabase redirect URLs.

## R3 — Commission idempotency key

**Decision:** `UNIQUE(subscription_id)` on `bureau_commissions` + `ON CONFLICT DO NOTHING`.

**Rationale:** Matches Phase C webhook idempotency pattern; one commission per billing activation row.

**Alternatives considered:**
- Composite unique (bureau_id, user_id, period) — harder to align with subscription lifecycle.

## R4 — Percentage rate storage

**Decision:** Store decimal `0.2000` for 20% (not integer 20).

**Rationale:** Avoids divide-by-100 ambiguity in SQL and TypeScript; formula is `amount * rate`.

**Alternatives considered:**
- Integer basis points — more error-prone for admins.

## R5 — Directory public access

**Decision:** RLS policy `is_approved = true` for `anon` + `authenticated`; no separate API required for MVP.

**Rationale:** Supabase client query from `BureauDirectory` works for public listing; RLS is enforcement layer.

## R6 — `referred_by_bureau_id` column

**Decision:** Column already in `schema.sql`; migration adds trigger + index only.

**Rationale:** Avoid duplicate column errors; align with existing FK.

## R7 — Accrual on subscription update vs insert

**Decision:** Phase D accrues on **new insert** only (first activation per subscription row).

**Rationale:** Renewal accrual can be Phase E when renewal webhook creates new period rows.

**Alternatives considered:**
- Accrue on every `customer.subscription.updated` — scope creep for Phase D.
