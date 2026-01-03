"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeMembers, setActiveMembers] = useState(1247);

  // Check if we're on the homepage
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const otherLocale = locale === "en" ? "ur" : "en";

  // On homepage: transparent → white on scroll
  // On other pages: always white
  const navBg = isHomePage
    ? scrolled
      ? "bg-white/95 backdrop-blur-md shadow-md"
      : "bg-transparent"
    : "bg-white/95 backdrop-blur-md shadow-md";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/assets/logo-golden.png"
              alt={t("siteName")}
              width={200}
              height={67}
              className="h-16 w-auto -me-2"
            />
            <span
              className={`text-base font-semibold tracking-tight transition-colors ${
                isHomePage && !scrolled ? "text-white" : "text-gray-900"
              }`}
            >
              Internationalrishta.com
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href={`/${locale}`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.home")}
            </Link>
            <Link
              href={`/${locale}/discover`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.discover")}
            </Link>
            <Link
              href={`/${locale}/messages`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.messages")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.pricing")}
            </Link>
            <Link
              href={`/${locale}/bureau`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.bureau")}
            </Link>

            {/* Subscription Counter */}
            <div
              className={`px-4 py-2 rounded-pill border ${
                isHomePage && !scrolled
                  ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
                  : "bg-gold-50 border-gold-200 text-gold-700"
              }`}
            >
              <span className="text-xs font-semibold">
                {t("subscription.counter", {
                  count: activeMembers.toLocaleString(),
                })}
              </span>
            </div>

            {/* Locale Switcher */}
            <Link
              href={`/${otherLocale}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {otherLocale.toUpperCase()}
            </Link>

            {/* Sign In */}
            <Link
              href={`/${locale}/auth/signin`}
              className={`text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "text-white hover:text-gold-300"
                  : "text-gray-700 hover:text-gold-600"
              }`}
            >
              {t("navigation.signIn")}
            </Link>

            {/* CTA Button */}
            <Link
              href={`/${locale}/auth/signup`}
              className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-pill font-semibold text-sm shadow-lg transition-all hover:shadow-xl"
            >
              {t("navigation.signUp")}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
