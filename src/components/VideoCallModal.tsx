"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchImage: string;
}

export default function VideoCallModal({
  isOpen,
  onClose,
  matchName,
  matchImage,
}: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState<
    "connecting" | "connected" | "ended"
  >("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCallStatus("connecting");
      setCallDuration(0);
      return;
    }

    // Simulate connection
    const connectionTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 2000);

    // Timer for call duration
    let durationInterval: NodeJS.Timeout;
    if (callStatus === "connected") {
      durationInterval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(connectionTimer);
      if (durationInterval) clearInterval(durationInterval);
    };
  }, [isOpen, callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        >
          {/* Video Area */}
          <div className="relative w-full h-full">
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
              {callStatus === "connecting" && (
                <div className="text-center text-white">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20">
                    <Image
                      src={matchImage}
                      alt={matchName}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Calling {matchName}...
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              {callStatus === "connected" && (
                <div className="text-center text-white">
                  <div className="w-64 h-64 rounded-2xl overflow-hidden mx-auto mb-6 border-4 border-white/20 shadow-2xl">
                    <Image
                      src={matchImage}
                      alt={matchName}
                      width={256}
                      height={256}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{matchName}</h2>
                  <p className="text-white/70 text-lg">
                    {formatDuration(callDuration)}
                  </p>
                  <div className="mt-4 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-pill inline-flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
              )}

              {callStatus === "ended" && (
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📞</div>
                  <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
                  <p className="text-white/70">
                    Duration: {formatDuration(callDuration)}
                  </p>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {callStatus === "connected" && !isVideoOff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-6 end-6 w-48 h-36 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <p className="text-sm">You</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Call Controls */}
            {callStatus !== "ended" && (
              <div className="absolute bottom-10 start-1/2 -translate-x-1/2">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 flex items-center gap-6 shadow-2xl border border-white/20">
                  {/* Mute/Unmute */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                      isMuted
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {isMuted ? (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </motion.button>

                  {/* End Call */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndCall}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                  >
                    <svg
                      className="w-8 h-8 text-white rotate-135"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </motion.button>

                  {/* Video On/Off */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                      isVideoOff
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {isVideoOff ? (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13.8 3.4l-1.414 1.414A4.978 4.978 0 0114 8v4a4.978 4.978 0 01-1.614 3.186l1.414 1.414A6.978 6.978 0 0016 12V8a6.978 6.978 0 00-2.2-5.6zM2.05 2.05L18 18l1.414-1.414L3.464.636 2.05 2.05zM7 8.17V8a1 1 0 011-1h.17L7 8.17zM5.293 5.293L14 14H8a2 2 0 01-2-2V6a2 2 0 01.293-.707z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-white"
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
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Top Bar */}
            {callStatus === "connected" && (
              <div className="absolute top-0 start-0 end-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Encrypted Call</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatDuration(callDuration)}
                  </div>
                </div>
              </div>
            )}

            {/* Info Notice */}
            {callStatus === "connecting" && (
              <div className="absolute bottom-32 start-1/2 -translate-x-1/2 text-center">
                <p className="text-white/70 text-sm px-6 py-3 bg-white/10 backdrop-blur-sm rounded-pill">
                  🔒 This call is end-to-end encrypted
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
