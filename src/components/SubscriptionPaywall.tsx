"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type PaywallFeature = "videoCall" | "voiceMessage" | "imageMessage";

interface SubscriptionPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature: PaywallFeature;
}

export default function SubscriptionPaywall({ isOpen, onClose, feature }: SubscriptionPaywallProps) {
  const locale = useLocale();
  const t = useTranslations("common.subscriptionPaywall");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Trap focus within modal and close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const featureDetails = {
    videoCall:    { icon: t("videoCall.icon"),    title: t("videoCall.title"),    description: t("videoCall.description") },
    voiceMessage: { icon: t("voiceMessage.icon"), title: t("voiceMessage.title"), description: t("voiceMessage.description") },
    imageMessage: { icon: t("imageMessage.icon"), title: t("imageMessage.title"), description: t("imageMessage.description") },
  };

  const details = featureDetails[feature];

  const premiumFeatures = [
    t("feature1"),
    t("feature2"),
    t("feature3"),
    t("feature4"),
    t("feature5"),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-gold-500 via-gold-600 to-teal-500 p-8 text-white text-center relative">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 end-4 min-w-11 min-h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-6xl mb-4" aria-hidden="true">{details.icon}</div>
                <h2 id="paywall-title" className="text-2xl font-bold mb-2">{details.title}</h2>
                <p className="text-white/90 text-sm">{details.description}</p>
              </div>

              {/* Content */}
              <div className="p-7">
                {/* Free note */}
                <div className="mb-5 px-4 py-3 bg-teal-50 border border-teal-200 rounded-card text-sm text-teal-800 font-medium text-center">
                  {t("freeNote")}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-3">{t("whatsIncluded")}</h3>
                <ul className="space-y-2.5 mb-6">
                  {premiumFeatures.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{t("price")}</span>
                  <span className="text-gray-500 text-lg">{t("perMonth")}</span>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/pricing`}
                    className="flex min-h-12 items-center justify-center w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-3.5 rounded-card text-center transition-all shadow-lg text-base"
                  >
                    {t("upgrade")}
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-11 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-card text-center transition-colors text-sm"
                  >
                    {t("maybeLater")}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">{t("noFees")}</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
