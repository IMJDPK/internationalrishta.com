"use client";

import { createClient } from "@/lib/supabase/client";
import {
  isPendingMessageId,
  sendMessageWithOptimisticUpdate,
  type SendMessageResult,
} from "@/lib/messaging/send-message";
import {
  mapDbMessageToMessageRow,
  WELCOME_THREAD_ID,
  type DbMessageRow,
  type MessageRow,
} from "@/lib/messaging/types";
import type {
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

export type MessageConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface UseMessageRealtimeOptions {
  matchId: string | null;
  userId: string;
  initialMessages: MessageRow[];
  onMessageInsert?: (message: MessageRow) => void;
  onMessageUpdate?: (message: MessageRow) => void;
}

export interface UseMessageRealtimeResult {
  messages: MessageRow[];
  connectionStatus: MessageConnectionStatus;
  isSending: boolean;
  sendMessage: (content: string, receiverId: string) => Promise<SendMessageResult>;
  setMessages: (messages: MessageRow[]) => void;
}

function mergeMessageUpdate(list: MessageRow[], updated: MessageRow): MessageRow[] {
  const index = list.findIndex((m) => m.id === updated.id);
  if (index === -1) return list;
  const next = [...list];
  next[index] = { ...next[index], ...updated };
  return next;
}

function appendMessageIfNew(list: MessageRow[], message: MessageRow): MessageRow[] {
  if (list.some((m) => m.id === message.id)) {
    return list;
  }
  return [...list, message];
}

function replacePendingMessage(
  list: MessageRow[],
  pendingId: string,
  confirmed: MessageRow
): MessageRow[] {
  const pendingIndex = list.findIndex((m) => m.id === pendingId);
  if (pendingIndex === -1) {
    return appendMessageIfNew(list, confirmed);
  }
  const next = [...list];
  next[pendingIndex] = confirmed;
  return next;
}

function removeMessageById(list: MessageRow[], id: string): MessageRow[] {
  return list.filter((m) => m.id !== id);
}

function shouldSubscribe(matchId: string | null): matchId is string {
  return Boolean(matchId && matchId !== WELCOME_THREAD_ID);
}

export function useMessageRealtime({
  matchId,
  userId,
  initialMessages,
  onMessageInsert,
  onMessageUpdate,
}: UseMessageRealtimeOptions): UseMessageRealtimeResult {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [connectionStatus, setConnectionStatus] =
    useState<MessageConnectionStatus>("idle");
  const [isSending, setIsSending] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const skipRealtimeIdsRef = useRef<Set<string>>(new Set());
  const onInsertRef = useRef(onMessageInsert);
  const onUpdateRef = useRef(onMessageUpdate);

  onInsertRef.current = onMessageInsert;
  onUpdateRef.current = onMessageUpdate;

  useEffect(() => {
    setMessages(initialMessages);
  }, [matchId, initialMessages]);

  useEffect(() => {
    if (!shouldSubscribe(matchId)) {
      setConnectionStatus("idle");
      return;
    }

    const supabase = createClient();
    const activeMatchId = matchId;
    setConnectionStatus("connecting");

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`messages:${activeMatchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeMatchId}`,
        },
        (payload) => {
          const row = mapDbMessageToMessageRow(payload.new as DbMessageRow);

          if (skipRealtimeIdsRef.current.has(row.id)) {
            skipRealtimeIdsRef.current.delete(row.id);
            return;
          }

          setMessages((prev) => {
            const withoutPendingEcho = prev.some(
              (m) =>
                isPendingMessageId(m.id) &&
                m.senderId === row.senderId &&
                m.content === row.content
            )
              ? prev.filter(
                  (m) =>
                    !isPendingMessageId(m.id) ||
                    m.senderId !== row.senderId ||
                    m.content !== row.content
                )
              : prev;

            return appendMessageIfNew(withoutPendingEcho, row);
          });

          onInsertRef.current?.(row);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeMatchId}`,
        },
        (payload) => {
          const row = mapDbMessageToMessageRow(payload.new as DbMessageRow);

          setMessages((prev) => mergeMessageUpdate(prev, row));
          onUpdateRef.current?.(row);
        }
      )
      .subscribe((status: REALTIME_SUBSCRIBE_STATES) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("error");
        } else if (status === "TIMED_OUT" || status === "CLOSED") {
          setConnectionStatus("disconnected");
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setConnectionStatus("idle");
    };
  }, [matchId, userId]);

  const sendMessage = useCallback(
    async (content: string, receiverId: string): Promise<SendMessageResult> => {
      if (!shouldSubscribe(matchId)) {
        return { ok: false, errorCode: "insert_failed" };
      }

      setIsSending(true);

      const result = await sendMessageWithOptimisticUpdate(
        {
          senderId: userId,
          receiverId,
          matchId: matchId!,
          content,
        },
        {
          onOptimistic: (optimistic) => {
            setMessages((prev) => appendMessageIfNew(prev, optimistic));
          },
          onSuccess: (pendingId, confirmed) => {
            skipRealtimeIdsRef.current.add(confirmed.id);
            setMessages((prev) => replacePendingMessage(prev, pendingId, confirmed));
            onInsertRef.current?.(confirmed);
          },
          onFailure: (pendingId) => {
            setMessages((prev) => removeMessageById(prev, pendingId));
          },
        }
      );

      setIsSending(false);
      return result;
    },
    [matchId, userId]
  );

  return {
    messages,
    connectionStatus,
    isSending,
    sendMessage,
    setMessages,
  };
}
