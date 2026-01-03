"use client";

import BureauBenefits from "@/components/BureauBenefits";
import BureauDirectory from "@/components/BureauDirectory";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function BureauPage() {
  const t = useTranslations("common.bureau.landing");
  const stats = [
    {
      value: t("stats.licenseValue"),
      label: t("stats.licenseLabel"),
      color: "text-purple-600",
    },
    {
      value: t("stats.commissionValue"),
      label: t("stats.commissionLabel"),
      color: "text-gold-600",
    },
    {
      value: t("stats.cityCapValue"),
      label: t("stats.cityCapLabel"),
      color: "text-teal-600",
    },
  ];

  return (
    <main className="bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-purple-50 via-white to-gold-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-purple-200 mb-6">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {t("heroRibbon")}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              {t("heroTitlePrefix")}
              <span className="bg-gradient-to-r from-purple-500 to-gold-500 bg-clip-text text-transparent">
                {" "}
                {t("heroTitleHighlight")}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t("heroSubtitle")}
            </p>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-card p-6 border border-gray-200"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <BureauBenefits />
          <BureauDirectory />
        </div>
      </section>

      <Footer />
    </main>
  );
}
