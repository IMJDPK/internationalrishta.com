"use client";

import { formatRelativeTime } from "@/lib/formatters";
import { WELCOME_THREAD_ID, type ConversationThread } from "@/lib/messaging/types";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ThreadListProps {
  locale: string;
  threads: ConversationThread[];
  selectedMatchId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectThread: (thread: ConversationThread) => void;
}

function threadMatchesSearch(thread: ConversationThread, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    thread.peerName.toLowerCase().includes(q) ||
    (thread.peerCity?.toLowerCase().includes(q) ?? false) ||
    (thread.lastMessageContent?.toLowerCase().includes(q) ?? false)
  );
}

export default function ThreadList({
  locale,
  threads,
  selectedMatchId,
  searchQuery,
  onSearchChange,
  onSelectThread,
}: ThreadListProps) {
  const t = useTranslations("common.messagesPage");

  const filteredThreads = threads.filter((thread) =>
    threadMatchesSearch(thread, searchQuery)
  );

  return (
    <div className="flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full min-h-0">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gold-50 to-teal-50 flex-shrink-0">
        <h2 className="font-bold text-gray-900 text-start">{t("conversations")}</h2>
        <p className="text-sm text-gray-500 text-start">
          {t("conversationCount", { count: threads.length })}
        </p>
        <label className="mt-3 block">
          <span className="sr-only">{t("searchThreads")}</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full mt-2 px-3 py-2 text-sm text-start border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white min-h-11"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
        {filteredThreads.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-start">{t("noSearchResults")}</p>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedMatchId === thread.matchId;
            const previewTime = thread.lastMessageAt
              ? formatRelativeTime(locale, thread.lastMessageAt, t("justNow"))
              : t("justNow");
            const isWelcome = thread.matchId === WELCOME_THREAD_ID;

            return (
              <button
                type="button"
                key={thread.matchId}
                onClick={() => onSelectThread(thread)}
                className={`w-full p-4 hover:bg-gray-50 transition-colors text-start min-h-16 ${
                  isSelected ? "bg-gold-50 border-s-4 border-gold-500" : "border-s-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {thread.avatarUrl ? (
                        <Image
                          src={thread.avatarUrl}
                          alt={thread.peerName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold text-lg">
                          {thread.peerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {thread.isOnline && (
                      <div
                        className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate text-start">
                        {thread.peerName}
                        {thread.peerAge != null && thread.peerAge > 0 ? `, ${thread.peerAge}` : ""}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">{previewTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-gray-500 truncate text-start">
                        {thread.lastMessageContent ?? t("selectConversationDesc")}
                      </p>
                      {thread.unreadCount > 0 ? (
                        <span
                          className="flex-shrink-0 min-w-5 h-5 bg-gold-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
                        >
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    {thread.peerCity && !isWelcome ? (
                      <p className="text-xs text-gray-400 mt-0.5 text-start">{thread.peerCity}</p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
