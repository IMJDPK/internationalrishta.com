import { attributeReferralForUser } from "@/lib/bureau/attribute-referral";
import {
  getReferralCookieClearOptions,
  REFERRAL_COOKIE_NAME,
} from "@/lib/bureau/referral-cookie";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const refCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;

    if (!refCode) {
      return NextResponse.json({ attributed: false, reason: "no_cookie" });
    }

    const result = await attributeReferralForUser(user.id, refCode);

    if (result.attributed || result.reason === "invalid_code") {
      cookieStore.set(REFERRAL_COOKIE_NAME, "", getReferralCookieClearOptions());
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[referral/attribute] error", error);
    return NextResponse.json(
      { error: "Attribution failed" },
      { status: 500 }
    );
  }
}
