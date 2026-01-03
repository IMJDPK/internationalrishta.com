"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function TermsPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.terms");
  const links = useTranslations("common.legal.links");
  const useItems = t.raw("useItems") as string[];
  const paymentsItems = t.raw("paymentsItems") as string[];
  const conductItems = t.raw("conductItems") as string[];
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-teal-50 to-gold-50">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-10">
            <p className="text-sm font-semibold text-teal-700 mb-2">
              {t("tag")}
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-3">{t("effective")}</p>
          </header>

          <section className="space-y-8 bg-white/80 backdrop-blur-sm rounded-card border border-gray-100 shadow-lg p-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("eligibilityTitle")}
              </h2>
              <p className="text-gray-700">{t("eligibilityDesc")}</p>
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
                {t("paymentsTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {paymentsItems.map((item) => (
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
                {t("conductTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {conductItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("liabilityTitle")}
              </h2>
              <p className="text-gray-700">{t("liabilityDesc")}</p>
            </div>

            <div className="text-sm text-gray-600">
              {t.rich("contact", {
                email: (chunks) => (
                  <a
                    className="text-teal-700 font-semibold"
                    href="mailto:support@internationalrishta.com"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </div>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-teal-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacyPolicy")}
              </Link>{" "}
              {links("and")}{" "}
              <Link
                className="text-teal-700 font-semibold"
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
