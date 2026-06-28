-- =============================================================================
-- Persistent Messaging — RLS, read-only UPDATE guard, index, Realtime
-- Feature: 20260629-013131-persistent-messaging
-- Constitution: .specify/persistent-messaging/constitution.md
-- Tasks: T003–T006 (US1)
-- =============================================================================
-- Apply via Supabase CLI (`supabase db push`) or SQL Editor.
-- After apply: Dashboard → Database → Replication → confirm public.messages.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- T003: Performance index for thread load and last-message lookups
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS messages_match_id_created_at_idx
  ON public.messages (match_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- T004: Strict INSERT — sender must be mutual-match participant
-- Drop legacy permissive INSERT (OR-combined policies would bypass mutual match)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in mutual matches" ON public.messages;

CREATE POLICY "Users can send messages in mutual matches"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id IS DISTINCT FROM receiver_id
    AND EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.id = match_id
        AND m.is_match = true
        AND (
          (m.user_id = sender_id AND m.matched_user_id = receiver_id)
          OR (m.user_id = receiver_id AND m.matched_user_id = sender_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- T005: Strict UPDATE — receiver may mark read / read_at only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Receivers can mark messages read" ON public.messages;

CREATE POLICY "Receivers can mark messages read"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = receiver_id
    AND read = true
  );

-- Column guard: RLS cannot restrict which columns change; trigger enforces read/read_at only
CREATE OR REPLACE FUNCTION public.enforce_messages_read_only_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
     OR NEW.match_id IS DISTINCT FROM OLD.match_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.encrypted IS DISTINCT FROM OLD.encrypted
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'messages: only read and read_at may be updated'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.read = true AND OLD.read IS DISTINCT FROM true THEN
    NEW.read_at := COALESCE(NEW.read_at, NOW());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_read_only_update ON public.messages;

CREATE TRIGGER messages_read_only_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_messages_read_only_update();

-- ---------------------------------------------------------------------------
-- DELETE: intentionally no policy — messages are immutable once sent
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- T006 / T008: Realtime publication for postgres_changes on messages
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

COMMIT;
