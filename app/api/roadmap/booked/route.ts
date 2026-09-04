import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import {
  isCheckoutSessionId,
  isPaidRoadmapSession,
  retrieveCheckoutSession,
} from "@/lib/stripe";
import { getSiteUrl, ROADMAP_THANK_YOU_PATH } from "@/lib/roadmap-config";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Called by the roadmap thank-you page when the inline Cal.com embed reports
 * a successful booking. The paid Stripe session id doubles as authentication.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`roadmap-booked:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const sessionId = body.session_id;
    const eventId = typeof body.event_id === "string" ? body.event_id.slice(0, 100) : null;
    const bookingUid = typeof body.booking_uid === "string" ? body.booking_uid.slice(0, 200) : "";
    const startTime = typeof body.start_time === "string" ? body.start_time.slice(0, 100) : "";

    if (!isCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }

    const session = await retrieveCheckoutSession(sessionId).catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 403 });
    }
    if (!isPaidRoadmapSession(session)) {
      return NextResponse.json({ error: "Session not paid." }, { status: 403 });
    }

    const m = session.metadata || {};
    const email = (m.email || session.customer_details?.email || "").trim().toLowerCase();
    const firstName = m.first_name || "";
    const lastName = m.last_name || "";
    const phone = m.phone || "";
    const userAgent = req.headers.get("user-agent") || "";

    const db = getDb();
    if (db) {
      try {
        if (m.lead_id && UUID_RE.test(m.lead_id)) {
          await db
            .update(leads)
            .set({ bookedCallAt: new Date(), updatedAt: new Date() })
            .where(eq(leads.id, m.lead_id));
        } else if (email) {
          await db
            .update(leads)
            .set({ bookedCallAt: new Date(), updatedAt: new Date() })
            .where(eq(leads.email, email));
        }
      } catch (err) {
        console.error("[Roadmap Booked] DB update failed:", err);
      }
    }

    if (eventId) {
      sendCAPIEvent({
        event_name: "Schedule",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: `${getSiteUrl()}${ROADMAP_THANK_YOU_PATH}`,
        user_data: {
          em: email || undefined,
          ph: phone || undefined,
          fn: firstName || undefined,
          ln: lastName || undefined,
          fbp: m.fbp || undefined,
          fbc: m.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: "Roadmap Buyer Strategy Call",
          content_category: "Booking",
        },
      }).catch(() => {});
    }

    const bookingWebhook =
      process.env.GHL_ROADMAP_BOOKING_WEBHOOK_URL ||
      process.env.GHL_QUALIFICATION_WEBHOOK_URL;
    if (bookingWebhook) {
      fetch(bookingWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          source: "roadmap-buyer-booking",
          qualified: true,
          tag: "roadmap-call-booked",
          booking_uid: bookingUid,
          booking_start: startTime,
          stripe_session_id: session.id,
          submitted_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Roadmap Booked] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
