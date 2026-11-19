// ---------------------------------------------------------------------------
// What happens once a growth call is booked: Meta, GoHighLevel, the booking
// webhook. Shared by the two places a booking is recorded:
//
//   app/api/advisory-pricing/booked   the /call pages, /book and
//                                     /accelerator/next: a firm that cleared
//                                     the qualifier, posted from the browser
//                                     with its signed lead cookie.
//   app/api/cal/booking               the VSLs' own calendar (Marcel,
//                                     2026-11-19): no qualifier, recorded
//                                     from Cal's signed webhook.
//
// One function so the two cannot drift: the GHL booking webhook (workflow 3,
// the confirmation and reminders) gets the same payload shape from both,
// the contact gets booking_start and candor_url the same way, and the resume
// link points at the same page.
//
// The caller has already found or written the lead row and stamped
// bookedCallAt; this only reports the booking outward.
// ---------------------------------------------------------------------------

import { formatBookingStart } from '@/lib/booking-time';
import { sendCAPIEvent } from '@/lib/meta-capi';
import { createDemoToken } from '@/lib/demo-session';
import { syncContactToGhl } from '@/lib/ghl-sync';
import { BOOKING_CONFIRMED_B_PATH, TAG_CALL_BOOKED } from '@/lib/demo-config';
import {
  ADVISORY_PRODUCT_NAME,
  TAG_ADVISORY_BOOKED,
  TAG_ADVISORY_BUYER,
  TAG_ADVISORY_OPT_IN,
  TAG_ADVISORY_QUALIFIED,
  TAG_QUALIFIED_VSL,
  TAG_VSL_BOOKING,
  vslTag,
  type VslAngle,
} from '@/lib/advisory-config';
import type { leads } from '@/lib/leads-schema';
import { SITE_URL } from '@/lib/site';

type LeadRow = typeof leads.$inferSelect;

export interface AdvisoryBooking {
  leadId: string;
  /** The row as it stands after the caller's writes; null if the DB is down. */
  lead: LeadRow | null;
  /** They had booked before: a no-show or a reschedule. */
  rebooked: boolean;
  /**
   * Cal moved this booking (BOOKING_RESCHEDULED on the VSL calendar): same
   * call, new time. Cal has already cancelled the old slot, so the note does
   * not ask anyone to, and the caller sends no Meta events for it.
   */
  rescheduled?: boolean;
  /** Where a rescheduled call used to be, Cal's ISO instant; '' if unknown. */
  previousStartTime?: string;
  bookingUid: string;
  /** Cal's ISO instant, kept raw for GHL's date logic. */
  startTime: string;
  /** The attendee's IANA zone, untrusted; formatBookingStart validates it. */
  attendeeTimezone: string;
  angle: VslAngle | null;
  ip: string;
  userAgent: string;
  /** CAPI events to send, each with the pixel's event id when there is one. */
  capiEvents: Array<{ name: 'Schedule' | 'Lead'; eventId: string }>;
  /** content_name for CAPI. Must match the pixel's, or they stop deduping. */
  contentName: string;
  /** The page the booking happened on, for event_source_url. */
  sourcePath: string;
  /**
   * How they got to the calendar:
   *   'qualified'      cleared the five-step qualifier (the /call pages).
   *   'vsl-calendar'   booked on a VSL's own calendar, nothing asked first.
   */
  via: 'qualified' | 'vsl-calendar';
  /** Browser identifiers from the booking itself, used when the row has none. */
  fbp?: string | null;
  fbc?: string | null;
  /** Cal form answers on the VSL calendar. */
  website?: string | null;
  smsConsent?: boolean | null;
  notes?: string | null;
}

export async function recordAdvisoryBooking(b: AdvisoryBooking): Promise<void> {
  const { lead, leadId, rebooked, startTime, bookingUid, angle } = b;
  const angleTag = vslTag(angle);
  const direct = b.via === 'vsl-calendar';
  // Cal's ISO instant is kept as-is for GHL's date filters and wait steps;
  // this is the one that goes in an email. '' when there is no usable
  // timestamp, so a template can fall back to the raw value.
  const startTimeDisplay = formatBookingStart(startTime, b.attendeeTimezone);

  for (const ev of b.capiEvents) {
    if (!ev.eventId) continue;
    sendCAPIEvent({
      event_name: ev.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      action_source: 'website',
      event_source_url: `${SITE_URL}${b.sourcePath}`,
      user_data: {
        em: lead?.email || undefined,
        ph: lead?.phone || undefined,
        fn: lead?.firstName || undefined,
        ln: lead?.lastName || undefined,
        fbp: lead?.fbp || b.fbp || undefined,
        fbc: lead?.fbc || b.fbc || undefined,
        client_ip_address: b.ip !== 'unknown' && b.ip ? b.ip : undefined,
        client_user_agent: b.userAgent || undefined,
      },
      custom_data: {
        content_name: b.contentName,
        content_category: 'Booking',
        funnel_path: 'agency',
        ...(direct ? { booked_via: 'vsl-calendar' } : {}),
      },
    }).catch(() => {});
  }

  /**
   * Back to the confirmation page, from an email, on any device.
   *
   * Points at booking-confirmed B — the long version, with the website,
   * the portal, the ad library, the diagram and the price. That page is
   * the whole pre-call brief, and the single most useful thing a reminder
   * email can link to: "here is everything again before we speak".
   *
   * The first name rides along in `to` so the page still greets them;
   * without it they get the generic heading. The resume route only
   * accepts same-origin paths, and a query string on one is fine.
   *
   * Signed and time-limited on the same 30-day clock as the session
   * cookie, so a reminder sent inside the usual booking window always
   * works. Written to the contact as well as sent in the webhook, so a
   * workflow built later can still use it.
   */
  const resumeTo = `${BOOKING_CONFIRMED_B_PATH}${
    lead?.firstName ? `?name=${encodeURIComponent(lead.firstName)}` : ''
  }`;
  const resumeUrl = `${SITE_URL}/api/advisory-pricing/resume?t=${encodeURIComponent(
    await createDemoToken(leadId),
  )}&to=${encodeURIComponent(resumeTo)}`;

  if (lead?.email) {
    await syncContactToGhl({
      resumeUrl,
      // {{contact.candor_url}} in the booking-flow Candor email and SMS.
      candorUrl: true,
      // Onto the contact, not just into the webhook payload, so a
      // tag-triggered reminder flow can wait until a fixed period
      // BEFORE the call rather than after the booking.
      bookingStart: startTime || null,
      email: lead.email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      firmName: lead.firmName,
      websiteUrl: lead.websiteUrl,
      source: direct
        ? `${ADVISORY_PRODUCT_NAME} - VSL Calendar Booking`
        : `${ADVISORY_PRODUCT_NAME} - Growth Call Booking`,
      // Milestones accumulate: a booked firm keeps 'advisory qualified' and
      // gains 'call booked'. The buyer tag goes on buyers only — almost
      // everyone booking now has paid nothing, and marking them customers
      // would misreport them and drop them out of the pre-purchase
      // sequences.
      tags: direct
        ? [
            // The VSL calendar asks no qualifying questions, so neither
            // 'advisory qualified' nor 'qualified-vsl': both would claim
            // answers this firm never gave. 'advisory booked' is the one
            // the appointment reminder workflow triggers on.
            ...(lead.advisoryPurchasedAt ? [TAG_ADVISORY_BUYER] : []),
            TAG_CALL_BOOKED,
            TAG_ADVISORY_BOOKED,
            TAG_VSL_BOOKING,
            ...(angleTag ? [angleTag] : []),
          ]
        : [
            ...(lead.advisoryPurchasedAt ? [TAG_ADVISORY_BUYER] : []),
            TAG_ADVISORY_QUALIFIED,
            TAG_CALL_BOOKED,
            // The one the appointment reminder workflow triggers on. The
            // other two read as qualification states, and 'agency pitch'
            // — which the qualifier applies — is on every firm that
            // cleared the bar whether or not they ever booked.
            TAG_ADVISORY_BOOKED,
            // Booking requires having qualified, so a VSL booking is a
            // qualified VSL lead by definition.
            ...(angleTag ? [angleTag, TAG_QUALIFIED_VSL] : []),
          ],
      // Belt and braces. The qualifier already strips this, but a booking
      // cannot coexist with "opted in and done nothing since" under any
      // ordering, including a contact that predates that change.
      removeTags: [TAG_ADVISORY_OPT_IN],
      answers: direct
        ? null
        : {
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
      leadScore: direct ? null : lead.leadScore,
      funnelPath: 'agency',
      noteHeading: direct
        ? b.rescheduled
          ? 'Rescheduled their CPA Acquisition Review'
          : `${rebooked ? 'Rebooked' : 'Booked'} a CPA Acquisition Review on the ${angle ?? 'VSL'} page (no qualifier)`
        : `${rebooked ? 'Rebooked' : 'Booked'} the growth call${
            lead.advisoryPurchasedAt ? ' (Accelerator buyer)' : ''
          }`,
      extraNoteLines: [
        `Booking uid: ${bookingUid || 'n/a'}`,
        `Call start: ${startTimeDisplay || startTime || 'n/a'}`,
        ...(direct
          ? [
              `Firm website: ${b.website || 'n/a'}`,
              `Promotional SMS: ${b.smsConsent ? 'opted in' : 'not opted in'}`,
              ...(b.notes ? [`Their notes: ${b.notes}`] : []),
            ]
          : []),
        ...(b.rescheduled && b.previousStartTime
          ? [`Moved from: ${formatBookingStart(b.previousStartTime, b.attendeeTimezone) || b.previousStartTime}`]
          : []),
        ...(rebooked && !b.rescheduled
          ? ['An earlier booking may still be on the calendar. Cancel it if it was not a no-show.']
          : []),
      ],
    });
  }

  const webhook =
    process.env.GHL_ADVISORY_BOOKING_WEBHOOK_URL || process.env.GHL_QUALIFICATION_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: direct ? 'vsl-calendar-booking' : 'advisory-growth-call-booking',
        tag: TAG_CALL_BOOKED,
        funnel_path: 'agency',
        // Booking is the bar on the VSL calendar: there is no qualifier in
        // front of it, and anyone who books gets the call.
        qualified: true,
        // True when this firm had booked before: a no-show or a reschedule.
        rebooked,
        vsl_angle: angle,
        vsl_tag: angleTag,
        lead_id: leadId,
        firstName: lead?.firstName || '',
        lastName: lead?.lastName || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        firm_name: lead?.firmName || '',
        booking_uid: bookingUid,
        booking_start: startTime,
        // Readable, in the attendee's own zone and always naming it.
        // Use THIS one in email and SMS templates; booking_start
        // stays machine-readable for GHL's date logic.
        booking_start_display: startTimeDisplay,
        resume_url: resumeUrl,
        ...(direct
          ? {
              direct_booking: true,
              // Same call, new time: Cal already cancelled the old slot.
              // `rebooked` is true as well, which is what makes workflow 3
              // send the confirmation and reminders again for the new time.
              rescheduled: Boolean(b.rescheduled),
              previous_booking_start: b.previousStartTime || '',
              website: b.website || '',
              sms_consent: Boolean(b.smsConsent),
              notes: b.notes || '',
            }
          : {}),
        submitted_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  } else {
    console.warn('[Advisory Booked] no GHL booking webhook configured — skipping GHL webhook');
  }
}
