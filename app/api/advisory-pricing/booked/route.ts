import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { verifyDemoToken } from "@/lib/demo-session";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { TAG_CALL_BOOKED } from "@/lib/demo-config";
import {
  ADVISORY_CALL_PATH,
  ADVISORY_PRODUCT_NAME,
  TAG_ADVISORY_BUYER,
  TAG_ADVISORY_OPT_IN,
  TAG_ADVISORY_QUALIFIED,
} from "@/lib/advisory-config";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// Must stay identical to the scheduleContentName the client sends, or the
// CAPI event stops deduping against the browser pixel and every booking
// counts twice in Meta. Both live in app/advisory-pricing/call/.
const BOOKING_CONTENT_NAME = "Advisory Engine Growth Call";

/**
 * Records a growth call booked from /advisory-pricing/call.
 *
 * Auth is the signed lead cookie, plus the one server-side check the page
 * also makes: the qualifier must have returned 'agency'. The cookie is shared
 * with the demo funnel, so on its own it proves identity, not entitlement.
 *
 * The purchase is deliberately NOT a condition — the $297 is the downsell for
 * firms that miss the bar, so most legitimate bookers have paid nothing.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`advisory-booked:${ip}`, 10, 15 * 60 * 1000);
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
        console.error("[Advisory Booked] lead lookup failed:", err);
      }

      // Re-checked here, not just on the page: a valid cookie is not an
      // entitlement, and a direct POST must not be able to book past the bar.
      //
      // The purchase is deliberately NOT checked — the $297 is the downsell
      // for firms that miss the bar, so most legitimate bookers have bought
      // nothing. Clearing the qualifier is the whole entitlement, and a
      // missing row fails closed because funnelPath cannot then be 'agency'.
      if (lead?.funnelPath !== "agency") {
        return NextResponse.json({ error: "Not eligible to book." }, { status: 403 });
      }
      try {
        await db
          .update(leads)
          .set({ bookedCallAt: new Date(), updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      } catch (err) {
        console.error("[Advisory Booked] DB update failed:", err);
      }
    }

    if (eventId) {
      sendCAPIEvent({
        event_name: "Schedule",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: `${SITE_URL}${ADVISORY_CALL_PATH}`,
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
        source: `${ADVISORY_PRODUCT_NAME} - Growth Call Booking`,
        // Milestones accumulate: a booked firm keeps 'advisory qualified' and
        // gains 'call booked'. The buyer tag goes on buyers only — almost
        // everyone booking now has paid nothing, and marking them customers
        // would misreport them and drop them out of the pre-purchase
        // sequences.
        tags: [
          ...(lead.advisoryPurchasedAt ? [TAG_ADVISORY_BUYER] : []),
          TAG_ADVISORY_QUALIFIED,
          TAG_CALL_BOOKED,
        ],
        // Belt and braces. The qualifier already strips this, but a booking
        // cannot coexist with "opted in and done nothing since" under any
        // ordering, including a contact that predates that change.
        removeTags: [TAG_ADVISORY_OPT_IN],
        answers: {
          usBased: lead.usBased ?? null,
          decisionRole: lead.decisionRole ?? null,
          goal: lead.goal ?? null,
          goalTag: lead.goalTag ?? null,
          problemDuration: lead.problemDuration ?? null,
          annualRevenue: lead.annualRevenue ?? null,
          taxSavings: lead.taxSavings ?? null,
          taxSavingsTag: lead.taxSavingsTag ?? null,
          budget: lead.budget ?? null,
        },
        leadScore: lead.leadScore,
        funnelPath: "agency",
        noteHeading: lead.advisoryPurchasedAt
          ? "Booked the growth call (Accelerator buyer)"
          : "Booked the growth call",
        extraNoteLines: [
          `Booking uid: ${bookingUid || "n/a"}`,
          `Call start: ${startTime || "n/a"}`,
        ],
      });
    }

    const webhook =
      process.env.GHL_ADVISORY_BOOKING_WEBHOOK_URL || process.env.GHL_QUALIFICATION_WEBHOOK_URL;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "advisory-growth-call-booking",
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
      console.warn("[Advisory Booked] no GHL booking webhook configured — skipping GHL webhook");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Advisory Booked] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
