"use client";

import type { PublicBureauDirectoryRow } from "@/types/bureau.types";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface BureauCardProps {
  bureau: PublicBureauDirectoryRow;
  index: number;
}

export default function BureauCard({ bureau, index }: BureauCardProps) {
  const t = useTranslations("common.bureau.directory");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(bureau.referral_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-card p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 flex flex-col h-full"
    >
      <header className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1 text-start">
          {bureau.name}
        </h3>
        <p className="text-gray-600 text-sm flex items-center gap-1 text-start">
          <svg
            className="w-4 h-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {bureau.city}
        </p>
      </header>

      <div className="flex items-center gap-2 mb-4 text-start">
        <div className="flex" aria-label={t("rating", { rating: bureau.rating })}>
          {[0, 1, 2, 3, 4].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${
                star < Math.floor(Number(bureau.rating))
                  ? "text-gold-500"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {t("referrals", { count: bureau.total_referrals })}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600 flex-1">
        <p className="flex items-start gap-2 text-start">
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {bureau.address}
        </p>
        <p className="flex items-center gap-2 text-start">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          {bureau.phone}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-1 text-start">
          {t("referralCode")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono font-bold text-gold-600 text-lg text-start truncate">
            {bureau.referral_code}
          </p>
          <button
            type="button"
            onClick={handleCopyCode}
            className="shrink-0 text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            {copied ? t("copied") : t("copyCode")}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <a
          href={`tel:${bureau.phone}`}
          className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-semibold py-2 rounded-card transition-colors text-center text-sm"
        >
          {t("call")}
        </a>
        <a
          href={`mailto:${bureau.email}`}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-card transition-colors text-center text-sm"
        >
          {t("email")}
        </a>
      </div>
    </motion.article>
  );
}
