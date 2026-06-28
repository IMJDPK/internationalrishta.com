import { createClient } from "@/lib/supabase/client";
import {
  mapDbMessageToMessageRow,
  mapMessageRowToInsertPayload,
  type DbMessageRow,
  type MessageRow,
} from "@/lib/messaging/types";

export const PENDING_MESSAGE_PREFIX = "pending-";
export const MAX_MESSAGE_LENGTH = 2000;

export function isPendingMessageId(id: string): boolean {
  return id.startsWith(PENDING_MESSAGE_PREFIX);
}

export function createOptimisticMessage(
  senderId: string,
  receiverId: string,
  matchId: string,
  content: string
): MessageRow {
  const trimmed = content.trim();
  return {
    id: `${PENDING_MESSAGE_PREFIX}${crypto.randomUUID()}`,
    senderId,
    receiverId,
    matchId,
    content: trimmed,
    read: false,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
}

export interface SendMessageParams {
  senderId: string;
  receiverId: string;
  matchId: string;
  content: string;
}

export type SendMessageResult =
  | { ok: true; message: MessageRow }
  | { ok: false; errorCode: "empty" | "too_long" | "insert_failed" };

/**
 * Persist a message via the browser Supabase client (RLS-enforced INSERT).
 */
export async function insertMessage(
  params: SendMessageParams
): Promise<SendMessageResult> {
  const trimmed = params.content.trim();

  if (!trimmed) {
    return { ok: false, errorCode: "empty" };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, errorCode: "too_long" };
  }

  const supabase = createClient();
  const payload = mapMessageRowToInsertPayload({
    senderId: params.senderId,
    receiverId: params.receiverId,
    matchId: params.matchId,
    content: trimmed,
  });

  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select(
      "id, sender_id, receiver_id, match_id, content, encrypted, read, read_at, created_at"
    )
    .single();

  if (error || !data) {
    return { ok: false, errorCode: "insert_failed" };
  }

  return { ok: true, message: mapDbMessageToMessageRow(data as DbMessageRow) };
}

export interface OptimisticSendHandlers {
  onOptimistic: (message: MessageRow) => void;
  onSuccess: (pendingId: string, message: MessageRow) => void;
  onFailure: (pendingId: string) => void;
}

/**
 * Optimistic dispatch: append locally, INSERT, commit or rollback.
 */
export async function sendMessageWithOptimisticUpdate(
  params: SendMessageParams,
  handlers: OptimisticSendHandlers
): Promise<SendMessageResult> {
  const trimmed = params.content.trim();

  if (!trimmed) {
    return { ok: false, errorCode: "empty" };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, errorCode: "too_long" };
  }

  const optimistic = createOptimisticMessage(
    params.senderId,
    params.receiverId,
    params.matchId,
    trimmed
  );

  handlers.onOptimistic(optimistic);

  const result = await insertMessage(params);

  if (result.ok) {
    handlers.onSuccess(optimistic.id, result.message);
    return result;
  }

  handlers.onFailure(optimistic.id);
  return result;
}
