"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const features = [
  { icon: "🛡️", key: "verified" },
  { icon: "🔒", key: "private" },
  { icon: "👥", key: "agents" },
  { icon: "⚡", key: "realtime" },
];

export default function TrustSection() {
  const t = useTranslations("common.trust");
  const locale = useLocale();

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 start-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">{t("title")}</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">
                {t(`${feature.key}.title`)}
              </h3>
              <p className="text-gray-400">{t(`${feature.key}.description`)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md rounded-card p-12 border border-white/20 text-center max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold mb-6">{t("cta.title")}</h3>
          <p className="text-gray-300 mb-8 text-lg">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/auth/signup`}
              className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-pill font-bold shadow-xl transition-all"
            >
              {t("cta.primary")}
            </Link>
            <Link
              href={`/${locale}/about/safety`}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 rounded-pill font-bold transition-all"
            >
              {t("cta.secondary")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
