'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: '📝',
    key: 'step1',
  },
  {
    icon: '✅',
    key: 'step2',
  },
  {
    icon: '🔍',
    key: 'step3',
  },
  {
    icon: '💬',
    key: 'step4',
  },
  {
    icon: '🎥',
    key: 'step5',
  },
  {
    icon: '🤝',
    key: 'step6',
  },
];

export default function HowItWorks() {
  const t = useTranslations('common.howItWorks');

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="relative"
            >
              <div className="bg-white rounded-card p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gold-200 group">
                {/* Step Number */}
                <div className="absolute -top-4 -start-4 w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {idx + 1}
                </div>

                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`${step.key}.description`)}
                </p>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -end-4 w-8 h-0.5 bg-gradient-to-r from-gold-400 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
