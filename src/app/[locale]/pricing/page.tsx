"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PricingFAQ from "@/components/PricingFAQ";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <main className="bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-teal-50 via-white to-gold-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-teal-200 mb-6">
              <svg
                className="w-4 h-4 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                100% Free for Users • No Hidden Fees
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-teal-500 to-gold-500 bg-clip-text text-transparent">
                Completely Free{" "}
              </span>
              for Users
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Create your profile, discover matches, message, and video call—all
              completely free. No subscriptions, no hidden charges.
            </p>

            {/* Quick Features */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-bold text-gray-900 mb-1">
                  Free Profiles
                </div>
                <div className="text-sm text-gray-600">
                  Create & browse unlimited
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200">
                <div className="text-3xl mb-2">💬</div>
                <div className="font-bold text-gray-900 mb-1">
                  Free Messaging
                </div>
                <div className="text-sm text-gray-600">
                  Chat with your matches
                </div>
              </div>
              <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-4 border-2 border-gold-300">
                <div className="text-3xl mb-2">🎥</div>
                <div className="font-bold text-gray-900 mb-1">
                  Free Video Calls
                </div>
                <div className="text-sm text-gray-600">
                  Connect face-to-face
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Features Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Everything You Need, Absolutely Free
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "🔍",
                  title: "Unlimited Profile Discovery",
                  desc: "Browse and swipe through unlimited verified profiles",
                },
                {
                  icon: "💬",
                  title: "Free Messaging",
                  desc: "Chat with your matches without any restrictions",
                },
                {
                  icon: "🎥",
                  title: "Video Calls",
                  desc: "Connect face-to-face with verified members",
                },
                {
                  icon: "✨",
                  title: "Profile Boosts",
                  desc: "Get featured to increase your visibility",
                },
                {
                  icon: "🔐",
                  title: "Privacy Protected",
                  desc: "Your data is safe and secure, always",
                },
                {
                  icon: "🤝",
                  title: "Bureau Connections",
                  desc: "Connect with verified marriage bureaus",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-card p-6 shadow-lg border border-gray-200"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <PricingFAQ />
        </div>
      </section>

      <Footer />
    </main>
  );
}
