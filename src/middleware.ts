import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ur'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Redirect to locale if no prefix
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ur|en)/:path*']
};
