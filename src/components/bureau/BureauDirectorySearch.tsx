"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export default function BureauDirectorySearch() {
  const t = useTranslations("common.bureau.directory");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [nameQuery, setNameQuery] = useState(searchParams.get("q") ?? "");
  const [cityQuery, setCityQuery] = useState(searchParams.get("city") ?? "");

  useEffect(() => {
    setNameQuery(searchParams.get("q") ?? "");
    setCityQuery(searchParams.get("city") ?? "");
  }, [searchParams]);

  const pushParams = useCallback(
    (nextQ: string, nextCity: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedQ = nextQ.trim();
      const trimmedCity = nextCity.trim();

      if (trimmedQ) {
        params.set("q", trimmedQ);
      } else {
        params.delete("q");
      }

      if (trimmedCity) {
        params.set("city", trimmedCity);
      } else {
        params.delete("city");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      const currentCity = searchParams.get("city") ?? "";
      if (nameQuery === currentQ && cityQuery === currentCity) {
        return;
      }
      pushParams(nameQuery, cityQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [cityQuery, nameQuery, pushParams, searchParams]);

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <p className="text-sm font-semibold text-gray-700 mb-3 text-start">
        {t("searchLabel")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="bureau-search-name" className="sr-only">
            {t("namePlaceholder")}
          </label>
          <input
            id="bureau-search-name"
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full ps-4 pe-10 py-3 border-2 border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-base text-start"
          />
        </div>
        <div className="relative">
          <label htmlFor="bureau-search-city" className="sr-only">
            {t("cityPlaceholder")}
          </label>
          <input
            id="bureau-search-city"
            type="search"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder={t("cityPlaceholder")}
            className="w-full ps-4 pe-10 py-3 border-2 border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent text-base text-start"
          />
          <svg
            className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
