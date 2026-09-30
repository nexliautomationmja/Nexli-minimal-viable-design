import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { verifyDemoToken } from "@/lib/demo-session";
import { syncContactToGhl } from "@/lib/ghl-sync";
import {
  DEMO_CALL_PATH,
  TAG_AGENCY_PITCH,
  TAG_CALL_BOOKED,
  TAG_DEMO_OPT_IN,
} from "@/lib/demo-config";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

const BOOKING_CONTENT_NAME = "Advisory Engine Growth Call";

/**
 * Called by the inline Cal.com embed on /demo/call when a growth call is
 * booked. The signed demo lead cookie, posted back as `lead_token`, is the
 * credential — there is no payment on this path.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`demo-booked:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const leadId = await verifyDemoToken(
      typeof body?.lead_token === "string" ? body.lead_token : null,
    );
    if (!leadId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 403 });
    }

    const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;
    const bookingUid = typeof body?.booking_uid === "string" ? body.booking_uid.slice(0, 200) : "";
    const startTime = typeof body?.start_time === "string" ? body.start_time.slice(0, 100) : "";
    const userAgent = req.headers.get("user-agent") || "";

    const db = getDb();
    let lead: typeof leads.$inferSelect | null = null;
    if (db) {
      try {
        [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      } catch (err) {
        console.error("[Demo Booked] lead lookup failed:", err);
      }
      try {
        await db
          .update(leads)
          .set({ bookedCallAt: new Date(), updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      } catch (err) {
        console.error("[Demo Booked] DB update failed:", err);
      }
    }

    if (eventId) {
      sendCAPIEvent({
        event_name: "Schedule",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: `${SITE_URL}${DEMO_CALL_PATH}`,
        user_data: {
          em: lead?.email || undefined,
          ph: lead?.phone || undefined,
          fn: lead?.firstName || undefined,
          ln: lead?.lastName || undefined,
          fbp: lead?.fbp || undefined,
          fbc: lead?.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: BOOKING_CONTENT_NAME,
          content_category: "Booking",
          funnel_path: "agency",
        },
      }).catch(() => {});
    }

    if (lead?.email) {
      await syncContactToGhl({
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        firmName: lead.firmName,
        websiteUrl: lead.websiteUrl,
        source: "Nexli Demo - Growth Call Booking",
        tags: [TAG_DEMO_OPT_IN, TAG_AGENCY_PITCH, TAG_CALL_BOOKED],
        answers: {
          usBased: lead.usBased ?? null,
          decisionRole: lead.decisionRole ?? null,
          goal: lead.goal ?? null,
          goalTag: lead.goalTag ?? null,
          problemDuration: lead.problemDuration ?? null,
          annualRevenue: lead.annualRevenue ?? null,
          taxSavings: lead.taxSavings ?? null,
          taxSavingsTag: lead.taxSavingsTag ?? null,
        },
        leadScore: lead.leadScore,
        funnelPath: "agency",
        noteHeading: "Booked the advisory engine growth call",
        extraNoteLines: [
          `Booking uid: ${bookingUid || "n/a"}`,
          `Call start: ${startTime || "n/a"}`,
        ],
      });
    }

    const webhook =
      process.env.GHL_DEMO_BOOKING_WEBHOOK_URL || process.env.GHL_QUALIFICATION_WEBHOOK_URL;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "demo-growth-call-booking",
          tag: TAG_CALL_BOOKED,
          funnel_path: "agency",
          qualified: true,
          lead_id: leadId,
          firstName: lead?.firstName || "",
          lastName: lead?.lastName || "",
          email: lead?.email || "",
          phone: lead?.phone || "",
          firm_name: lead?.firmName || "",
          booking_uid: bookingUid,
          booking_start: startTime,
          submitted_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    } else {
      console.warn("[Demo Booked] no GHL booking webhook configured — skipping GHL webhook");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Demo Booked] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
