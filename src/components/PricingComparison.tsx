'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function PricingComparison() {
  const t = useTranslations('common.pricing');
  const locale = useLocale();

  const plans = [
    {
      key: 'referral',
      price: '3,999',
      popular: false,
      features: [
        { text: t('features.lifetime'), included: true },
        { text: t('features.bureau'), included: true },
        { text: t('features.verified'), included: true },
        { text: t('features.messaging'), included: true },
        { text: t('features.points'), included: true },
        { text: 'Profile boosts (3/week)', included: false },
        { text: 'Faster video call unlock', included: false },
        { text: 'Advanced filters', included: false },
        { text: 'Priority support', included: false },
        { text: 'Bonus stars on signup', included: false },
      ],
    },
    {
      key: 'direct',
      price: '4,999',
      popular: true,
      features: [
        { text: t('features.verified'), included: true },
        { text: t('features.messaging'), included: true },
        { text: t('features.points'), included: true },
        { text: t('features.boosts'), included: true },
        { text: t('features.fast_video'), included: true },
        { text: t('features.advanced'), included: true },
        { text: t('features.priority'), included: true },
        { text: t('features.stars'), included: true },
        { text: 'No commission to bureau', included: true },
        { text: 'Exclusive member badge', included: true },
      ],
    },
  ];

  return (
    <section className="mb-20">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 start-1/2 -translate-x-1/2 z-10">
                <span className="bg-gold-500 text-white px-6 py-2 rounded-pill text-sm font-bold shadow-lg">
                  {t('popular')}
                </span>
              </div>
            )}

            <div
              className={`bg-white rounded-card p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
                plan.popular ? 'border-gold-400 scale-105' : 'border-gray-200'
              } h-full flex flex-col`}
            >
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {t(`${plan.key}.name`)}
                </h3>
                <p className="text-gray-600 mb-6">{t(`${plan.key}.description`)}</p>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">PKR {plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
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
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/auth/signup?plan=${plan.key}`}
                className={`block w-full text-center px-6 py-4 rounded-card font-bold transition-all ${
                  plan.popular
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

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 bg-white rounded-card p-8 shadow-lg max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Payment Methods</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-4">JazzCash / Raast</h4>
            <p className="text-gray-600 mb-4">Pay securely through JazzCash mobile wallet or Raast instant payments.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Image
                src="/assets/raast-payment.png"
                alt="Raast Payment"
                width={200}
                height={60}
                className="w-auto h-auto"
              />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-4">Bank Transfer (HBL)</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-semibold">IMJD YOUR DIGITAL MEDIA PARTNER</p>
              <p className="text-gray-600">Account: 50347000837855</p>
              <p className="text-gray-600">Bank: Habib Bank Limited (HBL)</p>
              <p className="text-xs text-gray-500 mt-2">
                Please include your email in transfer reference
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bureau Commission Info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-12 bg-gradient-to-br from-gold-50 to-teal-50 rounded-card p-8 shadow-lg max-w-4xl mx-auto border border-gold-200"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Marriage Bureau Partnership</h3>
        <div className="space-y-4 text-gray-700">
          <p>
            Marriage Bureaus earn <strong className="text-gold-600">20% lifetime commission</strong> on all referred members (PKR 799.80/month per member).
          </p>
          <p>
            Bureaus also earn <strong className="text-gold-600">80% of in-person verification fees</strong> (PKR 16,000 per verification at PKR 20,000 total fee).
          </p>
          <p>
            Commissions are paid weekly (Monday-Sunday cycle) via bank transfer.
          </p>
          <Link
            href={`/${locale}/bureau`}
            className="inline-block bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-card transition-colors mt-4"
          >
            Become a Partner Bureau →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
