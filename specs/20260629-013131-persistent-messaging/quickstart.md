# Quickstart — Persistent Messaging (dev verification)

## Prerequisites

- Branch: `20260629-013131-persistent-messaging`
- Supabase project with `schema.sql` applied
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`

## 1. Apply messaging migration

In Supabase SQL Editor, run:

```bash
# File created by this feature
supabase/messaging-rls-migration.sql
```

Verify in Dashboard → Database → Replication: `messages` table enabled for Realtime.

## 2. Seed two mutual matches (test users A and B)

```sql
-- Replace UUIDs with real auth.users / profiles ids
INSERT INTO public.matches (user_id, matched_user_id, user_liked, matched_liked, is_match, matched_at)
VALUES
  ('USER_A_ID', 'USER_B_ID', true, true, true, now())
ON CONFLICT (user_id, matched_user_id) DO UPDATE SET is_match = true, matched_at = now();
```

## 3. Run app

```bash
npm run dev
```

Open `http://localhost:3000/en/messages` as User A.

## 4. Manual test checklist

- [ ] Conversation list shows mutual match (no mock names)
- [ ] Send text → persists after refresh
- [ ] User B sees message via Realtime without refresh
- [ ] User C cannot read thread (RLS)
- [ ] Opening thread marks messages read for receiver
- [ ] `/ur/messages` RTL layout correct
- [ ] Welcome thread visible without DB rows

## 5. Constitution gates

See `.specify/persistent-messaging/constitution.md` §7.
