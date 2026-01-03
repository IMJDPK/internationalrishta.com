"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { formatPhone, isValidPhone } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations("common.auth.signup");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    plan: "trial",
    referralCode: "",
    acceptTerms: false,
    acceptLocation: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const referralPattern = /^[A-Z0-9]{3,10}-[A-Z]{3}$/;

  const passwordScore = (value: string) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score;
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 2) return t("strengthWeak");
    if (score === 3) return t("strengthOkay");
    return t("strengthStrong");
  };

  const handleGoogleSignup = async () => {
    setError("");
    setIsLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/discover`,
      },
    });
    if (authError) setError(authError.message);
    setIsLoading(false);
  };

  const handleStepOneContinue = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError(t("continue"));
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError(t("phoneInvalid"));
      return;
    }
    if (formData.password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePlanContinue = () => {
    if (
      formData.plan === "referral" &&
      !referralPattern.test(formData.referralCode.trim())
    ) {
      setError(t("referralCodeInvalid"));
      return;
    }
    setError("");
    setStep(3);
  };

  const handleEmailSignup = async () => {
    if (!formData.acceptTerms || !formData.acceptLocation) return;
    setError("");
    setIsLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          phone: formData.phone,
          plan: formData.plan,
          referral_code: formData.referralCode,
        },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      router.push(`/${locale}/discover`);
    }
    setIsLoading(false);
  };

  return (
    <main className="bg-gradient-to-br from-gold-50 via-white to-teal-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-gold-200 mb-4">
                <svg
                  className="w-4 h-4 text-gold-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {t("ribbon")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {t("title")}
              </h1>
              <p className="text-lg text-gray-600">{t("subtitle")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 md:p-12"
            >
              {/* Progress Bar */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">
                    {t("stepLabel", { step })}
                  </span>
                  <span className="text-sm font-semibold text-gold-600">
                    {t("progress", { percent: Math.round((step / 3) * 100) })}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-pill overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step 1: Authentication Method */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <button
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gold-400 hover:bg-gold-50/50 text-gray-700 font-semibold py-4 rounded-card transition-all shadow-sm hover:shadow-md"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t("google")}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        {t("orContinue")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t("namePlaceholder")}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setFormData({ ...formData, phone: formatted });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{t("passwordStrength")}</span>
                        <span>
                          {getStrengthLabel(passwordScore(formData.password))}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordScore(formData.password) >= 4
                              ? "bg-green-500"
                              : passwordScore(formData.password) === 3
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              (passwordScore(formData.password) / 5) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    onClick={handleStepOneContinue}
                    disabled={isLoading}
                    className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-card transition-colors"
                  >
                    {isLoading ? "Please wait..." : t("continue")}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    {t("already")}{" "}
                    <Link
                      href={`/${locale}/auth/signin`}
                      className="text-gold-600 hover:text-gold-700 font-semibold"
                    >
                      {t("signIn")}
                    </Link>
                  </p>
                </motion.div>
              )}

              {/* Step 2: Plan Selection */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("choosePlan")}
                  </h2>

                  <div className="space-y-4">
                    {/* Trial Option */}
                    <label
                      className={`block p-6 border-2 rounded-card cursor-pointer transition-all ${
                        formData.plan === "trial"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="trial"
                        checked={formData.plan === "trial"}
                        onChange={(e) =>
                          setFormData({ ...formData, plan: e.target.value })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {t("trialTitle")}
                            </h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-pill">
                              RECOMMENDED
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{t("trialDesc")}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            {t("trialNote")}
                          </p>
                          <p className="text-3xl font-bold text-purple-600">
                            {t("trialPrice")}
                          </p>
                        </div>
                        {formData.plan === "trial" && (
                          <svg
                            className="w-6 h-6 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </label>

                    {/* Bureau Referral Option */}
                    <label
                      className={`block p-6 border-2 rounded-card cursor-pointer transition-all ${
                        formData.plan === "referral"
                          ? "border-gold-500 bg-gold-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="referral"
                        checked={formData.plan === "referral"}
                        onChange={(e) =>
                          setFormData({ ...formData, plan: e.target.value })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {t("referralTitle")}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {t("referralDesc")}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {t("referralPrice")}
                          </p>
                        </div>
                        {formData.plan === "referral" && (
                          <svg
                            className="w-6 h-6 text-gold-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </label>

                    <label
                      className={`block p-6 border-2 rounded-card cursor-pointer transition-all ${
                        formData.plan === "direct"
                          ? "border-gold-500 bg-gold-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value="direct"
                        checked={formData.plan === "direct"}
                        onChange={(e) =>
                          setFormData({ ...formData, plan: e.target.value })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {t("directTitle")}
                            </h3>
                            <span className="bg-gold-500 text-white px-2 py-1 rounded text-xs font-bold">
                              POPULAR
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {t("directDesc")}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {t("directPrice")}
                          </p>
                        </div>
                        {formData.plan === "direct" && (
                          <svg
                            className="w-6 h-6 text-gold-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                  </div>

                  {formData.plan === "referral" && (
                    <input
                      type="text"
                      placeholder={t("referralCodePlaceholder")}
                      value={formData.referralCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referralCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-gold-500 focus:border-transparent font-mono"
                    />
                  )}

                  {error && step === 2 && formData.plan === "referral" && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-card transition-colors"
                    >
                      {t("back")}
                    </button>
                    <button
                      onClick={handlePlanContinue}
                      className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-4 rounded-card transition-colors"
                    >
                      {t("continueToTerms")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Terms & Consent */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t("termsTitle")}
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            acceptTerms: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                      />
                      <span className="text-gray-700">
                        {t("acceptTerms")}{" "}
                        <Link
                          href="/terms"
                          className="text-gold-600 hover:text-gold-700 underline"
                        >
                          {t("termsLink")}
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-gold-600 hover:text-gold-700 underline"
                        >
                          {t("privacyLink")}
                        </Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.acceptLocation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            acceptLocation: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                      />
                      <span className="text-gray-700">
                        {t("acceptLocation")}
                      </span>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      {t("nextStepsTitle")}
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      {t
                        .raw("nextSteps")
                        .map((stepText: string, idx: number) => (
                          <li key={idx}>{stepText}</li>
                        ))}
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-card transition-colors"
                    >
                      {t("back")}
                    </button>
                    <button
                      onClick={handleEmailSignup}
                      disabled={
                        !formData.acceptTerms ||
                        !formData.acceptLocation ||
                        isLoading
                      }
                      className={`flex-1 font-bold py-4 rounded-card transition-colors ${
                        formData.acceptTerms &&
                        formData.acceptLocation &&
                        !isLoading
                          ? "bg-gold-500 hover:bg-gold-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Submitting..." : t("createAccount")}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
