# Research — Persistent Messaging

**Feature:** `20260629-013131-persistent-messaging`  
**Date:** 2026-06-29

## R1 — RLS policy replacement vs additive policies

- **Decision:** DROP existing weak `INSERT` policy on `messages` before creating the mutual-match policy.
- **Rationale:** PostgreSQL RLS combines permissive policies with OR; keeping
  `WITH CHECK (auth.uid() = sender_id)` would bypass mutual-match enforcement.
- **Alternatives considered:** `RESTRICTIVE` policy layer (more complex); app-only checks (rejected by constitution).

## R2 — Matches SELECT policy for messaging

- **Decision:** Do **not** add a global `is_match = true` SELECT policy on `matches`; filter in queries only.
- **Rationale:** Discover/swipe feature needs pre-match rows visible to participants; constitution allows this path.
- **Alternatives considered:** `SECURITY DEFINER` view for messaging-only reads (deferred unless discover conflicts).

## R3 — Server vs client initial fetch

- **Decision:** Server Component `page.tsx` fetches threads + first-thread messages; client hydrates without data-loading spinner.
- **Rationale:** Eliminates layout shift from client-only `isCheckingAuth` + empty-state → populated list transition.
- **Alternatives considered:** Client-only fetch (current pattern, rejected); React Query cache (unnecessary for MVP).

## R4 — Realtime channel scoping

- **Decision:** One `supabase.channel(\`messages:${matchId}\`)` with `postgres_changes` filter `match_id=eq.${matchId}`.
- **Rationale:** Minimizes websocket payload; aligns with RLS; constitution §2.6.
- **Alternatives considered:** User-wide channel filtered client-side (rejected — leaks metadata).

## R5 — Conversation list aggregation

- **Decision:** Server helper runs (1) mutual matches query with profile join, (2) batch last-message query, (3) unread count query.
- **Rationale:** No `conversations` table in `schema.sql`; avoids new table for MVP.
- **Alternatives considered:** SQL view/RPC `get_conversation_threads` (optional Phase 1.5 optimization).

## R6 — Encryption UI wording

- **Decision:** Update `encryptionNote` i18n to transport + at-rest wording until pgcrypto ships.
- **Rationale:** Constitution §2.5; `encrypted` column defaults true but content is plaintext at MVP.
- **Alternatives considered:** Remove encryption badge (rejected — keep security UX with honest text).

## R7 — `COMPLETE_PAYMENT_ADMIN_MIGRATION.sql` impact

- **Decision:** No messaging tables or policies in payment migration; messaging migration is standalone file.
- **Rationale:** Grep shows no message/match changes in that file; keeps deploy order simple.
- **Alternatives considered:** Append to COMPLETE migration (rejected — unrelated domain).

## R8 — Supabase server client cookie handling

- **Decision:** Extend `server.ts` with `set`/`remove` cookie handlers per `@supabase/ssr` App Router guidance.
- **Rationale:** Ensures session refresh during server-side `getUser()` and queries.
- **Alternatives considered:** Read-only cookies (current code — insufficient for production SSR auth).
