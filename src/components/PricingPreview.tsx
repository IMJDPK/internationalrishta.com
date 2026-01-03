'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PricingPreview() {
  const t = useTranslations('common.pricing');
  const locale = useLocale();

  const tiers = [
    {
      key: 'referral',
      price: '3,999',
      popular: false,
      features: ['lifetime', 'bureau', 'verified', 'messaging', 'points', 'support'],
    },
    {
      key: 'direct',
      price: '4,999',
      popular: true,
      features: ['all_referral', 'boosts', 'fast_video', 'advanced', 'priority', 'stars'],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gold-500 text-white px-6 py-2 rounded-pill text-sm font-bold shadow-lg">
                    {t('popular')}
                  </span>
                </div>
              )}

              <div
                className={`bg-white rounded-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
                  tier.popular ? 'border-gold-400' : 'border-gray-200'
                } h-full`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t(`${tier.key}.name`)}
                </h3>
                <p className="text-gray-600 mb-6">{t(`${tier.key}.description`)}</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      PKR {tier.price}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-gold-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{t(`features.${feature}`)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/${locale}/auth/signup?plan=${tier.key}`}
                  className={`block w-full text-center px-6 py-4 rounded-card font-bold transition-all ${
                    tier.popular
                      ? 'bg-gold-500 hover:bg-gold-600 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {t('getStarted')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href={`/${locale}/pricing`}
            className="text-gold-600 hover:text-gold-700 font-semibold text-lg underline"
          >
            {t('viewFull')} →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
