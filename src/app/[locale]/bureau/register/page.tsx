"use client";

import BureauRegisterGate from "@/components/bureau/BureauRegisterGate";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function BureauRegisterPage() {
  const t = useTranslations("common");

  return (
    <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm ps-4 pe-4 py-2 rounded-pill border border-purple-200 mb-4">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {t("bureau.register.ribbon")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {t("bureau.register.title")}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("bureau.register.subtitle")}
              </p>
            </motion.div>

            <BureauRegisterGate />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
