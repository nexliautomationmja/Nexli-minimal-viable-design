import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/lib/webhook-auth";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable." },
        { status: 503 }
      );
    }

    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .limit(1);

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found." },
        { status: 404 }
      );
    }

    // Update lifecycle timestamp
    await db
      .update(leads)
      .set({
        bookedCallAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, lead.id));

    // Fire CAPI BookedCall event
    const eventId = `bc.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
    await sendCAPIEvent({
      event_name: "BookedCall",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "system_generated",
      event_source_url: lead.landingPage || "https://www.nexli.net",
      user_data: {
        em: lead.email || undefined,
        ph: lead.phone || undefined,
        fn: lead.firstName || undefined,
        ln: lead.lastName || undefined,
        fbp: lead.fbp || undefined,
        fbc: lead.fbc || undefined,
        client_ip_address: lead.ipAddress !== "unknown" ? (lead.ipAddress || undefined) : undefined,
        client_user_agent: lead.userAgent || undefined,
      },
      custom_data: {
        content_name: "Booked Call",
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Meta Webhook] BookedCall error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
