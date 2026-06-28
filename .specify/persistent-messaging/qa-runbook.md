# QA Runbook — Persistent Messaging (T030–T033)

**Branch:** `20260629-013131-persistent-messaging`  
**Feature laws:** `.specify/persistent-messaging/constitution.md`  
**Prerequisites:** Migration applied, Realtime enabled, `.env.local` configured

---

## Setup (all tests)

1. Apply `supabase/messaging-rls-migration.sql` (or `supabase/migrations/20260629154500_messaging_rls.sql`).
2. Confirm **Database → Replication → `public.messages`** is enabled.
3. Create three test accounts: **User A**, **User B** (mutual match), **User C** (stranger).
4. Seed mutual match (replace UUIDs):

```sql
INSERT INTO public.matches (user_id, matched_user_id, user_liked, matched_liked, is_match, matched_at)
VALUES ('USER_A_ID', 'USER_B_ID', true, true, true, now())
ON CONFLICT (user_id, matched_user_id) DO UPDATE SET is_match = true, matched_at = now();
```

5. Run `npm run dev` → `http://localhost:3000`

| Session | Browser | Account |
|---------|---------|---------|
| Window 1 | Normal | User A |
| Window 2 | Incognito | User B |
| Window 3 | Incognito (optional) | User C |

---

## T030 — Layout shift (SSR prefetch)

**Goal:** First paint shows conversation data without a full-page loading spinner.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as User A with at least one mutual match | Auth succeeds |
| 2 | Open `http://localhost:3000/en/messages` | No auth-check spinner; page renders immediately |
| 3 | Observe first paint (hard refresh) | Sidebar shows welcome + match rows; no empty→populated flash |
| 4 | Open DevTools → Network | HTML/RSC response includes server-fetched thread data (no client-only fetch for initial list) |
| 5 | Throttle CPU 4×, hard refresh | Structure still present on first paint; only images may lazy-load |

**Pass:** No `isCheckingAuth`-style blank state; thread list stable on first paint.

---

## T031 — Real-time sync (two sessions)

**Goal:** Messages appear on the peer device without manual refresh.

| Step | Action | Expected |
|------|--------|----------|
| 1 | User A: open mutual match thread (not welcome) | Thread loads |
| 2 | User B: open same match thread | Thread loads |
| 3 | User A: send `Hello from A` | Bubble appears immediately (optimistic) |
| 4 | User B (no refresh) | Message appears within ~2s |
| 5 | User B: reply `Hello from B` | Appears on B immediately |
| 6 | User A (no refresh) | B's reply appears without refresh |
| 7 | Hard refresh both windows | Both messages persist |

**Pass:** Bidirectional live delivery; persistence after refresh.

---

## T032 — Read receipts & unread badges

**Goal:** Opening a thread clears unread UI; DB `read` / `read_at` updated for receiver.

| Step | Action | Expected |
|------|--------|----------|
| 1 | User B sends 2 messages while User A is on welcome thread | User A sidebar shows unread badge on match |
| 2 | User A selects that match thread | Badge clears immediately (optimistic) |
| 3 | User A header unread count decreases | Matches cleared badges |
| 4 | Supabase SQL as admin: | |
| | `SELECT read, read_at FROM messages WHERE receiver_id = 'USER_A_ID' ORDER BY created_at DESC LIMIT 5;` | `read = true`, `read_at` populated |
| 5 | User B sends another message while A views thread | Badge may increment; opening again clears |

**Pass:** Optimistic UI + DB `read`/`read_at` for receiver only.

---

## T033 — RTL UI (`/ur/messages`)

**Goal:** Logical layout flips per constitution §4.2.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `http://localhost:3000/ur/messages` signed in as User A | `dir=rtl` on document |
| 2 | Inspect selected thread row | Gold accent on **start** side (`border-s-*`), not physical left |
| 3 | Check thread text | Names/snippets `text-start` aligned for RTL |
| 4 | Open a match; send/receive bubbles | Sent bubbles on inline-end; received on inline-start |
| 5 | Toggle locale EN ↔ UR via nav switcher | Layout mirrors; no broken overflow |
| 6 | Mobile width: select thread | Back chevron on start side; chat fills screen |

**Pass:** No hardcoded `pl`/`pr`/`text-left` regressions in messaging components.

---

## T033 — RLS (third user)

**Goal:** User C cannot access A↔B messages.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as User C | — |
| 2 | Open `/en/messages` | No A↔B thread (or empty if no own matches) |
| 3 | Supabase SQL Editor as User C JWT (or API with C's session): | |
| | `SELECT * FROM messages WHERE match_id = '<A_B_MATCH_ID>';` | 0 rows |
| 4 | Attempt INSERT as C into A↔B thread | RLS error / policy violation |

**Pass:** Stranger cannot SELECT or INSERT into others' threads.

---

## Constitution §7 quick matrix

| # | Check | T030–T033 |
|---|-------|-----------|
| 1 | Mutual match messaging works | T031 |
| 2 | Third user blocked | T033 RLS |
| 3 | Receiver read UPDATE | T032 |
| 4 | Realtime delivery | T031 |
| 5 | `/ur` RTL | T032 |
| 6 | i18n keys present | Visual on `/ur` |
| 7 | Welcome thread, no DB rows | T030 sidebar |

---

## Sign-off

| Tester | Date | T030 | T031 | T032 | T033 RLS | T033 RTL | Notes |
|--------|------|------|------|------|----------|----------|-------|
| | | ☐ | ☐ | ☐ | ☐ | ☐ | |
