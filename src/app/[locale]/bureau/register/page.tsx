"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import {
  formatCNIC,
  formatPhone,
  isValidCNIC,
  isValidPhone,
} from "@/lib/formatters";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function BureauRegisterPage() {
  const locale = useLocale();
  const t = useTranslations("common");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bureauName: "",
    ownerName: "",
    cnic: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    businessRegistration: "",
    officeType: "owned",
    referenceCount: 0,
    acceptTerms: false,
    applicationFeeProof: null as File | null,
  });
  const [errors, setErrors] = useState({ cnic: "", phone: "" });

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Hyderabad",
    "Bahawalpur",
    "Sargodha",
    "Sukkur",
    "Larkana",
    "Mardan",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, applicationFeeProof: e.target.files[0] });
    }
  };

  const handleStepOneNext = () => {
    const nextErrors = { cnic: "", phone: "" };
    if (!isValidCNIC(formData.cnic)) {
      nextErrors.cnic = t("validation.cnic");
    }
    if (!isValidPhone(formData.phone)) {
      nextErrors.phone = t("validation.phone");
    }
    setErrors(nextErrors);
    if (!nextErrors.cnic && !nextErrors.phone) {
      setStep(2);
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 via-white to-gold-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-purple-200 mb-4">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {t("bureau.register.ribbon")}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {t("bureau.register.title")}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("bureau.register.subtitle")}
              </p>
            </motion.div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900">
                  {t("bureau.register.stepLabel", { step })}
                </span>
                <span className="text-sm font-semibold text-purple-600">
                  {t("bureau.register.progress", {
                    percent: Math.round((step / 3) * 100),
                  })}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-pill overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 md:p-12"
            >
              {/* Step 1: Bureau Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("bureau.register.step1.title")}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.bureauName")}
                      </label>
                      <input
                        type="text"
                        value={formData.bureauName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bureauName: e.target.value,
                          })
                        }
                        placeholder={t(
                          "bureau.register.step1.bureauNamePlaceholder"
                        )}
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.ownerName")}
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ownerName: e.target.value,
                          })
                        }
                        placeholder={t(
                          "bureau.register.step1.ownerNamePlaceholder"
                        )}
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.cnic")}
                      </label>
                      <input
                        type="text"
                        value={formData.cnic}
                        onChange={(e) => {
                          const formatted = formatCNIC(e.target.value);
                          setFormData({ ...formData, cnic: formatted });
                          if (errors.cnic) setErrors({ ...errors, cnic: "" });
                        }}
                        placeholder={t("bureau.register.step1.cnicPlaceholder")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {errors.cnic && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.cnic}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.phone")}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData({ ...formData, phone: formatted });
                          if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                        placeholder={t(
                          "bureau.register.step1.phonePlaceholder"
                        )}
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.email")}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder={t(
                          "bureau.register.step1.emailPlaceholder"
                        )}
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("bureau.register.step1.city")}
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">
                          {t("bureau.register.step1.cityPlaceholder")}
                        </option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("bureau.register.step1.address")}
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder={t(
                        "bureau.register.step1.addressPlaceholder"
                      )}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleStepOneNext}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-card transition-colors"
                  >
                    {t("bureau.register.step1.continue")}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("bureau.register.step2.title")}
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("bureau.register.step2.registration")}
                    </label>
                    <input
                      type="text"
                      value={formData.businessRegistration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessRegistration: e.target.value,
                        })
                      }
                      placeholder={t(
                        "bureau.register.step2.registrationPlaceholder"
                      )}
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {t("bureau.register.step2.registrationHint")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      {t("bureau.register.step2.officeType")}
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-card cursor-pointer hover:border-purple-400 transition-colors">
                        <input
                          type="radio"
                          name="officeType"
                          value="owned"
                          checked={formData.officeType === "owned"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              officeType: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {t("bureau.register.step2.owned")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("bureau.register.step2.ownedDesc")}
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-card cursor-pointer hover:border-purple-400 transition-colors">
                        <input
                          type="radio"
                          name="officeType"
                          value="rented"
                          checked={formData.officeType === "rented"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              officeType: e.target.value,
                            })
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {t("bureau.register.step2.rented")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("bureau.register.step2.rentedDesc")}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("bureau.register.step2.referenceCount")}
                    </label>
                    <input
                      type="number"
                      value={formData.referenceCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceCount: parseInt(e.target.value),
                        })
                      }
                      min="0"
                      placeholder={t(
                        "bureau.register.step2.referenceCountPlaceholder"
                      )}
                      className="w-full px-4 py-3 border border-gray-300 rounded-card focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {t("bureau.register.step2.referenceCountHint")}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-card transition-colors"
                    >
                      {t("bureau.register.step2.back")}
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-card transition-colors"
                    >
                      {t("bureau.register.step2.continue")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment & Terms */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {t("bureau.register.step3.title")}
                  </h2>

                  {/* Payment Structure */}
                  <div className="bg-gradient-to-br from-purple-50 to-gold-50 rounded-lg p-6 border-2 border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {t("bureau.register.step3.feeStructure")}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-semibold">
                          {t("bureau.register.step3.applicationFee")}
                        </span>
                        <span className="font-bold text-purple-600">
                          PKR 20,000
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-semibold">
                          {t("bureau.register.step3.registrationFee")}
                        </span>
                        <span className="font-bold text-gold-600">
                          PKR 200,000
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gold-100 rounded-lg border-2 border-gold-300">
                        <span className="font-bold">
                          {t("bureau.register.step3.totalInvestment")}
                        </span>
                        <span className="font-bold text-gray-900 text-lg">
                          PKR 220,000
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-4">
                      {t("bureau.register.step3.feeNote")}
                    </p>
                  </div>

                  {/* HBL Account */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {t("bureau.register.step3.paymentInstructions")}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>{t("bureau.register.step3.bank")}</strong>{" "}
                        {t("bureau.register.step3.bankName")}
                      </p>
                      <p>
                        <strong>
                          {t("bureau.register.step3.accountTitle")}
                        </strong>{" "}
                        {t("bureau.register.step3.accountTitleName")}
                      </p>
                      <p>
                        <strong>
                          {t("bureau.register.step3.accountNumber")}
                        </strong>{" "}
                        {t("bureau.register.step3.accountNumberValue")}
                      </p>
                      <p className="pt-2 text-blue-700 font-medium">
                        {t("bureau.register.step3.depositNote")}
                      </p>
                    </div>
                  </div>

                  {/* Upload Proof */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("bureau.register.step3.uploadProof")}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-card p-8 text-center hover:border-purple-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="payment-proof"
                      />
                      <label htmlFor="payment-proof" className="cursor-pointer">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-gray-600">
                          {formData.applicationFeeProof
                            ? formData.applicationFeeProof.name
                            : t("bureau.register.step3.uploadPlaceholder")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("bureau.register.step3.uploadHint")}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Terms */}
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
                      className="mt-1 w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      {t.rich("bureau.register.step3.termsAccept", {
                        termsLink: (chunks) => (
                          <Link
                            href={`/${locale}/terms`}
                            className="text-purple-600 hover:text-purple-700 underline"
                          >
                            {chunks}
                          </Link>
                        ),
                      })}
                    </span>
                  </label>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>{t("bureau.register.step3.nextSteps")}</strong>{" "}
                      {t("bureau.register.step3.nextStepsNote")}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-card transition-colors"
                    >
                      {t("bureau.register.step3.back")}
                    </button>
                    <button
                      disabled={
                        !formData.acceptTerms || !formData.applicationFeeProof
                      }
                      className={`flex-1 font-bold py-4 rounded-card transition-colors ${
                        formData.acceptTerms && formData.applicationFeeProof
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {t("bureau.register.step3.submit")}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-white/60 backdrop-blur-sm rounded-card p-6 border border-gray-200"
            >
              <h3 className="font-bold text-gray-900 mb-3">
                What happens after submission?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">1.</span>
                  <span>
                    Our team verifies your payment proof (within 30 minutes)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">2.</span>
                  <span>
                    Application reviewed within 14 days (includes background
                    check)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">3.</span>
                  <span>
                    If approved, you'll receive an invoice for PKR 200,000
                    registration fee
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">4.</span>
                  <span>
                    Upon payment, your license is activated and you receive your
                    unique referral code
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">5.</span>
                  <span>
                    Start earning 20% lifetime commission on every referral!
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
