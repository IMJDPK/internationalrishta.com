"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import VideoCallModal from "@/components/VideoCallModal";
import { useSubscription } from "@/hooks/useSubscription";
import Image from "next/image";
import { useState } from "react";

interface Match {
  id: string;
  name: string;
  age: number;
  city: string;
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  online?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Mock data
const mockMatches: Match[] = [
  {
    id: "1",
    name: "Ayesha K.",
    age: 26,
    city: "Lahore",
    image: "/assets/profile/Pasted imagegirls.png",
    lastMessage: "Looking forward to connecting!",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    online: true,
  },
  {
    id: "2",
    name: "Ahmed R.",
    age: 29,
    city: "Karachi",
    image: "/assets/profile/man1.png",
    lastMessage: "Thank you for accepting!",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    online: false,
  },
  {
    id: "3",
    name: "Fatima S.",
    age: 24,
    city: "Islamabad",
    image: "/assets/profile/Pasted image (2)girls.png",
    lastMessage: "Would love to chat more",
    lastMessageTime: "3h ago",
    unreadCount: 1,
    online: true,
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      content: "Assalam o Alaikum! Thank you for connecting.",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "2",
      senderId: "me",
      content: "Walaikum Assalam! Nice to meet you.",
      timestamp: "10:32 AM",
      read: true,
    },
    {
      id: "3",
      senderId: "1",
      content: "Looking forward to connecting!",
      timestamp: "10:35 AM",
      read: false,
    },
  ],
};

export default function MessagesPage() {
  const subscription = useSubscription();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const handleSelectMatch = (match: Match) => {
    if (!subscription.features.messaging) {
      setShowPaywall(true);
      return;
    }
    setSelectedMatch(match);
    setMessages(mockMessages[match.id] || []);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMatch) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleVideoCall = () => {
    if (!subscription.features.videoCall) {
      setShowPaywall(true);
      return;
    }
    setShowVideoCall(true);
  };

  return (
    <main className="bg-white min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Messages
              </h1>
              <p className="text-gray-600">
                {subscription.hasAccess
                  ? "Connect with your matches"
                  : "Subscribe to start messaging"}
              </p>
            </div>

            {/* Main Layout */}
            <div
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex"
              style={{ height: "70vh" }}
            >
              {/* Matches List */}
              <div className="w-1/3 border-e border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-bold text-gray-900">Your Matches</h2>
                  <p className="text-sm text-gray-600">
                    {mockMatches.length} conversations
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {mockMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={`w-full p-4 hover:bg-gray-50 transition-colors text-start ${
                        selectedMatch?.id === match.id
                          ? "bg-gold-50 hover:bg-gold-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                            <Image
                              src={match.image}
                              alt={match.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          {match.online && (
                            <div className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {match.name}, {match.age}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0 ms-2">
                              {match.lastMessageTime}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {match.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {match.city}
                          </p>
                        </div>

                        {match.unreadCount && match.unreadCount > 0 && (
                          <div className="flex-shrink-0 w-5 h-5 bg-gold-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {match.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedMatch ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                            <Image
                              src={selectedMatch.image}
                              alt={selectedMatch.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          {selectedMatch.online && (
                            <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {selectedMatch.name}, {selectedMatch.age}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {selectedMatch.online
                              ? "Active now"
                              : "Last active 1h ago"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleVideoCall}
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-card font-semibold flex items-center gap-2 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Video Call
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {!subscription.features.messaging && (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🔒</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Messaging Locked
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Subscribe to unlock messaging with your matches
                          </p>
                          <button
                            onClick={() => setShowPaywall(true)}
                            className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-pill transition-colors"
                          >
                            View Plans
                          </button>
                        </div>
                      )}

                      {subscription.features.messaging &&
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.senderId === "me"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                msg.senderId === "me"
                                  ? "bg-gold-500 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.senderId === "me"
                                    ? "text-white/70"
                                    : "text-gray-500"
                                }`}
                              >
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}

                      {subscription.features.messaging && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center py-2">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            End-to-end encrypted • Your privacy is protected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    {subscription.features.messaging && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-6 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-card transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-lg">
                        Select a match to start chatting
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modals */}
      <SubscriptionPaywall
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="messaging"
      />

      {selectedMatch && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          matchName={selectedMatch.name}
          matchImage={selectedMatch.image}
        />
      )}
    </main>
  );
}
