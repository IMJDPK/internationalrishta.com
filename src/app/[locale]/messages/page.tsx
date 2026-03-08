"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import VideoCallModal from "@/components/VideoCallModal";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

const irTeamMatch: Match = {
  id: "welcome",
  name: "International Rishta Team",
  age: 0,
  city: "Support",
  image: "/assets/logo-golden.png",
  lastMessage: "Assalam o Alaikum! Welcome aboard 💛",
  lastMessageTime: "Just now",
  unreadCount: 1,
  online: true,
};

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
    lastMessage: "MashAllah, great profile!",
    lastMessageTime: "3h ago",
    unreadCount: 1,
    online: true,
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", senderId: "1", content: "Assalam o Alaikum! I saw your profile, it is very impressive.", timestamp: "10:30 AM", read: true },
    { id: "2", senderId: "me", content: "Walaikum Assalam! JazakAllah Khair. I liked yours too.", timestamp: "10:32 AM", read: true },
    { id: "3", senderId: "1", content: "Looking forward to connecting! Are you from Lahore originally?", timestamp: "10:35 AM", read: false },
  ],
  "2": [
    { id: "1", senderId: "me", content: "Assalam o Alaikum, I came across your profile and was impressed.", timestamp: "9:00 AM", read: true },
    { id: "2", senderId: "2", content: "Thank you for accepting!", timestamp: "9:15 AM", read: true },
  ],
  "3": [
    { id: "1", senderId: "3", content: "MashAllah, great profile!", timestamp: "7:00 AM", read: false },
  ],
};

const welcomeThread: Message[] = [
  { id: "w1", senderId: "team", content: "Assalam o Alaikum! 👋 Welcome to International Rishta. We're delighted to have you here.", timestamp: "Just now", read: false },
  { id: "w2", senderId: "team", content: "Complete your profile and start discovering potential matches. We're here to help you find your perfect rishta! 💛", timestamp: "Just now", read: false },
];

export default function MessagesPage() {
  const subscription = useSubscription();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      await supabase.auth.getUser();
    };
    loadUser();
    setMatches([irTeamMatch, ...mockMatches]);
    setSelectedMatch(irTeamMatch);
    setMessages(welcomeThread);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setMessages(match.id === "welcome" ? welcomeThread : (mockMessages[match.id] || []));
    setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, unreadCount: 0 } : m)));
    setIsMobileListOpen(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMatch) return;
    const msg: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");

    if (selectedMatch.id !== "welcome") {
      setTimeout(() => {
        const replies = ["JazakAllah Khair!", "InshaAllah, we can talk further.", "That sounds wonderful!", "I'd love to know more about you."];
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedMatch.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          read: false,
        };
        setMessages((prev) => [...prev, reply]);
      }, 1500);
    }
  };

  const totalUnread = matches.reduce((sum, m) => sum + (m.unreadCount || 0), 0);

  return (
    <main className="bg-gray-50 min-h-screen">
      <Navigation />

      <div className="pt-20 h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isMobileListOpen && (
              <button
                onClick={() => setIsMobileListOpen(true)}
                className="md:hidden min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
                aria-label="Back to matches"
              >
                ←
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
              {totalUnread > 0 && <p className="text-sm text-gold-600 font-medium">{totalUnread} unread</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 hidden sm:inline">Online</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto px-4 py-4 gap-4 min-h-0">
          {/* Matches Sidebar */}
          <div className={`${isMobileListOpen ? "flex" : "hidden"} md:flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden`}>
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gold-50 to-teal-50 flex-shrink-0">
              <h2 className="font-bold text-gray-900">Conversations</h2>
              <p className="text-sm text-gray-500">{matches.length} conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors text-start min-h-16 ${selectedMatch?.id === match.id ? "bg-gold-50 border-s-4 border-gold-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        <Image src={match.image} alt={match.name} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                      {match.online && <div className="absolute bottom-0 end-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{match.name}{match.age > 0 ? `, ${match.age}` : ""}</h3>
                        <span className="text-xs text-gray-400 flex-shrink-0">{match.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-sm text-gray-500 truncate">{match.lastMessage}</p>
                        {match.unreadCount && match.unreadCount > 0 ? (
                          <span className="flex-shrink-0 min-w-5 h-5 bg-gold-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">{match.unreadCount}</span>
                        ) : null}
                      </div>
                      {match.city && <p className="text-xs text-gray-400 mt-0.5">{match.city}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!isMobileListOpen ? "flex" : "hidden"} md:flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-0`}>
            {selectedMatch ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <Image src={selectedMatch.image} alt={selectedMatch.name} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                      {selectedMatch.online && <div className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedMatch.name}{selectedMatch.age > 0 ? `, ${selectedMatch.age}` : ""}</h3>
                      <p className="text-xs text-gray-500">{selectedMatch.online ? <span className="text-green-600 font-medium">Active now</span> : "Last active 1h ago"}</p>
                    </div>
                  </div>
                  {selectedMatch.id !== "welcome" && (
                    <button
                      onClick={() => setShowVideoCall(true)}
                      className="min-h-11 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Video Call</span>
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                        {msg.senderId !== "me" && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 me-2 self-end">
                            <Image src={selectedMatch.image} alt={selectedMatch.name} width={32} height={32} className="object-cover w-full h-full" />
                          </div>
                        )}
                        <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${msg.senderId === "me" ? "bg-gold-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                          <p className="text-base leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === "me" ? "text-white/70" : "text-gray-400"}`}>{msg.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div className="flex items-center gap-2 text-xs text-gray-400 justify-center py-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>End-to-end encrypted · Your privacy is protected</span>
                  </div>
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors min-h-11"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="min-h-11 min-w-11 px-4 py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                      aria-label="Send"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</p>
                  <p className="text-gray-500">Choose a match from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMatch && selectedMatch.id !== "welcome" && (
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
