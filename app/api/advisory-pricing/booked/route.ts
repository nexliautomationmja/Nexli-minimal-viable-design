import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { verifyDemoToken, verifyRebookToken } from "@/lib/demo-session";
import { recordAdvisoryBooking } from "@/lib/advisory-booking";
import { ADVISORY_CALL_PATH, isVslAngle } from "@/lib/advisory-config";

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
 * The purchase is deliberately NOT a condition — the $97 is the downsell for
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
    // The session cookie, or the two-hour rebook pass /book issues to a
    // qualified firm that typed its email on a browser we did not know
    // (lib/demo-session). Either only names the lead; the funnelPath check
    // below is still the entitlement.
    const token = typeof body?.lead_token === "string" ? body.lead_token : null;
    const leadId = (await verifyDemoToken(token)) ?? (await verifyRebookToken(token));
    if (!leadId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 403 });
    }

    const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;
    const bookingUid = typeof body?.booking_uid === "string" ? body.booking_uid.slice(0, 200) : "";
    const startTime = typeof body?.start_time === "string" ? body.start_time.slice(0, 100) : "";
    // The attendee's IANA zone, captured in their browser at booking time.
    // Untrusted, so formatBookingStart validates it and falls back to
    // Eastern rather than throwing.
    const attendeeTimezone =
      typeof body?.attendee_timezone === "string" ? body?.attendee_timezone.slice(0, 64) : "";
    /**
     * Which VSL's calendar they booked on, sent by /<angle>/call.
     *
     * The qualifier already tagged the contact with it, but that write is a
     * separate request: if it failed, or the contact was created some other
     * way, a booked firm would arrive with no VSL tag. Re-applying it here
     * costs nothing (GHL tags are idempotent) and closes that gap.
     *
     * Untrusted, so only one of the four known angles counts.
     */
    const rawAngle = typeof body?.angle === "string" ? body.angle.trim().toLowerCase() : "";
    const angle = isVslAngle(rawAngle) ? rawAngle : null;
    const userAgent = req.headers.get("user-agent") || "";

    const db = getDb();
    let lead: typeof leads.$inferSelect | null = null;
    /**
     * Booked before (Marcel, 2026-11-16): a no-show or a reschedule, usually
     * from /book after retargeting. Read before bookedCallAt is overwritten.
     * Cal gets a NEW booking, not a moved one (no booking uid is stored
     * here), so an earlier booking may still be on the calendar; the GHL
     * note says so. Workflow 3 runs off this webhook, not the tag, so the
     * confirmation and reminders go out again for the new time.
     */
    let rebooked = false;
    if (db) {
      try {
        [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      } catch (err) {
        console.error("[Advisory Booked] lead lookup failed:", err);
      }

      // Re-checked here, not just on the page: a valid cookie is not an
      // entitlement, and a direct POST must not be able to book past the bar.
      //
      // The purchase is deliberately NOT checked — the $97 is the downsell
      // for firms that miss the bar, so most legitimate bookers have bought
      // nothing. Clearing the qualifier is the whole entitlement, and a
      // missing row fails closed because funnelPath cannot then be 'agency'.
      if (lead?.funnelPath !== "agency") {
        return NextResponse.json({ error: "Not eligible to book." }, { status: 403 });
      }
      rebooked = Boolean(lead.bookedCallAt);
      try {
        await db
          .update(leads)
          .set({ bookedCallAt: new Date(), updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      } catch (err) {
        console.error("[Advisory Booked] DB update failed:", err);
      }
    }

    // Meta, GoHighLevel and the booking webhook: shared with the VSL
    // calendar's webhook (app/api/cal/booking) so the two cannot drift.
    await recordAdvisoryBooking({
      leadId,
      lead,
      rebooked,
      bookingUid,
      startTime,
      attendeeTimezone,
      angle,
      ip,
      userAgent,
      capiEvents: eventId ? [{ name: "Schedule", eventId }] : [],
      contentName: BOOKING_CONTENT_NAME,
      sourcePath: ADVISORY_CALL_PATH,
      via: "qualified",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Advisory Booked] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
