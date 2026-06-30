"use client";

import { useTranslations } from "next-intl";

export default function BureauDirectoryEmpty() {
  const t = useTranslations("common.bureau.directory");

  return (
    <div
      className="rounded-card border border-gray-200 bg-gray-50 p-12 text-center"
      role="status"
    >
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl"
        aria-hidden
      >
        🔍
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{t("emptyTitle")}</h3>
      <p className="text-gray-600 max-w-md mx-auto text-start">
        {t("emptyDescription")}
      </p>
    </div>
  );
}
