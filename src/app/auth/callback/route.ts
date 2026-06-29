import { attributeReferralForUser } from "@/lib/bureau/attribute-referral";
import {
  getReferralCookieClearOptions,
  REFERRAL_COOKIE_NAME,
} from "@/lib/bureau/referral-cookie";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveRedirectPath(
  nextParam: string | null,
  origin: string
): string {
  if (!nextParam || !nextParam.startsWith("/")) {
    return `${origin}/en/discover`;
  }
  if (nextParam.startsWith("http://") || nextParam.startsWith("https://")) {
    return `${origin}/en/discover`;
  }
  return `${origin}${nextParam}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] exchangeCodeForSession failed", exchangeError);
      return NextResponse.redirect(`${origin}/en/auth/signin`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const cookieStore = await cookies();
      const refCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;

      if (refCode) {
        try {
          await attributeReferralForUser(user.id, refCode);
        } catch (error) {
          console.error("[auth/callback] referral attribution failed", error);
        }
        cookieStore.set(REFERRAL_COOKIE_NAME, "", getReferralCookieClearOptions());
      }
    }
  }

  return NextResponse.redirect(resolveRedirectPath(next, origin));
}
