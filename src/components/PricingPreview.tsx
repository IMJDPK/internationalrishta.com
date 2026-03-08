"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";

export default function PricingPreview() {
  const locale = useLocale();

  const features = [
    {
      icon: "🔍",
      title: "Unlimited Discovery",
      description: "Browse and swipe through unlimited verified profiles",
    },
    {
      icon: "💬",
      title: "Free Messaging",
      description: "Chat with your matches without any restrictions",
    },
    {
      icon: "🎥",
      title: "Video Calls",
      description: "Connect face-to-face with verified members",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-teal-50 via-white to-gold-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-pill border border-teal-200 mb-6">
            <span className="text-sm font-medium text-gray-700">
              ✨ No Credit Card Required
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-teal-500 to-gold-500 bg-clip-text text-transparent">
              100% Free
            </span>{" "}
            for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All features included. No subscriptions, no hidden charges, no
            limits.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="bg-white rounded-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href={`/${locale}/auth/signup`}
            className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-4 rounded-card transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
