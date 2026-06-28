"use client";

import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import {
  WELCOME_THREAD_ID,
  type ConversationThread,
  type MessageRow,
  type MessagesPageInitialData,
} from "@/lib/messaging/types";
import { useCallback, useMemo, useState } from "react";

interface MessagesClientProps {
  initialData: MessagesPageInitialData;
}

/**
 * State wireframe for persistent messaging — UI shells land in US5 tasks.
 */
export default function MessagesClient({ initialData }: MessagesClientProps) {
  const [threads, setThreads] = useState<ConversationThread[]>(
    initialData.initialThreads
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    initialData.initialMatchId
  );

  const threadInitialMessages = useMemo(() => {
    if (!selectedMatchId || selectedMatchId === WELCOME_THREAD_ID) {
      return [];
    }
    if (selectedMatchId === initialData.initialMatchId) {
      return initialData.initialMessages;
    }
    return [];
  }, [
    selectedMatchId,
    initialData.initialMatchId,
    initialData.initialMessages,
  ]);

  const updateThreadPreview = useCallback((message: MessageRow) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.matchId !== message.matchId) return thread;
        const isIncoming = message.receiverId === initialData.userId;
        return {
          ...thread,
          lastMessageContent: message.content,
          lastMessageAt: message.createdAt,
          unreadCount: isIncoming ? thread.unreadCount + 1 : thread.unreadCount,
        };
      })
    );
  }, [initialData.userId]);

  const applyReadReceipt = useCallback((message: MessageRow) => {
    if (!message.read) return;

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.matchId !== message.matchId) return thread;
        if (message.receiverId !== initialData.userId) return thread;
        return {
          ...thread,
          unreadCount: Math.max(0, thread.unreadCount - 1),
        };
      })
    );
  }, [initialData.userId]);

  const { messages, connectionStatus, isSending, sendMessage } = useMessageRealtime({
    matchId: selectedMatchId,
    userId: initialData.userId,
    initialMessages: threadInitialMessages,
    onMessageInsert: updateThreadPreview,
    onMessageUpdate: applyReadReceipt,
  });

  return (
    <div
      data-messages-client="wireframe"
      data-thread-count={threads.length}
      data-selected-match-id={selectedMatchId ?? ""}
      data-message-count={messages.length}
      data-connection-status={connectionStatus}
      data-is-sending={isSending}
      data-send-message={typeof sendMessage}
      data-select-match={typeof setSelectedMatchId}
      className="min-h-screen bg-gray-50"
    />
  );
}
