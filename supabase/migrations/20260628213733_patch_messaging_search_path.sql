-- =============================================================================
-- Patch: lock search_path on enforce_messages_read_only_update()
-- Resolves Supabase advisor lint 0011 (function_search_path_mutable)
-- Feature: 20260629-013131-persistent-messaging
-- Applied on remote via MCP; version timestamp matches schema_migrations row.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.enforce_messages_read_only_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
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
