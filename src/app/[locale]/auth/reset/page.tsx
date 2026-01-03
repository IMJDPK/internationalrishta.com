"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function ResetPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    // TODO: Wire to Supabase reset API
    setStatus("sent");
  };

  return (
    <main className="bg-gradient-to-br from-gold-50 via-white to-teal-50 min-h-screen">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/50 p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold">
                  🔒
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Reset your password
                  </h1>
                  <p className="text-gray-600 text-sm">
                    We will email you a secure reset link.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                {status === "sent" && (
                  <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-card p-4">
                    Reset link sent! Check your email and follow the
                    instructions.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-card transition-colors"
                >
                  Send reset link
                </button>
              </form>

              <div className="flex items-center justify-between text-sm text-gray-600 mt-6">
                <Link
                  href={`/${locale}/auth/signin`}
                  className="text-gold-600 hover:text-gold-700 font-semibold"
                >
                  Back to sign in
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="hover:text-gray-800"
                >
                  Create an account
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
