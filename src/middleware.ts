import {
  getReferralCookieOptions,
  REFERRAL_COOKIE_NAME,
  sanitizeReferralCode,
} from "@/lib/bureau/referral-cookie";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ur"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const refParam = request.nextUrl.searchParams.get("ref");
  if (refParam) {
    const sanitized = sanitizeReferralCode(refParam);
    if (sanitized) {
      response.cookies.set(
        REFERRAL_COOKIE_NAME,
        sanitized,
        getReferralCookieOptions()
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(ur|en)/:path*"],
};
