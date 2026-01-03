'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VideoHero() {
  const t = useTranslations('common.hero');
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const videos = [
    '/assets/Banner-Video-01-15-21.mp4',
    '/assets/Banner-Video-07-06-21.mp4',
    '/assets/Banner-Video-10-24-19.mp4',
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play failed, fallback to poster
      });
    }
  }, [currentVideo]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-20">
      {/* Video Background */}
      <video
        ref={videoRef}
        key={currentVideo}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/Banner - International RishtaConnecting Hearts Worldwide.png"
        onLoadedData={() => setIsVideoLoaded(true)}
      >
        <source src={videos[currentVideo]} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-5xl"
        >
          {/* Ribbon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-block px-8 py-3 bg-gradient-to-r from-gold-500/30 to-teal-500/30 backdrop-blur-md border border-gold-400/40 rounded-pill text-gold-100 text-base font-medium shadow-lg">
              ✨ {t('ribbon')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight leading-tight"
          >
            {t('headline')}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-xl md:text-3xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            {t('subheadline')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href={`/${locale}/auth/signup`}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(234, 179, 8, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-card font-bold text-lg shadow-2xl transition-all"
              >
                {t('cta')}
              </motion.button>
            </Link>
            <Link href={`/${locale}#how-it-works`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-card font-bold text-lg hover:bg-white/20 transition-all shadow-xl"
              >
                {t('secondaryCta')}
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Indicators */}
      <div className="absolute bottom-32 start-1/2 -translate-x-1/2 z-20 flex gap-3">
        {videos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentVideo(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentVideo
                ? 'bg-gold-400 w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Switch to video ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, repeat: Infinity, duration: 2.5, repeatType: 'reverse' }}
        className="absolute bottom-12 start-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-7 h-12 border-2 border-white/60 rounded-pill flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
