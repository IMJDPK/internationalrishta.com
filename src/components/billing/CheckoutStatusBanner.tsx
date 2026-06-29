"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type CheckoutBannerVariant = "success" | "cancel" | null;

export default function CheckoutStatusBanner() {
  const searchParams = useSearchParams();
  const t = useTranslations("common.pricingCheckout");
  const [dismissed, setDismissed] = useState(false);

  const variant = useMemo((): CheckoutBannerVariant => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") return "success";
    if (checkout === "cancel") return "cancel";
    return null;
  }, [searchParams]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  if (!variant || dismissed) {
    return null;
  }

  const isSuccess = variant === "success";

  return (
    <div
      className={`mb-6 rounded-card border-s-4 p-4 text-start ${
        isSuccess
          ? "border-s-teal-500 bg-teal-50 text-teal-900"
          : "border-s-amber-500 bg-amber-50 text-amber-900"
      }`}
      role="status"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 ps-1">
          <p className="font-semibold">
            {isSuccess ? t("successTitle") : t("cancelTitle")}
          </p>
          <p className="text-sm mt-1 opacity-90">
            {isSuccess ? t("successMessage") : t("cancelMessage")}
          </p>
          {isSuccess && (
            <p className="text-xs mt-2 opacity-80">{t("processingNote")}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-pill px-3 py-1 text-sm font-medium hover:bg-black/5"
          aria-label={t("dismiss")}
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
