"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function BureauBenefits() {
  const locale = useLocale();
  const t = useTranslations("common.bureau.landing");

  const benefits = [
    {
      icon: "💰",
      title: t("benefits.commissionTitle"),
      description: t("benefits.commissionDesc"),
    },
    {
      icon: "🎯",
      title: t("benefits.verificationTitle"),
      description: t("benefits.verificationDesc"),
    },
    {
      icon: "📊",
      title: t("benefits.payoutsTitle"),
      description: t("benefits.payoutsDesc"),
    },
    {
      icon: "🏆",
      title: t("benefits.territoryTitle"),
      description: t("benefits.territoryDesc"),
    },
    {
      icon: "📱",
      title: t("benefits.dashboardTitle"),
      description: t("benefits.dashboardDesc"),
    },
    {
      icon: "🤝",
      title: t("benefits.supportTitle"),
      description: t("benefits.supportDesc"),
    },
  ];

  const detailItems = [
    t("investment"),
    t("territory"),
    t("requirements"),
    t("commission"),
    t("verification"),
    t("support"),
  ];

  const cities = t.raw("cities") as string[];

  return (
    <>
      {/* Benefits Grid */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          {t("heading")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-card p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Registration Info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-8 md:p-12 shadow-xl mb-20 border border-gold-200"
      >
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t("ctaTitle")}
            </h2>
            <div className="space-y-4 text-gray-700">
              {detailItems.map((item) => (
                <p key={item} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{item}</span>
                </p>
              ))}
            </div>
            <Link
              href={`/${locale}/bureau/register`}
              className="inline-block mt-8 bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-4 rounded-card transition-colors shadow-lg"
            >
              {t("apply")} →
            </Link>
            <p className="text-sm text-gray-600 mt-4">{t("contact")}</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("citiesTitle", { count: cities.length })}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t("citiesNote")}</p>
            <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 text-gold-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
