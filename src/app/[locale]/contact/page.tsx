"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.contact");
  const links = useTranslations("common.legal.links");
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50">
      <Navigation />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10 text-center">
            <p className="text-sm font-semibold text-teal-700 mb-2">
              {t("tag")}
            </p>
            <h1 className="text-4xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-3">{t("subtitle")}</p>
          </header>

          <section className="bg-white/80 backdrop-blur-sm rounded-card border border-gray-100 shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("emailTitle")}
              </h2>
              <p className="text-gray-700">{t("emailValue")}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("helplineTitle")}
              </h2>
              <p className="text-gray-700">{t("helplineValue")}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("addressTitle")}
              </h2>
              <p className="text-gray-700">{t("addressValue")}</p>
            </div>
            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-teal-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacy")}
              </Link>{" "}
              {links("and")}{" "}
              <Link
                className="text-teal-700 font-semibold"
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
