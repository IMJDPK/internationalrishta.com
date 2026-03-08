"use client";

import DiscoverFilters from "@/components/DiscoverFilters";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProfileCards from "@/components/ProfileCards";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiscoverPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const supabase = createClient();

      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        router.replace(`/${locale}/discover`);
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", authUser.id)
          .single();

        if (!profile || !profile.city) {
          router.push(`/${locale}/profile`);
          return;
        }

        setUser(authUser);
      }

      setIsCheckingAuth(false);
    };

    checkAuthAndProfile();
  }, [searchParams, router, locale]);

  if (isCheckingAuth) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-gray-600 text-base">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-gold-50/30 to-white">
      <Navigation />

      {/* Compact Hero */}
      <section className="pt-28 pb-8 bg-gradient-to-br from-gold-50 via-white to-teal-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-pill border border-gold-200 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  1,247 Active Members
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Discover Your{" "}
                <span className="bg-gradient-to-r from-gold-500 to-teal-500 bg-clip-text text-transparent">
                  Perfect Match
                </span>
              </h1>
              <p className="text-base text-gray-600">
                Browse verified profiles · Swipe right to connect · 100% free
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden min-h-11 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-base font-medium text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"
                />
              </svg>
              Filters
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Layout: Filters + Cards */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 items-start">
            {/* Sidebar Filters - Desktop always visible, mobile toggleable */}
            <div
              className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 xl:w-80 flex-shrink-0`}
            >
              <DiscoverFilters />
            </div>

            {/* Profile Cards */}
            <div className="flex-1 min-w-0">
              <ProfileCards />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
