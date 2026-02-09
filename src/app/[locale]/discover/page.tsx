"use client";

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

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const supabase = createClient();

      // Check if there's an OAuth code in the URL
      const code = searchParams.get("code");
      if (code) {
        // Exchange code for session
        await supabase.auth.exchangeCodeForSession(code);
        // Remove code from URL
        router.replace(`/${locale}/discover`);
      }

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Check if user has at least a city set; don't loop endlessly for missing optional fields
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-gold-50 via-white to-teal-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-gold-200 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                1,247 Active Members
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Discover Your
              <span className="bg-gradient-to-r from-gold-500 to-teal-500 bg-clip-text text-transparent">
                {" "}
                Perfect Match
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Browse verified profiles and connect with people who share your
              values
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          <ProfileCards />
        </div>
      </section>

      <Footer />
    </main>
  );
}
