import { generateUniqueReferralCode } from "@/lib/bureau/generate-referral-code";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface RegisterBody {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  payment_receipt_path?: string;
  experience_years?: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: RegisterBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const name = body.name?.trim();
    const city = body.city?.trim();
    const address = body.address?.trim();
    const phone = body.phone?.trim();
    const email = body.email?.trim();
    const licenseNumber = body.license_number?.trim();

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(city) ||
      !isNonEmptyString(address) ||
      !isNonEmptyString(phone) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(licenseNumber)
    ) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const service = createServiceClient();
    const referralCode = await generateUniqueReferralCode(city, name);

    const { data: inserted, error: insertError } = await service
      .from("marriage_bureaus")
      .insert({
        owner_id: user.id,
        name,
        city,
        address,
        phone,
        email,
        license_number: licenseNumber,
        referral_code: referralCode,
        is_approved: false,
        status: "pending",
        commission_type: "percentage",
        commission_rate: 0.2,
        verified: false,
        payment_receipt_url: body.payment_receipt_path ?? null,
      })
      .select("id, referral_code")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Duplicate license" }, { status: 409 });
      }
      throw new Error(
        `[bureau/register] marriage_bureaus insert failed: ${insertError.message}`
      );
    }

    const experienceNote =
      typeof body.experience_years === "number" && body.experience_years >= 0
        ? ` Approx. ${body.experience_years} member references.`
        : "";

    const { error: notificationError } = await service
      .from("bureau_notifications")
      .insert({
        bureau_id: inserted.id,
        type: "registration",
        message: `New bureau registration: ${name} (${city}).${experienceNote}`,
      });

    if (notificationError) {
      console.error(
        "[bureau/register] bureau_notifications insert failed:",
        notificationError.message
      );
    }

    return NextResponse.json(
      {
        bureauId: inserted.id,
        referralCode: inserted.referral_code,
        status: "pending",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[bureau/register]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
