import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { upsertLeadByEmail } from "@/lib/lead-upsert";
import { recordAdvisoryBooking, recordBookingCancellation } from "@/lib/advisory-booking";
import { parseCalBooking, verifyCalSignature } from "@/lib/cal-webhook";
import { EMAIL_RE } from "@/lib/contact-validation";
import { isVslAngle, VSL_BOOKING_FORM_SOURCE } from "@/lib/advisory-config";
import { VSL_BOOKING_CONTENT_NAME } from "@/lib/demo-config";

export const runtime = "nodejs";

/**
 * Cal.com's webhook for the VSLs' calendar (Marcel, 2026-11-19).
 *
 * The four VSLs embed the "CPA Acquisition Review" event type under their
 * pricing (components/funnel/VslBooking). Nobody on those pages has a lead
 * row or a session cookie, so the browser cannot authenticate a booking
 * the way the /call pages do, and an open endpoint would let anyone write
 * bookings into GoHighLevel. Cal's signed webhook is the record instead.
 *
 * SET UP IN CAL, ON THAT EVENT TYPE (Event type > Webhooks):
 *   Subscriber URL  https://www.nexli.net/api/cal/booking
 *   Triggers        Booking created, Booking rescheduled, Booking cancelled
 *   Secret          the value of CAL_WEBHOOK_SECRET (Vercel and .env.local)
 * Scoped to the event type, not the account, so nexli-demo bookings (which
 * /api/advisory-pricing/booked records) never arrive here twice.
 *
 * What it does with a booking:
 *   - upserts the lead row by email, writing only the fields Cal gave
 *     (lead-upsert's `sparse`), plus the website, funnelPath 'agency' (the
 *     booking is the bar now, so /book and the resume links work for them)
 *     and bookedCallAt;
 *   - reports it through recordAdvisoryBooking, the same code the /call
 *     pages use: CAPI Schedule + Lead with the pixel's event ids from the
 *     booking's metadata, the GHL contact with its booking tags, and the
 *     booking webhook that runs workflow 3 (confirmation and reminders).
 *
 * A RESCHEDULE (Booking rescheduled) is the same call at a new time: Cal
 * cancels the old slot itself. It goes through the same path with
 * rebooked and rescheduled set, so the contact's booking_start moves and
 * the GHL booking webhook fires again (workflow 3 re-sends the confirmation
 * and reminders for the new time). No Meta events: it is not a new lead.
 *
 * A CANCELLATION (Booking cancelled, added 2026-11-19) stops the reminders:
 * see handleCancellation below.
 *
 * Replies 200 to anything it chose to ignore (a ping, another trigger, a
 * booking with no email), so Cal does not retry it; 401 to a bad signature.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Cal Booking] CAL_WEBHOOK_SECRET is not set — refusing the webhook");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifyCalSignature(raw, req.headers.get("x-cal-signature-256") || "", secret)) {
    return NextResponse.json({ error: "Bad signature." }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON." }, { status: 400 });
  }

  // Cal's "Ping test" button, and any trigger this route is not for.
  const trigger = typeof body?.triggerEvent === "string" ? body.triggerEvent : "";
  if (trigger === "BOOKING_CANCELLED") return handleCancellation(body.payload);
  if (trigger !== "BOOKING_CREATED" && trigger !== "BOOKING_RESCHEDULED") {
    return NextResponse.json({ ok: true, ignored: trigger || "no trigger" });
  }
  const rescheduled = trigger === "BOOKING_RESCHEDULED";

  const booking = parseCalBooking(body.payload);
  if (!EMAIL_RE.test(booking.email)) {
    console.warn("[Cal Booking] booking without a usable email, uid:", booking.uid || "n/a");
    return NextResponse.json({ ok: true, ignored: "no email" });
  }

  const meta = booking.metadata;
  const angle = isVslAngle(meta.angle) ? meta.angle : null;
  // Cal's own request, so the visitor's IP is unknown here, and the request's
  // user agent is Cal's server, which Meta must not get as the visitor's.
  // The visitor's own comes in the metadata (VslBooking, from 2026-11-20):
  // Meta needs it for a website event, and the GHL pipeline's QualifiedLead
  // reads it back from the lead row.
  const ip = "unknown";
  const userAgent = meta.user_agent || "";

  const db = getDb();
  if (!db) {
    console.error("[Cal Booking] no database — booking not recorded, uid:", booking.uid);
    return NextResponse.json({ error: "No database." }, { status: 503 });
  }

  const upserted = await upsertLeadByEmail({
    db,
    contact: {
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      firmName: "",
      marketingSmsOptIn: booking.smsConsent,
    },
    formSource: VSL_BOOKING_FORM_SOURCE,
    attribution: {
      utm_source: meta.utm_source,
      utm_medium: meta.utm_medium,
      utm_campaign: meta.utm_campaign,
      utm_term: meta.utm_term,
      utm_content: meta.utm_content,
      fbclid: meta.fbclid,
      fbp: meta.fbp,
      fbc: meta.fbc,
      landing_page: meta.landing_page,
    },
    ip,
    userAgent,
    logTag: "Cal Booking",
    sparse: true,
  });
  const leadId = upserted.leadId;
  if (!leadId) {
    return NextResponse.json({ error: "Could not save the booking." }, { status: 500 });
  }
  // Booked before: a no-show or a reschedule, read before it is overwritten.
  // A Cal reschedule always counts, even if the first booking never made it
  // into the database.
  const rebooked = rescheduled || Boolean(upserted.lead?.bookedCallAt);

  let lead: typeof leads.$inferSelect | null = null;
  try {
    await db
      .update(leads)
      .set({
        ...(booking.website ? { websiteUrl: booking.website } : {}),
        // upsert only writes it on a new row; an existing one gets it here.
        ...(userAgent ? { userAgent } : {}),
        funnelPath: "agency",
        bookedCallAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));
    [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  } catch (err) {
    console.error("[Cal Booking] lead update failed:", err);
  }

  await recordAdvisoryBooking({
    leadId,
    lead,
    rebooked,
    bookingUid: booking.uid,
    startTime: booking.startTime,
    attendeeTimezone: booking.timeZone,
    angle,
    ip,
    userAgent,
    // The ids the pixel used in the browser, so Meta keeps one of each.
    // None for a reschedule: Meta already has this booking and this lead.
    capiEvents: rescheduled
      ? []
      : [
          { name: "Schedule", eventId: meta.schedule_event_id || `vsl_schedule_${booking.uid || leadId}` },
          { name: "Lead", eventId: meta.lead_event_id || `vsl_lead_${booking.uid || leadId}` },
        ],
    contentName: VSL_BOOKING_CONTENT_NAME,
    sourcePath: `/${angle ?? "agency"}`,
    via: "vsl-calendar",
    rescheduled,
    previousStartTime: booking.previousStartTime,
    fbp: meta.fbp || null,
    fbc: meta.fbc || null,
    website: booking.website || null,
    smsConsent: booking.smsConsent,
    notes: booking.notes || null,
  });

  return NextResponse.json({ ok: true });
}

/**
 * Booking cancelled (Marcel ticked it on the webhook, 2026-11-19). Cal has
 * already freed the slot and emailed the attendee. Left alone, GoHighLevel
 * would keep sending reminders for a call that no longer exists, so:
 *
 *   - the lead row's bookedCallAt is cleared: they have no call booked, the
 *     portal stops showing one, and a booking after this is a fresh booking
 *     rather than a "rebooked" one with a note to cancel the old slot;
 *   - recordBookingCancellation tags the GHL contact 'booking cancelled' and
 *     takes 'advisory booked' and 'call booked' off. GoHighLevel's workflow
 *     on that tag removes them from the reminder workflows.
 *
 * A reschedule is not a cancellation: Cal sends Booking rescheduled for it.
 *
 * ONE KNOWN EDGE: someone holding two bookings who cancels one of them is
 * treated as having no call. The GHL note says which call was cancelled and
 * to add 'advisory booked' back if they still have one.
 *
 * Always 200 once the signature has passed, so Cal does not retry it; a GHL
 * failure is logged by ghl-sync, not reported to Cal.
 */
async function handleCancellation(payload: unknown) {
  const booking = parseCalBooking(payload);
  if (!EMAIL_RE.test(booking.email)) {
    console.warn("[Cal Booking] cancellation without a usable email, uid:", booking.uid || "n/a");
    return NextResponse.json({ ok: true, ignored: "no email" });
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(leads)
        .set({ bookedCallAt: null, updatedAt: new Date() })
        .where(sql`lower(${leads.email}) = ${booking.email}`);
    } catch (err) {
      console.error("[Cal Booking] clearing bookedCallAt failed:", err);
    }
  } else {
    console.error("[Cal Booking] no database — cancellation not recorded on the lead, uid:", booking.uid);
  }

  await recordBookingCancellation(booking);
  return NextResponse.json({ ok: true, cancelled: true });
}
