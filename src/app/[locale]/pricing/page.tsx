"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PricingComparison from "@/components/PricingComparison";
import PricingFAQ from "@/components/PricingFAQ";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <main className="bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-teal-50 via-white to-gold-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-teal-200 mb-6">
              <svg
                className="w-4 h-4 text-teal-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                No Hidden Fees • Lifetime Access
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Simple,
              <span className="bg-gradient-to-r from-teal-500 to-gold-500 bg-clip-text text-transparent">
                {" "}
                Transparent{" "}
              </span>
              Pricing
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Choose the plan that works best for you. All plans include full
              access with no recurring fees.
            </p>

            {/* Quick Comparison */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200">
                <div className="text-3xl font-bold text-gold-600 mb-1">
                  PKR 3,999
                </div>
                <div className="text-sm text-gray-600">Bureau Referral</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-card p-4 border border-gray-200">
                <div className="text-3xl font-bold text-teal-600 mb-1">
                  PKR 4,999
                </div>
                <div className="text-sm text-gray-600">Direct Signup</div>
              </div>
              <div className="bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-4 border-2 border-gold-300">
                <div className="text-3xl font-bold text-gray-900 mb-1">20%</div>
                <div className="text-sm text-gray-600">Bureau Commission</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <PricingComparison />
          <PricingFAQ />
        </div>
      </section>

      <Footer />
    </main>
  );
}
