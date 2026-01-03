"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question:
        "What is the difference between Bureau Referral and Direct Membership?",
      answer:
        "Bureau Referral (PKR 3,999/month) is for members referred by a licensed Marriage Bureau partner. These members receive bureau support and guidance. Direct Membership (PKR 4,999/month) includes all referral features plus premium perks like profile boosts, faster video unlocks, and priority support.",
    },
    {
      question: "How does the points system work?",
      answer:
        "You earn points through platform engagement: completing your profile, daily logins, verified matches, and conversations. Points unlock premium features like video calls. Direct members earn bonus points on signup and accumulate points faster.",
    },
    {
      question: "What is in-person verification?",
      answer:
        "Optional service where a licensed Marriage Bureau agent meets with you in person to verify your identity and profile details. Costs PKR 20,000 when both parties agree; 20% platform fee is deducted, and the bureau receives PKR 16,000. Adds an extra trust badge to your profile.",
    },
    {
      question: "Can I switch plans later?",
      answer:
        "Yes! You can upgrade from Bureau Referral to Direct Membership at any time. The price difference will be prorated for the current month.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "No hidden fees. Monthly subscription covers all features listed in your plan. In-person verification is optional (PKR 20,000). No cancellation fees.",
    },
    {
      question: "How do refunds work?",
      answer:
        "We offer a 7-day money-back guarantee. If you're not satisfied within the first 7 days, contact support for a full refund. After 7 days, subscriptions are non-refundable but you can cancel anytime.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept JazzCash, Raast instant payments, and direct bank transfers to HBL account 50347000837855 (IMJD YOUR DIGITAL MEDIA PARTNER). Please include your email in transfer reference.",
    },
    {
      question: "Do Marriage Bureaus really earn 20% commission?",
      answer:
        "Yes! Licensed Marriage Bureau partners earn 20% lifetime commission (PKR 799.80/month) on every member they refer. For in-person verification, PKR 20,000 is charged when both parties agree; after a 20% platform fee, the bureau receives PKR 16,000. Commissions are paid weekly via bank transfer.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-card shadow-md overflow-hidden border border-gray-200"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 text-lg">
                {faq.question}
              </span>
              <svg
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
