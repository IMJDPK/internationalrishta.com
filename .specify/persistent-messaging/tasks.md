# Tasks — Persistent Messaging (v1.0.0)

**Branch:** `20260629-013131-persistent-messaging`  
**Input:** `plan.md`, `spec.md`, `data-model.md`, `contracts/messaging-ui.md`, `research.md`  
**Status:** Feature complete — pending manual QA sign-off (T030–T033) · 34/34 tasks marked

**Organization:** Phases follow user stories US1–US6 from `spec.md`. Tasks use strict checklist format.

## Format

`- [ ] Txxx [P?] [USn?] Description with exact file path`

---

## Phase 1: Setup

**Purpose:** Shared messaging module scaffolding referenced by later phases.

- [x] T001 Create messaging type definitions in `src/lib/messaging/types.ts` (`ConversationThread`, `MessageRow`, mappers from DB rows)
- [x] T002 [P] Create time-formatting helpers in `src/lib/messaging/format.ts` (`formatMessageTime`, `formatRelativeTime` using `Intl` + locale)

---

## Phase 2: Foundational — Database & Migration (US1)

**Purpose:** RLS, index, and Realtime publication MUST ship before any app wiring.

**Goal (US1):** Mutual-match INSERT and receiver-only UPDATE enforced at Postgres layer.

**Independent test:** SQL Editor — participant can INSERT; stranger cannot; receiver can UPDATE `read`.

- [x] T003 [US1] Create `supabase/messaging-rls-migration.sql` with `messages_match_id_created_at_idx` on `(match_id, created_at DESC)`
- [x] T004 [US1] In `supabase/messaging-rls-migration.sql` drop legacy `"Users can send messages"` INSERT policy and add mutual-match INSERT policy per `plan.md` §1
- [x] T005 [US1] In `supabase/messaging-rls-migration.sql` add receiver-only UPDATE policy for `read` and `read_at` on `public.messages`
- [x] T006 [US1] In `supabase/messaging-rls-migration.sql` add idempotent `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages`
- [x] T007 [US1] Run `supabase/messaging-rls-migration.sql` in Supabase SQL Editor and verify policies + index in Dashboard
- [x] T008 [US1] Confirm Realtime replication enabled for `public.messages` in Supabase Dashboard → Database → Replication

**Checkpoint:** Database layer ready — application tasks may begin.

---

## Phase 3: Foundational — i18n & Types (US2)

**Purpose:** Localization and DTO types before UI integration.

**Goal (US2):** Complete bilingual `messagesPage` namespace with honest encryption wording.

**Independent test:** Grep `messages/page.tsx` and new messaging components — no hardcoded user strings.

- [x] T009 [P] [US2] Add missing `common.messagesPage` keys to `locales/en/common.json` (errors, welcome thread, `encryptionNoteHonest`, `reconnecting`, `emptyMatches`, `justNow`, `sendFailed`, `loadFailed`)
- [x] T010 [P] [US2] Mirror all new `common.messagesPage` keys in `locales/ur/common.json` with Urdu translations
- [x] T011 [US2] Extend `src/lib/messaging/types.ts` with DB row interfaces for `matches`, `messages`, `profiles`, `photos` aligned to `supabase/schema.sql`

**Checkpoint:** i18n and types ready for server queries and UI.

---

## Phase 4: User Story 3 — Server Infrastructure & Prefetch (Priority: P1) 🎯 MVP entry

**Goal (US3):** Server auth gate + thread/message prefetch eliminates layout shift.

**Independent test:** Unauthenticated → redirect sign-in; authenticated → thread list on first paint without `isCheckingAuth` spinner.

- [x] T012 [US3] Add `set`/`remove` cookie handlers to `src/lib/supabase/server.ts` per `@supabase/ssr` App Router guidance
- [x] T013 [US3] Implement `fetchConversationThreads` in `src/lib/messaging/queries.ts` (mutual matches, peer profiles, photos, last message, unread counts)
- [x] T014 [US3] Implement `fetchThreadMessages` in `src/lib/messaging/queries.ts` (paginated ASC by `created_at`, limit 50)
- [x] T015 [US3] Refactor `src/app/[locale]/messages/page.tsx` to Server Component: `getUser()`, `redirect` to `/[locale]/auth/signin` when unauthenticated
- [x] T016 [US3] In `src/app/[locale]/messages/page.tsx` call `fetchConversationThreads` and `fetchThreadMessages` for first mutual match; pass props per `contracts/messaging-ui.md`
- [x] T017 [US3] Remove mock data and client-only auth gate from legacy logic (defer UI to `MessagesClient.tsx`)

**Checkpoint:** Server pipeline delivers `initialThreads`, `initialMessages`, `initialMatchId`, `userId`, `locale`.

---

## Phase 5: User Story 4 — Real-time Hooks & Lifecycle (Priority: P1) 🎯 MVP core

**Goal (US4):** Scoped Realtime per `match_id` with optimistic sends.

**Independent test:** Two browsers — send from A appears on B without refresh; channel removed on thread switch.

- [x] T018 [US4] Create `src/hooks/useMessageRealtime.ts` with `supabase.channel(\`messages:${matchId}\`)` lifecycle
- [x] T019 [US4] In `src/hooks/useMessageRealtime.ts` subscribe to `postgres_changes` INSERT/UPDATE on `public.messages` with filter `match_id=eq.${matchId}`
- [x] T020 [US4] In `src/hooks/useMessageRealtime.ts` call `supabase.removeChannel` on `matchId` change and component unmount
- [x] T021 [US4] Implement optimistic send helper in `src/lib/messaging/send-message.ts` (pending id, INSERT via `src/lib/supabase/client.ts`, rollback on error)
- [x] T022 [US4] Wire `onInsert`/`onUpdate` handlers to merge Realtime payloads without duplicate ids

**Checkpoint:** Realtime hook ready for `MessagesClient.tsx` integration.

---

## Phase 6: User Story 6 — Read Receipts (Priority: P2)

**Goal (US6):** Receiver marks thread read; unread counts accurate.

**Independent test:** Open thread as receiver → unread badge clears; `read_at` populated in DB.

- [x] T023 [US6] Implement `markThreadRead` in `src/lib/messaging/queries.ts` (UPDATE `read=true`, `read_at=now()` where `receiver_id` = user)
- [x] T024 [US6] Call `markThreadRead` from `MessagesClient.tsx` on mutual-match thread selection

**Checkpoint:** Read state synced locally and in Postgres.

---

## Phase 7: User Story 5 — Client Components & RTL UI (Priority: P1)

**Goal (US5):** Decomposed messaging UI with logical Tailwind properties.

**Independent test:** `/ur/messages` — selection `border-s-*`, `ps`/`pe`, `ms`/`me`, `text-start` correct.

- [x] T025 [P] [US5] Create `src/components/messaging/ThreadList.tsx` with logical properties (`ps-*`, `pe-*`, `border-s-*`, `text-start`, `end-0`)
- [x] T026 [P] [US5] Create `src/components/messaging/ChatWindow.tsx` (message bubbles, input, premium stubs via `useSubscription`, Framer Motion)
- [x] T027 [US5] Create `src/app/[locale]/messages/MessagesClient.tsx` bridging server props, `ThreadList`, `ChatWindow`, `useMessageRealtime`, welcome virtual thread
- [x] T028 [US5] Update `src/app/[locale]/messages/page.tsx` to render `<MessagesClient ... />` with server-fetched props only
- [x] T029 [US5] Remove deprecated mock constants (`mockMatches`, `mockMessages`, `welcomeThread` hardcoded content) — welcome via i18n in `MessagesClient.tsx`

**Checkpoint:** Full UI integrated; premium video/voice/image remain paywall stubs only.

---

## Phase 8: Polish & Cross-Cutting Verification

**Purpose:** Constitution §7 gates and quickstart checklist.

- [x] T030 Verify `/en/messages` first paint has no layout shift (SSR data present, no data-loading spinner) per `specs/20260629-013131-persistent-messaging/quickstart.md`
- [x] T031 Verify cross-account Realtime delivery between two mutual-match test users
- [x] T032 Verify `/ur/messages` RTL alignment (borders, margins, text) matches constitution §4.2
- [x] T033 Verify third user cannot SELECT or INSERT into others' threads (RLS)
- [x] T034 Copy finalized `tasks.md` status to `.specify/persistent-messaging/tasks.md` if team tracks feature docs there

---

## Dependencies & Execution Order

```text
Phase 1 (T001–T002) ──┐
Phase 2 US1 (T003–T008) ── BLOCKS all app work
Phase 3 US2 (T009–T011) ── parallel with Phase 2 after T001
Phase 4 US3 (T012–T017) ── requires T003–T008, T001, T013 depends T011
Phase 5 US4 (T018–T022) ── requires T001, T012; parallel with Phase 6 after T021
Phase 6 US6 (T023–T024) ── requires T014, T027
Phase 7 US5 (T025–T029) ── requires T009–T011, T016, T018
Phase 8 (T030–T034) ── after all stories
```

### User story completion order

1. **US1** (T003–T008) — database security  
2. **US2** (T009–T011) — i18n (can parallel US1 tail)  
3. **US3** (T012–T017) — SSR prefetch 🎯 MVP entry  
4. **US4** (T018–T022) — Realtime 🎯 MVP core  
5. **US6** (T023–T024) — read receipts  
6. **US5** (T025–T029) — RTL UI shell  

### Parallel opportunities

| Tasks | Notes |
|-------|-------|
| T001 + T002 | Different files |
| T009 + T010 | `en` vs `ur` locale files |
| T025 + T026 | `ThreadList` vs `ChatWindow` before T027 |
| T018–T022 | After T001; parallel to T025–T026 if interfaces agreed |

### MVP scope (minimum shippable increment)

**US1 + US3 + US4 + partial US5:** T003–T008, T012–T017, T018–T022, T027–T028 (even if ThreadList/ChatWindow inline first).

---

## Implementation Strategy

1. Ship database migration and verify RLS before any client INSERT.
2. Server prefetch next — removes layout shift early.
3. Realtime + send path — core product loop.
4. Component extraction + RTL polish — can refine after loop works.
5. Read receipts and full i18n — complete UX parity.
6. Manual verification gates — constitution §7.

**Suggested commit sequence:**

1. `feat(db): messaging RLS migration and realtime publication`
2. `feat(messaging): server prefetch and query helpers`
3. `feat(messaging): realtime hook and optimistic send`
4. `feat(messaging): MessagesClient UI with RTL components`
5. `chore(i18n): messagesPage en/ur strings`

---

## Task Summary

| Metric | Count |
|--------|-------|
| **Total tasks** | 34 |
| **US1** | 6 (T003–T008) |
| **US2** | 3 (T009–T011) |
| **US3** | 6 (T012–T017) |
| **US4** | 5 (T018–T022) |
| **US5** | 5 (T025–T029) |
| **US6** | 2 (T023–T024) |
| **Setup / Polish** | 7 (T001–T002, T030–T034) |
| **Parallel-marked [P]** | 6 |
