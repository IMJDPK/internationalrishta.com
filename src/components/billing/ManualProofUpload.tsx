"use client";

import { createClient } from "@/lib/supabase/client";
import {
  buildManualProofStoragePath,
  validateProofFile,
} from "@/lib/billing/validate-proof-file";
import type { SubscriptionTierDb } from "@/types/billing.types";
import { MANUAL_TIER_AMOUNTS_PKR } from "@/types/billing.types";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export interface ManualProofUploadProps {
  open: boolean;
  onClose: () => void;
  tier?: SubscriptionTierDb;
  amount?: number;
  onSuccess?: () => void;
}

type UploadPhase = "idle" | "uploading" | "success" | "error";

export default function ManualProofUpload({
  open,
  onClose,
  tier = "direct",
  amount,
  onSuccess,
}: ManualProofUploadProps) {
  const t = useTranslations("common.pricingCheckout.manualProofUpload");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("raast");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolvedAmount = amount ?? MANUAL_TIER_AMOUNTS_PKR[tier];

  const resetForm = useCallback(() => {
    setTransactionId("");
    setPaymentMethod("raast");
    setFile(null);
    setPhase("idle");
    setErrorMessage(null);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage(t("errors.notAuthenticated"));
      setPhase("error");
      return;
    }

    if (!file) {
      setErrorMessage(t("errors.noFile"));
      setPhase("error");
      return;
    }

    const validation = validateProofFile(file);
    if (!validation.valid) {
      const key = validation.errorKey ?? "invalidType";
      setErrorMessage(t(`errors.${key}`));
      setPhase("error");
      return;
    }

    setPhase("uploading");

    const storagePath = buildManualProofStoragePath(
      user.id,
      validation.extension ?? "bin"
    );

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(storagePath, file, {
        contentType: validation.mimeType,
        upsert: false,
      });

    if (uploadError) {
      setErrorMessage(t("errors.uploadFailed"));
      setPhase("error");
      return;
    }

    const email = user.email ?? "";
    const { error: insertError } = await supabase
      .from("payment_notifications")
      .insert({
        user_id: user.id,
        email,
        payment_method: paymentMethod,
        amount: resolvedAmount,
        transaction_id: transactionId.trim() || null,
        screenshot_url: storagePath,
        status: "pending",
      });

    if (insertError) {
      setErrorMessage(t("errors.submitFailed"));
      setPhase("error");
      return;
    }

    setPhase("success");
    onSuccess?.();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-proof-title"
    >
      <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-xl text-start">
        <h2
          id="manual-proof-title"
          className="text-xl font-bold text-gray-900 mb-2"
        >
          {t("title")}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{t("subtitle")}</p>

        {phase === "success" ? (
          <div className="space-y-4">
            <p className="text-teal-700 font-medium">{t("successTitle")}</p>
            <p className="text-sm text-gray-600">{t("successMessage")}</p>
            <p className="text-sm text-gray-500">{t("pendingNote")}</p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full min-h-11 rounded-card bg-gold-500 hover:bg-gold-600 text-white font-semibold"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("amountLabel")}
              </label>
              <p className="text-lg font-bold text-gray-900">
                PKR {resolvedAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <label
                htmlFor="payment-method"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("paymentMethodLabel")}
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-card border border-gray-300 px-3 py-2 text-sm"
                disabled={phase === "uploading"}
              >
                <option value="raast">{t("methods.raast")}</option>
                <option value="hbl">{t("methods.hbl")}</option>
                <option value="manual">{t("methods.manual")}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="transaction-id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("transactionIdLabel")}
              </label>
              <input
                id="transaction-id"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder={t("transactionIdPlaceholder")}
                className="w-full rounded-card border border-gray-300 px-3 py-2 text-sm"
                disabled={phase === "uploading"}
              />
            </div>

            <div>
              <label
                htmlFor="proof-file"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("fileLabel")}
              </label>
              <input
                id="proof-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
                disabled={phase === "uploading"}
              />
              <p className="text-xs text-gray-500 mt-1">{t("fileHint")}</p>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 min-h-11 rounded-card border border-gray-300 text-gray-700 font-semibold"
                disabled={phase === "uploading"}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="flex-1 min-h-11 rounded-card bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60"
                disabled={phase === "uploading"}
              >
                {phase === "uploading" ? t("uploading") : t("submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
