"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";

interface SubscriptionPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature: "messaging" | "videoCall" | "profileBoost" | "advancedFilters";
}

export default function SubscriptionPaywall({
  isOpen,
  onClose,
  feature,
}: SubscriptionPaywallProps) {
  const locale = useLocale();

  const featureDetails = {
    messaging: {
      icon: "💬",
      title: "Unlock Messaging",
      description:
        "Start conversations with your matches and build meaningful connections.",
    },
    videoCall: {
      icon: "🎥",
      title: "Unlock Video Calls",
      description:
        "Meet face-to-face with your matches through secure video calls.",
    },
    profileBoost: {
      icon: "🚀",
      title: "Boost Your Profile",
      description: "Get 3x more visibility with profile boosts every week.",
    },
    advancedFilters: {
      icon: "🔍",
      title: "Advanced Filters",
      description: "Find your perfect match with detailed filtering options.",
    },
  };

  const details = featureDetails[feature];

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
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-gold-500 via-gold-600 to-teal-500 p-8 text-white text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="text-6xl mb-4">{details.icon}</div>
                <h2 className="text-3xl font-bold mb-2">{details.title}</h2>
                <p className="text-white/90">{details.description}</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Subscribe to unlock:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Unlimited secure messaging
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Video calls with matches
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Advanced search filters
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        Profile verification badge
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">
                        24/7 priority support
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="border-2 border-gray-200 rounded-card p-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      Bureau Referral
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      PKR 3,999
                    </div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                  <div className="border-2 border-gold-400 bg-gold-50 rounded-card p-4 text-center relative">
                    <div className="absolute -top-2 start-1/2 -translate-x-1/2">
                      <span className="bg-gold-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                        POPULAR
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Direct</div>
                    <div className="text-2xl font-bold text-gray-900">
                      PKR 4,999
                    </div>
                    <div className="text-xs text-gray-500">/month</div>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <Link
                    href={`/${locale}/pricing`}
                    className="block w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-4 rounded-card text-center transition-all shadow-lg"
                  >
                    View Pricing Plans
                  </Link>
                  <button
                    onClick={onClose}
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-card text-center transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">
                  No hidden fees • Cancel anytime • Secure payment
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
