# Feature Specification — Persistent Messaging

**Branch:** `20260629-013131-persistent-messaging`  
**Status:** Approved for implementation  
**Constitution:** `.specify/persistent-messaging/constitution.md`

## Overview

Replace mock messaging data with persistent Supabase-backed text chat between mutually
matched users, with SSR conversation prefetch, scoped Realtime delivery, and bilingual RTL UI.

## User Stories

### US1 — Secure messaging database layer (Priority: P1)

**As a** platform operator  
**I want** RLS policies that enforce mutual-match messaging  
**So that** users cannot read or send messages outside authorized match threads.

**Independent test:** Non-participant INSERT/SELECT fails; mutual-match participants succeed.

### US2 — Bilingual messaging UI strings (Priority: P2)

**As a** user in English or Urdu  
**I want** all messaging labels, errors, and welcome content translated  
**So that** the chat experience is fully localized with honest security wording.

**Independent test:** All `messagesPage` keys exist in `en` and `ur`; no hardcoded chat strings.

### US3 — Server-prefetched conversation list (Priority: P1) 🎯 MVP entry

**As an** authenticated user  
**I want** my conversation list and first thread loaded on the server  
**So that** the messages page renders without layout shift.

**Independent test:** `/en/messages` first paint shows thread list without data-loading spinner.

### US4 — Real-time send and receive (Priority: P1) 🎯 MVP core

**As a** matched user  
**I want** messages to appear instantly for both parties  
**So that** chat feels live without refreshing the page.

**Independent test:** User A send → User B sees via Realtime; optimistic send works for A.

### US5 — RTL messaging components (Priority: P1)

**As a** Urdu user  
**I want** conversation list and chat window to use logical layout  
**So that** borders, padding, and alignment flip correctly in RTL.

**Independent test:** `/ur/messages` passes RTL visual check for list selection border and bubbles.

### US6 — Read receipts (Priority: P2)

**As a** message recipient  
**I want** messages marked read when I open a thread  
**So that** unread counts and read state stay accurate.

**Independent test:** Opening thread zeros unread; `read_at` set via receiver-only UPDATE.

## Out of scope

Voice, image, video messaging backends; admin moderation; pgcrypto column encryption (MVP).
