"use client";

import BureauDirectoryEmpty from "@/components/bureau/BureauDirectoryEmpty";
import BureauDirectoryGrid from "@/components/bureau/BureauDirectoryGrid";
import BureauDirectorySearch from "@/components/bureau/BureauDirectorySearch";
import { createClient } from "@/lib/supabase/client";
import type { PublicBureauDirectoryRow } from "@/types/bureau.types";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function matchesCityFilter(bureau: PublicBureauDirectoryRow, city: string) {
  const needle = city.toLowerCase();
  return (
    bureau.city.toLowerCase().includes(needle) ||
    bureau.referral_code.toLowerCase().includes(needle)
  );
}

export default function BureauDirectory() {
  const t = useTranslations("common.bureau.directory");
  const searchParams = useSearchParams();
  const [bureaus, setBureaus] = useState<PublicBureauDirectoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const nameQuery = searchParams.get("q") ?? "";
  const cityQuery = searchParams.get("city") ?? "";

  useEffect(() => {
    const loadBureaus = async () => {
      setIsLoading(true);
      setError(false);

      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("marriage_bureaus")
        .select(
          "id, name, city, address, phone, email, referral_code, rating, total_referrals"
        )
        .eq("is_approved", true)
        .order("city", { ascending: true });

      if (fetchError) {
        console.error("[BureauDirectory] fetch failed:", fetchError.message);
        setError(true);
        setBureaus([]);
      } else {
        setBureaus((data as PublicBureauDirectoryRow[]) ?? []);
      }

      setIsLoading(false);
    };

    void loadBureaus();
  }, []);

  const filteredBureaus = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    const city = cityQuery.trim();

    return bureaus.filter((bureau) => {
      const matchesName = !q || bureau.name.toLowerCase().includes(q);
      const matchesCity = !city || matchesCityFilter(bureau, city);
      return matchesName && matchesCity;
    });
  }, [bureaus, cityQuery, nameQuery]);

  return (
    <section aria-labelledby="bureau-directory-title">
      <div className="text-center mb-8">
        <h2
          id="bureau-directory-title"
          className="text-4xl font-bold text-gray-900 mb-2"
        >
          {t("title")}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto text-start md:text-center">
          {t("subtitle")}
        </p>
      </div>

      <BureauDirectorySearch />

      {isLoading && (
        <p className="text-center text-gray-600 py-12" role="status">
          {t("loading")}
        </p>
      )}

      {!isLoading && error && (
        <p className="text-center text-red-600 py-12" role="alert">
          {t("error")}
        </p>
      )}

      {!isLoading && !error && filteredBureaus.length === 0 && (
        <BureauDirectoryEmpty />
      )}

      {!isLoading && !error && filteredBureaus.length > 0 && (
        <BureauDirectoryGrid bureaus={filteredBureaus} />
      )}
    </section>
  );
}

/** Suspense fallback shell — reads URL params are not required here */
export function BureauDirectoryFallback() {
  const t = useTranslations("common.bureau.directory");

  return (
    <section className="py-12 text-center text-gray-600" role="status">
      {t("loading")}
    </section>
  );
}
