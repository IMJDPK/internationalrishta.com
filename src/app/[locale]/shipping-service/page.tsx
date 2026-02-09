"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function ShippingServicePage() {
  const locale = useLocale();
  const t = useTranslations("common.legal.shippingService");
  const links = useTranslations("common.legal.links");
  const contact = useTranslations("common.legal.contact");
  const timelineItems = t.raw("timelineItems") as string[];
  const issuesItems = t.raw("issuesItems") as string[];

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
                {t("deliveryTitle")}
              </h2>
              <p className="text-gray-700">{t("deliveryDesc")}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("timelineTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {timelineItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("issuesTitle")}
              </h2>
              <ul className="list-disc ps-6 text-gray-700 space-y-1">
                {issuesItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {t("locationTitle")}
              </h2>
              <p className="text-gray-700">{t("locationDesc")}</p>
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

            <div className="rounded-card border border-teal-100 bg-teal-50/60 p-5">
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
                  className="text-teal-700 font-semibold"
                  href="tel:+923002027977"
                >
                  {contact("phoneValue")}
                </a>
              </p>
            </div>

            <div className="text-sm text-gray-600">
              {links("seeAlso")}{" "}
              <Link
                className="text-teal-700 font-semibold"
                href={`/${locale}/privacy`}
              >
                {links("privacyPolicy")}
              </Link>
              {", "}
              <Link
                className="text-teal-700 font-semibold"
                href={`/${locale}/terms`}
              >
                {links("termsOfService")}
              </Link>
              {", "}
              <Link
                className="text-teal-700 font-semibold"
                href={`/${locale}/return-refund`}
              >
                {links("returnRefund")}
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
