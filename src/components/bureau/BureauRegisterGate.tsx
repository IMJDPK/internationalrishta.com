"use client";

import BureauRegisterForm from "@/components/bureau/BureauRegisterForm";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OwnerBureauRow {
  id: string;
  name: string;
  status: string;
  is_approved: boolean;
  created_at: string;
}

export default function BureauRegisterGate() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(true);
  const [existingBureau, setExistingBureau] = useState<OwnerBureauRow | null>(
    null
  );

  useEffect(() => {
    const loadOwnerBureau = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/${locale}/auth/signin?redirect=/${locale}/bureau/register`);
        return;
      }

      const { data, error } = await supabase
        .from("marriage_bureaus")
        .select("id, name, status, is_approved, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[BureauRegisterGate] bureau fetch failed:", error.message);
      }

      setExistingBureau((data as OwnerBureauRow | null) ?? null);
      setIsLoading(false);
    };

    void loadOwnerBureau();
  }, [locale, router]);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 md:p-12 text-center">
        <p className="text-gray-600">{t("bureau.register.status.loading")}</p>
      </div>
    );
  }

  if (existingBureau && !existingBureau.is_approved) {
    const status = existingBureau.status;
    const titleKey =
      status === "rejected"
        ? "bureau.register.status.rejectedTitle"
        : status === "payment_pending"
          ? "bureau.register.status.paymentPendingTitle"
          : "bureau.register.status.pendingTitle";
    const messageKey =
      status === "rejected"
        ? "bureau.register.status.rejectedMessage"
        : status === "payment_pending"
          ? "bureau.register.status.paymentPendingMessage"
          : "bureau.register.status.pendingMessage";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 md:p-12"
      >
        <div className="text-center mb-6">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              status === "rejected" ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {status === "rejected" ? "✗" : "⏳"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t(titleKey)}
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto text-start">
            {t(messageKey, { name: existingBureau.name })}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6 text-sm text-start">
          <p className="text-gray-500">{t("bureau.register.status.submittedAt")}</p>
          <p className="font-medium text-gray-900">
            {new Date(existingBureau.created_at).toLocaleDateString(locale)}
          </p>
        </div>
        <div className="text-center">
          <Link
            href={`/${locale}/bureau`}
            className="inline-flex items-center justify-center rounded-card bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-600 transition-colors"
          >
            {t("bureau.register.status.backToBureau")}
          </Link>
        </div>
      </motion.div>
    );
  }

  if (existingBureau?.is_approved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t("bureau.register.status.approvedTitle")}
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto text-start">
          {t("bureau.register.status.approvedMessage", {
            name: existingBureau.name,
          })}
        </p>
        <Link
          href={`/${locale}/bureau`}
          className="inline-flex items-center justify-center rounded-card bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-600 transition-colors"
        >
          {t("bureau.register.status.backToBureau")}
        </Link>
      </motion.div>
    );
  }

  return <BureauRegisterForm />;
}
