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
  const [activeMembers] = useState(1247);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPoliciesMenu, setShowPoliciesMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isHomePage = pathname === `/${locale}` || pathname === "/";

  // Locale switcher preserves current path
  const otherLocale = locale === "en" ? "ur" : "en";
  const localizedPath = pathname.replace(new RegExp(`^/${locale}`), `/${otherLocale}`);

  // Active link helper
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", authUser.id)
          .single();
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

  const navBg = isHomePage
    ? scrolled
      ? "bg-white/95 backdrop-blur-md shadow-md"
      : "bg-transparent"
    : "bg-white/95 backdrop-blur-md shadow-md";

  const linkClass = (href: string) => {
    const active = isActive(href);
    if (isHomePage && !scrolled) {
      return active
        ? "text-gold-300 font-semibold border-b-2 border-gold-300 pb-0.5"
        : "text-white hover:text-gold-300";
    }
    return active
      ? "text-gold-600 font-semibold border-b-2 border-gold-500 pb-0.5"
      : "text-gray-700 hover:text-gold-600";
  };

  const navLinks = [
    { href: `/${locale}`, label: t("navigation.home"), authRequired: false },
    { href: `/${locale}/discover`, label: t("navigation.discover"), authRequired: true },
    { href: `/${locale}/messages`, label: t("navigation.messages"), authRequired: true },
    { href: `/${locale}/pricing`, label: t("navigation.pricing"), authRequired: false },
    { href: `/${locale}/bureau`, label: t("navigation.bureau"), authRequired: false },
  ].filter((link) => !link.authRequired || user);

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
            className={`md:hidden inline-flex items-center justify-center min-h-11 min-w-11 rounded-lg border transition-colors ${
              isHomePage && !scrolled
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label={showMobileMenu ? t("navigation.closeMenu") : t("navigation.openMenu")}
          >
            <span className="text-lg">{showMobileMenu ? "✕" : "☰"}</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${linkClass(link.href)}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Policies dropdown */}
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
                aria-haspopup="true"
                aria-expanded={showPoliciesMenu ? "true" : "false"}
              >
                {t("navigation.policies")}
                <span aria-hidden className="text-xs">▾</span>
              </button>
              {showPoliciesMenu && (
                <div className="absolute start-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-10">
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

            {/* Member counter */}
            <div
              className={`hidden lg:flex px-3 py-1.5 rounded-pill border text-xs font-semibold ${
                isHomePage && !scrolled
                  ? "bg-white/10 border-white/20 text-white backdrop-blur-sm"
                  : "bg-gold-50 border-gold-200 text-gold-700"
              }`}
            >
              {t("subscription.counter", { count: activeMembers.toLocaleString() })}
            </div>

            {/* Locale switcher — preserves current path */}
            <Link
              href={localizedPath}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHomePage && !scrolled
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {otherLocale.toUpperCase()}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
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
                  <div className="absolute end-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
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
                      {t("navigation.viewProfile")}
                    </Link>
                    <Link
                      href={`/${locale}/messages`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {t("navigation.messages")}
                    </Link>
                    <hr className="my-2" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t("navigation.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 start-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <Image
                    src="/assets/logo-golden.png"
                    alt={t("siteName")}
                    width={150}
                    height={50}
                    className="h-10 w-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMobileMenu(false)}
                    className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label={t("navigation.closeMenu")}
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                {user && (
                  <div className="pb-4 border-b border-gray-200">
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="min-h-11 min-w-11 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-semibold text-lg">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </div>
                        <div className="text-sm text-gray-500">{t("navigation.viewProfile")}</div>
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="mt-2 flex items-center gap-2 px-4 py-3 bg-gold-50 rounded-lg text-gold-700 font-semibold hover:bg-gold-100 transition-colors text-base min-h-11"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span>⚡</span>
                        <span>{t("navigation.adminDashboard")}</span>
                      </Link>
                    )}
                  </div>
                )}

                <nav className="space-y-1" role="navigation">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors min-h-11 ${
                        isActive(link.href)
                          ? "bg-gold-50 text-gold-700 font-semibold"
                          : "text-gray-700 hover:bg-gold-50 hover:text-gold-700"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="space-y-1 ps-4 border-s-2 border-gray-200 ms-4">
                    <Link
                      href={`/${locale}/return-refund`}
                      className="block px-4 py-3 text-base text-gray-600 hover:bg-gold-50 hover:text-gold-700 rounded-lg transition-colors min-h-11"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t("navigation.returnRefund")}
                    </Link>
                    <Link
                      href={`/${locale}/shipping-service`}
                      className="block px-4 py-3 text-base text-gray-600 hover:bg-gold-50 hover:text-gold-700 rounded-lg transition-colors min-h-11"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t("navigation.shippingService")}
                    </Link>
                  </div>
                </nav>

                <div className="px-4 py-3 rounded-lg bg-gold-50 border border-gold-200">
                  <span className="text-base font-semibold text-gold-700">
                    {t("subscription.counter", { count: activeMembers.toLocaleString() })}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    href={localizedPath}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors min-h-11"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span>🌐</span>
                    <span>{otherLocale === "en" ? "English" : "Urdu"}</span>
                  </Link>

                  {user ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSignOut();
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-base font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-11"
                    >
                      {t("navigation.signOut")}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href={`/${locale}/auth/signin`}
                        className="flex items-center justify-center px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-h-11"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {t("navigation.signIn")}
                      </Link>
                      <Link
                        href={`/${locale}/auth/signup`}
                        className="flex items-center justify-center px-4 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold text-base shadow-lg transition-all hover:shadow-xl min-h-11"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {t("navigation.signUp")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.nav>
  );
}
