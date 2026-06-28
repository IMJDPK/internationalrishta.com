"use client";

import ChatWindow from "@/components/messaging/ChatWindow";
import ThreadList from "@/components/messaging/ThreadList";
import Navigation from "@/components/Navigation";
import SubscriptionPaywall, {
  type PaywallFeature,
} from "@/components/SubscriptionPaywall";
import VideoCallModal from "@/components/VideoCallModal";
import { ASSETS } from "@/lib/assets";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchThreadMessages, markThreadRead } from "@/lib/messaging/queries";
import { createClient } from "@/lib/supabase/client";
import {
  WELCOME_THREAD_ID,
  type ConversationThread,
  type MessageRow,
  type MessagesPageInitialData,
} from "@/lib/messaging/types";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

interface MessagesClientProps {
  initialData: MessagesPageInitialData;
}

function markMessagesReadLocally(
  messages: MessageRow[],
  userId: string
): MessageRow[] {
  const now = new Date().toISOString();
  return messages.map((m) =>
    m.receiverId === userId && !m.read
      ? { ...m, read: true, readAt: now }
      : m
  );
}

export default function MessagesClient({ initialData }: MessagesClientProps) {
  const t = useTranslations("common.messagesPage");
  const locale = useLocale();
  const subscription = useSubscription();

  const [threads, setThreads] = useState<ConversationThread[]>(
    initialData.initialThreads
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
    WELCOME_THREAD_ID
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [paywallFeature, setPaywallFeature] = useState<PaywallFeature | null>(
    null
  );
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const [messageCache, setMessageCache] = useState<Record<string, MessageRow[]>>(
    () => {
      const cache: Record<string, MessageRow[]> = {};
      if (initialData.initialMatchId) {
        cache[initialData.initialMatchId] = initialData.initialMessages;
      }
      return cache;
    }
  );

  const welcomeThread = useMemo<ConversationThread>(
    () => ({
      matchId: WELCOME_THREAD_ID,
      peerId: "team",
      peerName: t("welcomeName"),
      peerCity: t("welcomeCity"),
      peerAge: null,
      avatarUrl: ASSETS.logo,
      lastMessageContent: t("welcomeMessage1"),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      isOnline: true,
    }),
    [t]
  );

  const welcomeMessages = useMemo<MessageRow[]>(
    () => [
      {
        id: "welcome-1",
        senderId: "team",
        receiverId: initialData.userId,
        matchId: WELCOME_THREAD_ID,
        content: t("welcomeMessage1"),
        read: true,
        readAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "welcome-2",
        senderId: "team",
        receiverId: initialData.userId,
        matchId: WELCOME_THREAD_ID,
        content: t("welcomeMessage2"),
        read: true,
        readAt: null,
        createdAt: new Date().toISOString(),
      },
    ],
    [initialData.userId, t]
  );

  const displayThreads = useMemo(
    () => [welcomeThread, ...threads],
    [welcomeThread, threads]
  );

  const threadInitialMessages = useMemo(() => {
    if (!selectedMatchId || selectedMatchId === WELCOME_THREAD_ID) {
      return [];
    }
    return messageCache[selectedMatchId] ?? [];
  }, [selectedMatchId, messageCache]);

  const updateThreadPreview = useCallback(
    (message: MessageRow) => {
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.matchId !== message.matchId) return thread;
          const isIncoming = message.receiverId === initialData.userId;
          return {
            ...thread,
            lastMessageContent: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: isIncoming
              ? thread.unreadCount + 1
              : thread.unreadCount,
          };
        })
      );
    },
    [initialData.userId]
  );

  const applyReadReceipt = useCallback(
    (message: MessageRow) => {
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

      setMessageCache((prev) => {
        const cached = prev[message.matchId];
        if (!cached) return prev;
        return {
          ...prev,
          [message.matchId]: cached.map((m) =>
            m.id === message.id ? { ...m, read: true, readAt: message.readAt } : m
          ),
        };
      });
    },
    [initialData.userId]
  );

  const {
    messages: liveMessages,
    connectionStatus,
    isSending,
    sendMessage,
    setMessages,
  } = useMessageRealtime({
    matchId: selectedMatchId,
    userId: initialData.userId,
    initialMessages: threadInitialMessages,
    onMessageInsert: updateThreadPreview,
    onMessageUpdate: applyReadReceipt,
  });

  const activeMessages =
    selectedMatchId === WELCOME_THREAD_ID ? welcomeMessages : liveMessages;

  const selectedThread = displayThreads.find(
    (thread) => thread.matchId === selectedMatchId
  );

  const totalUnread = displayThreads.reduce(
    (sum, thread) => sum + thread.unreadCount,
    0
  );

  const handleSelectThread = useCallback(
    async (thread: ConversationThread) => {
      setSelectedMatchId(thread.matchId);
      setIsMobileListOpen(false);
      setSendError(null);

      if (thread.matchId === WELCOME_THREAD_ID) {
        return;
      }

      setThreads((prev) =>
        prev.map((item) =>
          item.matchId === thread.matchId ? { ...item, unreadCount: 0 } : item
        )
      );

      const cached = messageCache[thread.matchId];

      if (cached?.length) {
        const readMessages = markMessagesReadLocally(cached, initialData.userId);
        setMessageCache((prev) => ({
          ...prev,
          [thread.matchId]: readMessages,
        }));
        setMessages(readMessages);
        const supabase = createClient();
        void markThreadRead(supabase, thread.matchId, initialData.userId);
        return;
      }

      setIsLoadingThread(true);
      const supabase = createClient();
      const fetched = await fetchThreadMessages(supabase, thread.matchId);
      const readMessages = markMessagesReadLocally(fetched, initialData.userId);
      setMessageCache((prev) => ({
        ...prev,
        [thread.matchId]: readMessages,
      }));
      setIsLoadingThread(false);
      void markThreadRead(supabase, thread.matchId, initialData.userId);
    },
    [initialData.userId, messageCache, setMessages]
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!selectedThread || selectedThread.matchId === WELCOME_THREAD_ID) {
        return;
      }

      setSendError(null);
      const result = await sendMessage(content, selectedThread.peerId);

      if (!result.ok) {
        if (result.errorCode === "too_long") {
          setSendError(t("messageTooLong"));
        } else if (result.errorCode === "empty") {
          return;
        } else {
          setSendError(t("sendFailed"));
        }
      }
    },
    [selectedThread, sendMessage, t]
  );

  const handlePremiumAction = useCallback(
    (feature: PaywallFeature, action: () => void) => {
      if (!subscription.hasPremium) {
        setPaywallFeature(feature);
        return;
      }
      action();
    },
    [subscription.hasPremium]
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      <Navigation />

      <div className="pt-20 h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="text-start min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {t("title")}
            </h1>
            {totalUnread > 0 ? (
              <p className="text-sm text-gold-600 font-medium">
                {t("unread", { count: totalUnread })}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 hidden sm:inline">
              {t("online")}
            </span>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {t("emptyMatches")}
              </p>
              <p className="text-gray-500 mb-4">{t("emptyMatchesDesc")}</p>
              <Link
                href={`/${locale}/discover`}
                className="inline-flex items-center justify-center min-h-11 px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors"
              >
                {t("emptyMatchesCta")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto px-4 py-4 gap-4 min-h-0">
            <div
              className={`${isMobileListOpen ? "flex" : "hidden"} md:flex flex-col min-h-0 h-full`}
            >
              <ThreadList
                locale={locale}
                threads={displayThreads}
                selectedMatchId={selectedMatchId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectThread={handleSelectThread}
              />
            </div>

            <div
              className={`${!isMobileListOpen ? "flex" : "hidden"} md:flex flex-col flex-1 min-h-0 h-full`}
            >
              {isLoadingThread ? (
                <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-200">
                  <p className="text-gray-500">{t("loading")}</p>
                </div>
              ) : (
                <ChatWindow
                  locale={locale}
                  userId={initialData.userId}
                  matchId={selectedMatchId}
                  peerName={selectedThread?.peerName ?? ""}
                  peerAge={selectedThread?.peerAge ?? null}
                  peerAvatarUrl={selectedThread?.avatarUrl ?? null}
                  peerOnline={selectedThread?.isOnline ?? false}
                  messages={activeMessages}
                  connectionStatus={connectionStatus}
                  isSending={isSending}
                  hasPremium={subscription.hasPremium}
                  sendError={sendError}
                  onSend={handleSend}
                  onPremiumAction={handlePremiumAction}
                  onVideoCall={() => setShowVideoCall(true)}
                  onBackToList={() => setIsMobileListOpen(true)}
                  showBackButton={!isMobileListOpen}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {selectedThread && selectedThread.matchId !== WELCOME_THREAD_ID ? (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          matchName={selectedThread.peerName}
          matchImage={selectedThread.avatarUrl ?? ASSETS.logo}
        />
      ) : null}

      <SubscriptionPaywall
        isOpen={paywallFeature !== null}
        onClose={() => setPaywallFeature(null)}
        feature={paywallFeature ?? "videoCall"}
      />
    </main>
  );
}
