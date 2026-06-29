import {
  approveManualPaymentNotification,
  rejectManualPaymentNotification,
} from "@/lib/billing/approve-manual-payment";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: { notificationId?: string; action?: "approve" | "reject" };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const notificationId = body.notificationId;
    if (!notificationId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const action = body.action ?? "approve";

    if (action === "approve") {
      await approveManualPaymentNotification(notificationId, user.id);
    } else if (action === "reject") {
      await rejectManualPaymentNotification(notificationId, user.id);
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/approve-manual-payment]", error);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
