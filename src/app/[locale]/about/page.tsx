"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.about");
  const links = useTranslations("common.legal.links");
  const howItems = t.raw("howItems") as string[];
  const stats = [
    {
      icon: "📈",
      title: t("stats.profilesTitle"),
      description: t("stats.profilesDesc"),
    },
    {
      icon: "🛡️",
      title: t("stats.verificationTitle"),
      description: t("stats.verificationDesc"),
    },
    {
      icon: "🤝",
      title: t("stats.bureauTitle"),
      description: t("stats.bureauDesc"),
    },
  ];
  return (
    <main className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-teal-50">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-10 text-center">
            <p className="text-sm font-semibold text-gold-700 mb-2">
              {t("tag")}
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-3">{t("subtitle")}</p>
          </header>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-card p-6 shadow"
              >
                <p className="text-3xl mb-2">{stat.icon}</p>
                <h3 className="font-bold text-gray-900 mb-2">{stat.title}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>

          <section className="bg-white/80 backdrop-blur-sm rounded-card border border-gray-100 shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("missionTitle")}
            </h2>
            <p className="text-gray-700">{t("missionDesc")}</p>

            <h2 className="text-2xl font-bold text-gray-900">
              {t("howTitle")}
            </h2>
            <ul className="list-disc ps-6 text-gray-700 space-y-1">
              {howItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold text-gray-900">
              {t("contactTitle")}
            </h2>
            <p className="text-gray-700">
              {t.rich("contactDesc", {
                email: (chunks) => (
                  <a
                    className="text-gold-700 font-semibold"
                    href="mailto:info@internationalrishta.com"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacy")}
              </Link>
              ,{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/terms`}
              >
                {links("terms")}
              </Link>
              ,{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/about/safety`}
              >
                {links("safety")}
              </Link>
              .
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
