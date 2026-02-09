"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function ReturnRefundPage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.returnRefund");
  const links = useTranslations("common.legal.links");
  const contact = useTranslations("common.legal.contact");
  const eligibilityItems = t.raw("eligibilityItems") as string[];
  const processItems = t.raw("processItems") as string[];
  const exceptionsItems = t.raw("exceptionsItems") as string[];

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
                {t("overviewTitle")}
              </h2>
              <p className="text-gray-700">{t("overviewDesc")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("eligibilityTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {eligibilityItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("processTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {processItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("exceptionsTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {exceptionsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-gray-600">
              {t.rich("contact", {
                email: (chunks) => (
                  <a
                    className="text-gold-700 font-semibold"
                    href="mailto:billing@internationalrishta.com"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </div>

            <div className="rounded-card border border-gold-100 bg-gold-50/60 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {contact("title")}
              </h3>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{contact("addressLabel")}</span>{" "}
                {contact("addressValue")}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{contact("phoneLabel")}</span>{" "}
                <a
                  className="text-gold-700 font-semibold"
                  href="tel:+923002027977"
                >
                  {contact("phoneValue")}
                </a>
              </p>
            </div>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacyPolicy")}
              </Link>
              {", "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/terms`}
              >
                {links("termsOfService")}
              </Link>
              {", "}
              <Link
                className="text-gold-700 font-semibold"
                href={`/${locale}/shipping-service`}
              >
                {links("shippingService")}
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
