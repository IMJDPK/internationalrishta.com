"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { emptyAnimation } from "@/lib/lottieAnimations";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const LottieAnimation = dynamic(() => import("@/components/LottieAnimation"), {
  ssr: false,
});

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data
  const user = {
    name: "Ayesha Khan",
    age: 26,
    city: "Lahore",
    verified: true,
    profileImage:
      "/assets/Banner - International RishtaConnecting Hearts Worldwide.png",
    completionPercent: 85,
    points: 450,
    tier: "Direct Member",
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="relative">
                <div className="relative w-48 h-48">
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    fill
                    className="rounded-card object-cover"
                  />
                  {user.verified && (
                    <div className="absolute -top-2 -end-2 bg-gradient-to-br from-gold-500 to-teal-500 text-white p-2 rounded-full shadow-lg">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                      {user.name}, {user.age}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center gap-2 mb-3">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      {user.city}
                    </p>
                    <span className="inline-block bg-gradient-to-r from-gold-100 to-teal-100 text-gray-900 px-4 py-1.5 rounded-pill text-sm font-semibold border border-gold-200">
                      {user.tier}
                    </span>
                  </div>
                  <button className="bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-card font-semibold transition-all shadow-md hover:shadow-lg">
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-lg p-4 border border-gold-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Profile Completion
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/50 h-3 rounded-pill overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-gold-500 to-teal-500 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${user.completionPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {user.completionPercent}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Points Balance
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {user.points} ⭐
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20"
          >
            <div className="border-b border-gray-200">
              <div className="flex gap-8 px-8">
                {["profile", "matches", "messages", "settings"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-semibold capitalize transition-all border-b-2 ${
                      activeTab === tab
                        ? "border-gold-500 text-gold-600"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Details
                  </h2>
                  <p className="text-gray-600">
                    Complete your profile to increase visibility and matches.
                  </p>
                  <button className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-card font-semibold transition-colors">
                    Complete Profile →
                  </button>
                </div>
              )}

              {activeTab === "matches" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Matches
                  </h2>
                  <p className="text-gray-600">
                    People who have shown interest in your profile.
                  </p>
                  <div className="text-center py-12">
                    <LottieAnimation
                      animationData={emptyAnimation}
                      className="w-32 h-32 mx-auto mb-4"
                    />
                    <p className="text-xl text-gray-600">No matches yet</p>
                    <button className="mt-4 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-card font-semibold transition-colors">
                      Start Discovering →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  <p className="text-gray-600">
                    Conversations with your matches.
                  </p>
                  <div className="text-center py-12">
                    <LottieAnimation
                      animationData={emptyAnimation}
                      className="w-32 h-32 mx-auto mb-4"
                    />
                    <p className="text-xl text-gray-600">No messages yet</p>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Account Settings
                  </h2>
                  <div className="space-y-4">
                    <button className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-card transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Privacy Settings
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage who can see your profile
                      </p>
                    </button>
                    <button className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-card transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Notification Preferences
                      </h3>
                      <p className="text-sm text-gray-600">
                        Control your email and push notifications
                      </p>
                    </button>
                    <button className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-card transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Subscription Management
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage your subscription
                      </p>
                    </button>
                    <button className="w-full text-left px-6 py-4 bg-red-50 hover:bg-red-100 rounded-card transition-colors text-red-600">
                      <h3 className="font-semibold mb-1">Delete Account</h3>
                      <p className="text-sm">
                        Permanently delete your account and data
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
