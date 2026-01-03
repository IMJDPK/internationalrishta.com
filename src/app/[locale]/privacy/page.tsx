"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function PrivacyPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.privacy");
  const links = useTranslations("common.legal.links");
  const collectItems = t.raw("collectItems") as string[];
  const useItems = t.raw("useItems") as string[];
  const shareItems = t.raw("shareItems") as string[];
  const controlItems = t.raw("controlItems") as string[];
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
            <p className="text-gray-600 mt-3">{t("effective")}</p>
          </header>

          <section className="space-y-8 bg-white/80 backdrop-blur-sm rounded-card border border-gray-100 shadow-lg p-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("collectTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {collectItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("useTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {useItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("shareTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {shareItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("controlTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {controlItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              {t.rich("contact", {
                email: (chunks) => (
                  <a
                    className="text-gold-700 font-semibold"
                    href="mailto:privacy@internationalrishta.com"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </div>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/terms`}
              >
                {links("termsOfService")}
              </Link>{" "}
              {links("and")}{" "}
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
