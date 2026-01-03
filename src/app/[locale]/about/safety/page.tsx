"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function SafetyPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.safety");
  const links = useTranslations("common.legal.links");
  const onPlatformItems = t.raw("onPlatformItems") as string[];
  const meetingItems = t.raw("meetingItems") as string[];
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gold-50 to-teal-50">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-10">
            <p className="text-sm font-semibold text-gold-700 mb-2">
              {t("tag")}
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-3">{t("subtitle")}</p>
          </header>

          <section className="space-y-8 bg-white/80 backdrop-blur-sm rounded-card border border-gray-100 shadow-lg p-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("onPlatformTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {onPlatformItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("meetingTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {meetingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("verificationTitle")}
              </h2>
              <p className="text-gray-700">{t("verificationDesc")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("helpTitle")}
              </h2>
              <p className="text-gray-700">
                {t.rich("helpDesc", {
                  email: (chunks) => (
                    <a
                      className="text-gold-700 font-semibold"
                      href="mailto:safety@internationalrishta.com"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacy")}
              </Link>{" "}
              {links("and")}{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/terms`}
              >
                {links("terms")}
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
