"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PricingFAQ from "@/components/PricingFAQ";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function PricingPage() {
  const locale = useLocale();
  const t = useTranslations("common.pricingPage");

  const freeFeatures = [
    { key: "signup" },
    { key: "browse" },
    { key: "messaging" },
    { key: "discovery" },
    { key: "bureau" },
  ] as const;

  const premiumFeatures = [
    { key: "video", icon: "🎥" },
    { key: "voice", icon: "🎙️" },
    { key: "image", icon: "🖼️" },
    { key: "boosts", icon: "🚀" },
    { key: "support", icon: "⚡" },
  ] as const;

  return (
    <main className="bg-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-teal-50 via-white to-gold-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-teal-200 mb-6">
              <span className="text-sm font-medium text-gray-700">✨ {t("ribbon")}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-teal-500 to-gold-500 bg-clip-text text-transparent">
                {t("titleHighlight")}
              </span>{" "}
              {t("titleSuffix")}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">{t("subtitle")}</p>

            {/* Quick features */}
            <div className="grid md:grid-cols-3 gap-4">
              {(["signup", "messaging", "video"] as const).map((key, i) => {
                const icons = ["✅", "💬", "🎥"];
                const highlighted = key === "video";
                return (
                  <div
                    key={key}
                    className={highlighted
                      ? "bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-4 border-2 border-gold-300"
                      : "bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200"}
                  >
                    <div className="text-3xl mb-2">{icons[i]}</div>
                    <div className="font-bold text-gray-900 mb-1">{t(`quickFeatures.${key === "signup" ? "profileTitle" : key === "messaging" ? "messagingTitle" : "videoTitle"}`)}</div>
                    <div className="text-sm text-gray-600">{t(`quickFeatures.${key === "signup" ? "profileDesc" : key === "messaging" ? "messagingDesc" : "videoDesc"}`)}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free vs Premium */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 mb-16">

            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-card border-2 border-gray-200 bg-white p-8 shadow-lg"
            >
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">Free</span>
                <p className="text-gray-500 mt-1 text-sm">No card required. Always free.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map(({ key }) => (
                  <li key={key} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-900 font-medium text-sm">{t(`free.${key}Title`)}</span>
                      <p className="text-gray-500 text-xs mt-0.5">{t(`free.${key}Desc`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/auth/signup`}
                className="flex min-h-11 items-center justify-center w-full rounded-card border-2 border-gold-500 text-gold-700 font-bold py-3 hover:bg-gold-50 transition-colors"
              >
                {t("freeTitle")} — Get Started
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="relative rounded-card border-2 border-gold-400 bg-gradient-to-br from-gold-50 to-teal-50 p-8 shadow-xl"
            >
              <span className="absolute -top-3 start-6 rounded-pill bg-gold-500 px-3 py-1 text-xs font-bold text-white">
                PREMIUM
              </span>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{t("premiumPrice")}</span>
                  <span className="text-gray-500">{t("perMonth")}</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm">Unlock video, voice & photo messages</p>
              </div>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.map(({ key, icon }) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    <div>
                      <span className="text-gray-900 font-medium text-sm">{t(`premium.${key}Title`)}</span>
                      <p className="text-gray-500 text-xs mt-0.5">{t(`premium.${key}Desc`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/auth/signup`}
                className="flex min-h-12 items-center justify-center w-full rounded-card bg-gold-500 hover:bg-gold-600 text-white font-bold py-3.5 transition-colors shadow-lg"
              >
                Upgrade to Premium
              </Link>
            </motion.div>
          </div>

          <PricingFAQ />
        </div>
      </section>

      <Footer />
    </main>
  );
}
