"use client";

import { formatMessageTime } from "@/lib/formatters";
import { WELCOME_THREAD_ID, type MessageRow } from "@/lib/messaging/types";
import type { MessageConnectionStatus } from "@/hooks/useMessageRealtime";
import type { PaywallFeature } from "@/components/SubscriptionPaywall";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  locale: string;
  userId: string;
  matchId: string | null;
  peerName: string;
  peerAge: number | null;
  peerAvatarUrl: string | null;
  peerOnline: boolean;
  messages: MessageRow[];
  connectionStatus: MessageConnectionStatus;
  isSending: boolean;
  isTyping?: boolean;
  hasPremium: boolean;
  sendError: string | null;
  onSend: (content: string) => Promise<void>;
  onPremiumAction: (feature: PaywallFeature, action: () => void) => void;
  onVideoCall: () => void;
  onBackToList?: () => void;
  showBackButton?: boolean;
}

export default function ChatWindow({
  locale,
  userId,
  matchId,
  peerName,
  peerAge,
  peerAvatarUrl,
  peerOnline,
  messages,
  connectionStatus,
  isSending,
  isTyping = false,
  hasPremium,
  sendError,
  onSend,
  onPremiumAction,
  onVideoCall,
  onBackToList,
  showBackButton = false,
}: ChatWindowProps) {
  const t = useTranslations("common.messagesPage");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWelcome = matchId === WELCOME_THREAD_ID;
  const isChatReady = Boolean(matchId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isWelcome || isSending) return;
    const content = newMessage;
    setNewMessage("");
    await onSend(content);
  };

  if (!isChatReady) {
    return (
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-0 items-center justify-center">
        <div className="text-center py-12 px-4">
          <div className="text-6xl mb-4" aria-hidden="true">💬</div>
          <p className="text-xl font-semibold text-gray-900 mb-2 text-start">
            {t("selectConversation")}
          </p>
          <p className="text-gray-500 text-start">{t("selectConversationDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBackButton && onBackToList ? (
            <button
              type="button"
              onClick={onBackToList}
              className="md:hidden min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label={t("backToMatches")}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {peerAvatarUrl ? (
                <Image
                  src={peerAvatarUrl}
                  alt={peerName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold">
                  {peerName.charAt(0)}
                </div>
              )}
            </div>
            {peerOnline && (
              <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0 text-start">
            <h3 className="font-bold text-gray-900 truncate">
              {peerName}
              {peerAge != null && peerAge > 0 ? `, ${peerAge}` : ""}
            </h3>
            <p className="text-xs text-gray-500">
              {peerOnline ? (
                <span className="text-green-600 font-medium">{t("activeNow")}</span>
              ) : (
                t("lastActive")
              )}
            </p>
          </div>
        </div>
        {!isWelcome ? (
          <button
            type="button"
            onClick={() => onPremiumAction("videoCall", onVideoCall)}
            className="min-h-11 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm flex-shrink-0"
            title={hasPremium ? t("videoCall") : t("premiumVideoCall")}
          >
            {!hasPremium && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">{t("videoCall")}</span>
          </button>
        ) : null}
      </div>

      {/* Connection status */}
      {connectionStatus === "connecting" ? (
        <p className="text-xs text-gold-600 text-center py-2 bg-gold-50 border-b border-gold-100">
          {t("reconnecting")}
        </p>
      ) : null}
      {connectionStatus === "error" || connectionStatus === "disconnected" ? (
        <p className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-b border-gray-100">
          {t("reconnectFailed")}
        </p>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.senderId === userId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && peerAvatarUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 me-2 self-end">
                    <Image
                      src={peerAvatarUrl}
                      alt={peerName}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : null}
                <div
                  className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-start ${
                    isOwn
                      ? "bg-gold-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-base leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {formatMessageTime(locale, msg.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping ? (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-2xl rounded-bl-sm text-start">
              {t("typing")}
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      {/* Encryption note */}
      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center py-2 border-t border-gray-50 px-4">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>{t("encryptionNoteHonest")}</span>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        {sendError ? (
          <p className="text-sm text-red-600 mb-2 text-start" role="alert">{sendError}</p>
        ) : null}
        <div className="flex gap-2 items-center">
          {!isWelcome ? (
            <>
              <button
                type="button"
                onClick={() => onPremiumAction("voiceMessage", () => {})}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0 relative"
                aria-label={t("sendVoice")}
                title={hasPremium ? t("sendVoice") : t("premiumVoice")}
              >
                {!hasPremium && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onPremiumAction("imageMessage", () => {})}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0 relative"
                aria-label={t("sendImage")}
                title={hasPremium ? t("sendImage") : t("premiumImage")}
              >
                {!hasPremium && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </>
          ) : null}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("typeMessage")}
            disabled={isWelcome}
            className="flex-1 px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors min-h-11 text-start disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim() || isWelcome || isSending}
            className="min-h-11 min-w-11 px-4 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            aria-label={t("send")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
