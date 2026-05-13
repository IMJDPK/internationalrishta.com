"use client";

import DiscoverFilters, { type FilterValues } from "@/components/DiscoverFilters";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProfileCards from "@/components/ProfileCards";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DiscoverPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common.discoverPage");
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValues | undefined>(undefined);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const supabase = createClient();

      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        router.replace(`/${locale}/discover`);
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", authUser.id)
        .single();

      if (!profile || !profile.city) {
        router.push(`/${locale}/profile`);
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuthAndProfile();
  }, [searchParams, router, locale]);

  const handleApplyFilters = (filters: FilterValues) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  if (isCheckingAuth) {
    return (
      <main className="bg-white min-h-screen">
        <Navigation />
        <div className="pt-32 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4" />
            <p className="text-gray-600 text-base">{t("loading")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* ── MOBILE layout: full-bleed, no scroll ─────────────────────────── */}
      <main className="lg:hidden flex flex-col h-dvh overflow-hidden bg-white">
        <Navigation />

        {/* Compact top bar */}
        <div className="pt-[72px] px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{t("titlePrefix")} <span className="bg-gradient-to-r from-gold-500 to-teal-500 bg-clip-text text-transparent">{t("titleHighlight")}</span></h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">{t("activeMembers", { count: 1247 })}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="relative min-h-10 min-w-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label={t("filters")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
            </svg>
            {activeFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter drawer overlay */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowFilters(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 overflow-y-auto shadow-2xl pt-4"
            >
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">{t("filters")}</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                  aria-label="Close filters"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <DiscoverFilters onApply={handleApplyFilters} />
            </motion.div>
          </>
        )}

        {/* Card area — fills remaining height */}
        <div className="flex-1 min-h-0">
          <ProfileCards filters={activeFilters} fullBleed />
        </div>
      </main>

      {/* ── DESKTOP layout: sidebar + cards + footer ──────────────────────── */}
      <main className="hidden lg:block bg-gradient-to-b from-gold-50/30 to-white">
        <Navigation />

        {/* Hero */}
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
                    {t("activeMembers", { count: 1247 })}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {t("titlePrefix")}{" "}
                  <span className="bg-gradient-to-r from-gold-500 to-teal-500 bg-clip-text text-transparent">
                    {t("titleHighlight")}
                  </span>
                </h1>
                <p className="text-base text-gray-600">{t("subtitle")}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sidebar + Cards */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8 items-start">
              <div className={`${showFilters ? "block" : "hidden"} lg:block w-72 xl:w-80 flex-shrink-0`}>
                <DiscoverFilters onApply={handleApplyFilters} />
              </div>
              <div className="flex-1 min-w-0">
                <ProfileCards filters={activeFilters} />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
