"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [activeMembers, setActiveMembers] = useState(1247);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPoliciesMenu, setShowPoliciesMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if we're on the homepage
  const isHomePage = pathname === `/${locale}` || pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      // Check if user is admin
      if (authUser) {
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", authUser.id)
          .single();
        // Treat 404 as not admin; any other error shouldn't hide the menu silently
        setIsAdmin(Boolean(adminData && !adminError));
      }
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push(`/${locale}`);
  };

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
              className="h-12 md:h-16 w-auto -me-2"
            />
            <span
              className={`hidden lg:inline text-base font-semibold tracking-tight transition-colors ${
                isHomePage && !scrolled ? "text-white" : "text-gray-900"
              }`}
            >
              Internationalrishta.com
            </span>
          </Link>

          {/* Mobile Toggle */}
          <button
            type="button"
            className={`md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border transition-colors ${
              isHomePage && !scrolled
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-expanded={showMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="text-lg">☰</span>
          </button>

          {/* Desktop/Tablet Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
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
              className={`hidden lg:inline-flex text-sm font-medium transition-colors ${
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
            <div
              className="relative"
              onMouseEnter={() => setShowPoliciesMenu(true)}
              onMouseLeave={() => setShowPoliciesMenu(false)}
            >
              <button
                type="button"
                onClick={() => setShowPoliciesMenu((prev) => !prev)}
                className={`text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                  isHomePage && !scrolled
                    ? "text-white hover:text-gold-300"
                    : "text-gray-700 hover:text-gold-600"
                }`}
                aria-expanded={showPoliciesMenu}
                aria-haspopup="true"
              >
                {t("navigation.policies")}
                <span aria-hidden className="text-xs">
                  ▾
                </span>
              </button>
              {showPoliciesMenu && (
                <div className="absolute start-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
                  <Link
                    href={`/${locale}/return-refund`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowPoliciesMenu(false)}
                  >
                    {t("navigation.returnRefund")}
                  </Link>
                  <Link
                    href={`/${locale}/shipping-service`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowPoliciesMenu(false)}
                  >
                    {t("navigation.shippingService")}
                  </Link>
                </div>
              )}
            </div>
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
              className={`hidden lg:flex px-4 py-2 rounded-pill border ${
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

            {/* User Menu or Sign In/Up */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-pill bg-gold-500 hover:bg-gold-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute end-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gold-600 font-semibold hover:bg-gold-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          ⚡ Admin Dashboard
                        </Link>
                        <hr className="my-2" />
                      </>
                    )}
                    <Link
                      href={`/${locale}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href={`/${locale}/messages`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Messages
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
                  className="px-5 lg:px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-pill font-semibold text-sm shadow-lg transition-all hover:shadow-xl"
                >
                  {t("navigation.signUp")}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 rounded-card border border-gray-200 bg-white/95 backdrop-blur-md shadow-lg p-4 space-y-3">
            <Link
              href={`/${locale}`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.home")}
            </Link>
            <Link
              href={`/${locale}/discover`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.discover")}
            </Link>
            <Link
              href={`/${locale}/messages`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.messages")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.pricing")}
            </Link>
            <Link
              href={`/${locale}/return-refund`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.returnRefund")}
            </Link>
            <Link
              href={`/${locale}/shipping-service`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.shippingService")}
            </Link>
            <Link
              href={`/${locale}/bureau`}
              className="block text-sm font-medium text-gray-700 hover:text-gold-600"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("navigation.bureau")}
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={`/${otherLocale}`}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowMobileMenu(false)}
              >
                {otherLocale.toUpperCase()}
              </Link>
              <span className="text-xs font-semibold text-gray-600">
                {t("subscription.counter", {
                  count: activeMembers.toLocaleString(),
                })}
              </span>
            </div>
            {user ? (
              <button
                onClick={async () => {
                  await handleSignOut();
                  setShowMobileMenu(false);
                }}
                className="w-full text-start text-sm font-medium text-red-600 hover:text-red-700"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/auth/signin`}
                  className="text-sm font-medium text-gray-700 hover:text-gold-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t("navigation.signIn")}
                </Link>
                <Link
                  href={`/${locale}/auth/signup`}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-pill font-semibold text-sm shadow-lg transition-all hover:shadow-xl"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t("navigation.signUp")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
