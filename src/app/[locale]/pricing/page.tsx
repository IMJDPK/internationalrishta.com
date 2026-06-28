"use client";

import CheckoutStatusBanner from "@/components/billing/CheckoutStatusBanner";
import ManualProofUpload from "@/components/billing/ManualProofUpload";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PricingFAQ from "@/components/PricingFAQ";
import { useSubscription } from "@/hooks/useSubscription";
import {
  formatPkrAmount,
  PRICING_PLAN_CARDS,
} from "@/lib/billing/plan-display";
import { createClient } from "@/lib/supabase/client";
import type { BillingPlanTier } from "@/types/billing.types";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";

export default function PricingPage() {
  const locale = useLocale();
  const t = useTranslations("common.pricingPage");
  const tCheckout = useTranslations("common.pricingCheckout");
  const subscription = useSubscription();

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] =
    useState<BillingPlanTier | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadAmount, setUploadAmount] = useState<number>(3999);
  const [uploadTierDb, setUploadTierDb] = useState<"referral" | "direct">(
    "referral"
  );

  useEffect(() => {
    const probeAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUserId(user?.id ?? null);
    };
    probeAuth();
  }, []);

  const freeFeatures = [
    { key: "signup" },
    { key: "browse" },
    { key: "messaging" },
    { key: "discovery" },
    { key: "bureau" },
  ] as const;

  const premiumFeatures = [
    { key: "video", icon: "🎥" },
    { key: "voice", icon: "🎙️" },
    { key: "image", icon: "🖼️" },
    { key: "boosts", icon: "🚀" },
    { key: "support", icon: "⚡" },
  ] as const;

  const isAuthenticated = Boolean(authUserId);
  const isPremiumActive = subscription.accountActive;
  const ctasDisabled = isPremiumActive || checkoutLoadingPlan !== null;

  const signInHref = `/${locale}/auth/signin?returnUrl=/${locale}/pricing`;

  const handleStripeCheckout = useCallback(
    async (planTier: BillingPlanTier) => {
      setCheckoutError(null);

      if (!isAuthenticated) {
        window.location.href = signInHref;
        return;
      }

      if (isPremiumActive) {
        return;
      }

      setCheckoutLoadingPlan(planTier);

      try {
        const response = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: planTier, locale }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.url) {
          setCheckoutError(tCheckout("checkoutError"));
          setCheckoutLoadingPlan(null);
          return;
        }

        window.location.href = data.url as string;
      } catch {
        setCheckoutError(tCheckout("checkoutError"));
        setCheckoutLoadingPlan(null);
      }
    },
    [isAuthenticated, isPremiumActive, locale, signInHref, tCheckout]
  );

  const openManualUpload = (planTier: BillingPlanTier, amount: number, tierDb: "referral" | "direct") => {
    if (!isAuthenticated) {
      window.location.href = signInHref;
      return;
    }
    if (isPremiumActive) {
      return;
    }
    setUploadAmount(amount);
    setUploadTierDb(tierDb);
    setUploadOpen(true);
  };

  const formattedExpiry =
    subscription.expiresAt
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
          new Date(subscription.expiresAt)
        )
      : null;

  return (
    <main className="bg-white">
      <Navigation />

      <section className="pt-40 pb-16 bg-gradient-to-br from-teal-50 via-white to-gold-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Suspense fallback={null}>
              <CheckoutStatusBanner />
            </Suspense>

            {checkoutError && (
              <p className="mb-6 text-sm text-red-600 text-center" role="alert">
                {checkoutError}
              </p>
            )}

            {isPremiumActive && (
              <div className="mb-6 rounded-card border border-teal-200 bg-teal-50 px-4 py-3 text-start">
                <p className="font-semibold text-teal-800">
                  {tCheckout("activeBadge")}
                </p>
                {formattedExpiry && (
                  <p className="text-sm text-teal-700 mt-1">
                    {tCheckout("expiresAt", { date: formattedExpiry })}
                  </p>
                )}
                <p className="text-sm text-teal-700 mt-1">
                  {tCheckout("alreadyActive")}
                </p>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-teal-200 mb-6">
              <span className="text-sm font-medium text-gray-700 text-start">
                ✨ {t("ribbon")}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-teal-500 to-gold-500 bg-clip-text text-transparent">
                {t("titleHighlight")}
              </span>{" "}
              {t("titleSuffix")}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed text-start md:text-center">
              {t("subtitle")}
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {(["signup", "messaging", "video"] as const).map((key, i) => {
                const icons = ["✅", "💬", "🎥"];
                const highlighted = key === "video";
                return (
                  <div
                    key={key}
                    className={
                      highlighted
                        ? "bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-4 border-2 border-gold-300 text-start"
                        : "bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200 text-start"
                    }
                  >
                    <div className="text-3xl mb-2">{icons[i]}</div>
                    <div className="font-bold text-gray-900 mb-1">
                      {t(
                        `quickFeatures.${key === "signup" ? "profileTitle" : key === "messaging" ? "messagingTitle" : "videoTitle"}`
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t(
                        `quickFeatures.${key === "signup" ? "profileDesc" : key === "messaging" ? "messagingDesc" : "videoDesc"}`
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-card border-2 border-gray-200 bg-white p-8 shadow-lg text-start"
            >
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {t("freePlanName")}
                </span>
                <p className="text-gray-500 mt-1 text-sm">
                  {t("freePlanSubtitle")}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map(({ key }) => (
                  <li key={key} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-teal-500 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <span className="text-gray-900 font-medium text-sm">
                        {t(`free.${key}Title`)}
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {t(`free.${key}Desc`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/auth/signup`}
                className="flex min-h-11 items-center justify-center w-full rounded-card border-2 border-gold-500 text-gold-700 font-bold py-3 hover:bg-gold-50 transition-colors"
              >
                {t("freeTitle")} — {t("getStartedCta")}
              </Link>
            </motion.div>

            {PRICING_PLAN_CARDS.map((plan, index) => {
              const planTitleKey =
                plan.planTier === "premium_monthly"
                  ? "planMonthlyTitle"
                  : "planQuarterlyTitle";
              const isLoading = checkoutLoadingPlan === plan.planTier;

              return (
                <motion.div
                  key={plan.planTier}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="relative rounded-card border-2 border-gold-400 bg-gradient-to-br from-gold-50 to-teal-50 p-8 shadow-xl text-start"
                >
                  <span
                    className="absolute -top-3 start-6 rounded-pill bg-gold-500 px-3 py-1 text-xs font-bold text-white"
                  >
                    {t("premiumBadge")}
                  </span>
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {t(planTitleKey)}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {formatPkrAmount(plan.amountPkr, locale)}
                      </span>
                      <span className="text-gray-500">
                        {t(plan.intervalKey)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      {t("premiumUnlockDesc")}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {premiumFeatures.map(({ key, icon }) => (
                      <li key={key} className="flex items-start gap-3">
                        <span className="text-lg shrink-0">{icon}</span>
                        <div>
                          <span className="text-gray-900 font-medium text-sm">
                            {t(`premium.${key}Title`)}
                          </span>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {t(`premium.${key}Desc`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={ctasDisabled}
                      onClick={() => handleStripeCheckout(plan.planTier)}
                      className="flex min-h-12 items-center justify-center w-full rounded-card bg-gold-500 hover:bg-gold-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 transition-colors shadow-lg"
                    >
                      {isLoading
                        ? tCheckout("checkoutLoading")
                        : tCheckout("payWithCard")}
                    </button>
                    <button
                      type="button"
                      disabled={ctasDisabled}
                      onClick={() =>
                        openManualUpload(
                          plan.planTier,
                          plan.amountPkr,
                          plan.subscriptionTierDb
                        )
                      }
                      className="flex min-h-11 items-center justify-center w-full rounded-card border-2 border-teal-600 text-teal-700 font-bold py-3 hover:bg-teal-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {tCheckout("uploadBankReceipt")}
                    </button>
                  </div>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      {tCheckout("signInRequired")}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          <PricingFAQ />
        </div>
      </section>

      <ManualProofUpload
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        tier={uploadTierDb}
        amount={uploadAmount}
      />

      <Footer />
    </main>
  );
}
