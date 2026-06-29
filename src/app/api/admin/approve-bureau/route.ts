import { generateUniqueReferralCode } from "@/lib/bureau/generate-referral-code";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { CommissionType } from "@/types/bureau.types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface ApproveBureauBody {
  bureauId?: string;
  action?: "approve" | "reject";
  commissionType?: CommissionType;
  commissionRate?: number;
}

function isCommissionType(value: unknown): value is CommissionType {
  return value === "flat" || value === "percentage";
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

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: ApproveBureauBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const bureauId = body.bureauId;
    if (!bureauId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const action = body.action ?? "approve";
    const service = createServiceClient();

    const { data: bureau, error: fetchError } = await service
      .from("marriage_bureaus")
      .select("id, name, city, referral_code")
      .eq("id", bureauId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(
        `[admin/approve-bureau] bureau fetch failed: ${fetchError.message}`
      );
    }

    if (!bureau) {
      return NextResponse.json({ error: "Bureau not found" }, { status: 404 });
    }

    if (action === "reject") {
      const { error: rejectError } = await service
        .from("marriage_bureaus")
        .update({
          is_approved: false,
          status: "rejected",
          verified: false,
        })
        .eq("id", bureauId);

      if (rejectError) {
        throw new Error(
          `[admin/approve-bureau] reject failed: ${rejectError.message}`
        );
      }

      return NextResponse.json({
        bureauId,
        isApproved: false,
        status: "rejected",
      });
    }

    if (action !== "approve") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const commissionType = body.commissionType;
    const commissionRate = body.commissionRate;

    if (!isCommissionType(commissionType)) {
      return NextResponse.json({ error: "Invalid commission" }, { status: 400 });
    }

    if (
      typeof commissionRate !== "number" ||
      !Number.isFinite(commissionRate) ||
      commissionRate <= 0
    ) {
      return NextResponse.json({ error: "Invalid commission" }, { status: 400 });
    }

    let referralCode = bureau.referral_code;
    if (!referralCode) {
      referralCode = await generateUniqueReferralCode(bureau.city, bureau.name);
    }

    const { error: approveError } = await service
      .from("marriage_bureaus")
      .update({
        is_approved: true,
        status: "approved",
        verified: true,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        commission_type: commissionType,
        commission_rate: commissionRate,
        referral_code: referralCode,
        licensed_at: new Date().toISOString(),
      })
      .eq("id", bureauId);

    if (approveError) {
      throw new Error(
        `[admin/approve-bureau] approve failed: ${approveError.message}`
      );
    }

    return NextResponse.json({
      bureauId,
      isApproved: true,
      status: "approved",
      referralCode,
    });
  } catch (error) {
    console.error("[admin/approve-bureau]", error);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
