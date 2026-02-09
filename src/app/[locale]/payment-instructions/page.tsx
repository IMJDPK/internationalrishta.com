"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentInstructionsPage() {
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const paymentDetails = {
    phone: "03002027977",
    accountName: "Jawad Khalid Khan",
    email: "info@internationalrishta.com",
    amount: {
      referral: 3999,
      direct: 4999,
    },
  };

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(`/${locale}/auth/signin`);
        return;
      }

      setUser(authUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setProfile(profileData);
      setIsLoading(false);
    };

    fetchUser();
  }, [locale, router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const amount =
    profile?.subscription_tier === "referral"
      ? paymentDetails.amount.referral
      : paymentDetails.amount.direct;

  if (isLoading) {
    return (
      <main className="bg-gradient-to-br from-gold-50 via-white to-teal-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-gold-50 via-white to-teal-50 min-h-screen">
      <Navigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-gold-200 mb-4">
              <svg
                className="w-4 h-4 text-gold-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Almost There!
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Complete Your Payment
            </h1>
            <p className="text-lg text-gray-600">
              Follow the steps below to activate your account
            </p>
          </motion.div>

          {/* Payment Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-xl border border-white/20 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Payment Instructions
            </h2>

            {/* Amount */}
            <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-lg p-6 mb-6 border border-gold-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                  <p className="text-4xl font-bold text-gray-900">
                    PKR {amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile?.subscription_tier === "referral"
                      ? "Referral Member"
                      : "Direct Member"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <svg
                    className="w-12 h-12 text-gold-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 1: Make Payment */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Send Payment via RAAST or JazzCash
                  </h3>

                  <div className="space-y-3">
                    {/* Phone Number */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Account Number
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {paymentDetails.phone}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(paymentDetails.phone, "phone")
                          }
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {copied === "phone" ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Account Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {paymentDetails.accountName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Send Email */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Send Confirmation Email
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email to</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {paymentDetails.email}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(paymentDetails.email, "email")
                        }
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {copied === "email" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      Include in your email:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • Your full name:{" "}
                        {user?.user_metadata?.full_name || user?.email}
                      </li>
                      <li>• Email: {user?.email}</li>
                      <li>• Transaction ID / Screenshot</li>
                      <li>• Amount paid: PKR {amount.toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Send WhatsApp/SMS */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Send WhatsApp Message
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm text-gray-600 mb-1">Message to</p>
                    <p className="text-lg font-semibold text-gray-900 mb-3">
                      {paymentDetails.phone}
                    </p>
                    <a
                      href={`https://wa.me/${paymentDetails.phone.replace(
                        /^0/,
                        "92"
                      )}?text=Hi,%20I%20have%20made%20payment%20for%20International%20Rishta%20account.%0AName:%20${
                        user?.user_metadata?.full_name || user?.email
                      }%0AEmail:%20${user?.email}%0AAmount:%20PKR%20${amount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Open WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Timeline */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⏱️ What Happens Next?
              </h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>
                  • Our team will verify your payment within{" "}
                  <strong>24 hours</strong>
                </li>
                <li>• You'll receive a confirmation email once verified</li>
                <li>• Your account will be activated automatically</li>
                <li>• You can then access all premium features</li>
              </ul>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/${locale}/profile`)}
              className="flex-1 bg-white border-2 border-gold-500 text-gold-600 px-8 py-4 rounded-card font-semibold hover:bg-gold-50 transition-all"
            >
              Go to Profile
            </button>
            <button
              onClick={() => router.push(`/${locale}/discover`)}
              className="flex-1 bg-gradient-to-r from-gold-500 to-teal-500 hover:from-gold-600 hover:to-teal-600 text-white px-8 py-4 rounded-card font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Browse Profiles
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
