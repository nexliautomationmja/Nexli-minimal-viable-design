// ---------------------------------------------------------------------------
// Cal.com webhooks: checking the signature and reading a booking out of the
// payload. Pure functions (node crypto only) so they can be tested without
// a server, a database or a live GHL webhook. Used by app/api/cal/booking.
//
// THE SIGNATURE. Cal signs the raw request body with the webhook's secret
// (HMAC-SHA256, hex) and sends it as `x-cal-signature-256`. With no secret
// set in Cal the header reads "no-secret-provided", which never verifies.
//
// THE PAYLOAD. Cal's shape is not contractual and has moved between
// versions, so every field is read defensively and from more than one place:
// `responses` holds the booking form's answers keyed by each question's
// identifier, each as { label, value }, and `attendees[0]` repeats the
// name, email and time zone. `metadata` is what the page passed as
// `metadata[key]=value` (components/funnel/VslBooking), plus Cal's own keys
// such as videoCallUrl.
// ---------------------------------------------------------------------------

import { createHmac, timingSafeEqual } from 'crypto';

export function verifyCalSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature.trim().toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface CalBooking {
  uid: string;
  /** The event type's slug, e.g. "cpa-acquisition-review". */
  eventType: string;
  startTime: string;
  /**
   * On a reschedule, when the call USED to be. Cal has sent it as
   * rescheduleStartTime; older payloads carry nothing, and then it is ''.
   */
  previousStartTime: string;
  timeZone: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  smsConsent: boolean;
  metadata: Record<string, string>;
}

const str = (v: unknown, max = 500): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '';

/** A response's value: Cal sends { label, value }, older payloads the bare value. */
function answer(responses: any, key: string): unknown {
  const r = responses?.[key];
  return r && typeof r === 'object' && 'value' in r ? r.value : r;
}

/**
 * The firm's website. The event type's question is identified `Website-URL`
 * (Marcel created it that way, 2026-11-19); `website` is accepted too, and
 * failing both, any answered question whose identifier mentions a website.
 */
function readWebsite(responses: any): string {
  for (const key of ['Website-URL', 'website']) {
    const v = str(answer(responses, key), 300);
    if (v) return v;
  }
  for (const key of Object.keys(responses ?? {})) {
    if (/web\s*site/i.test(key)) {
      const v = str(answer(responses, key), 300);
      if (v) return v;
    }
  }
  return '';
}

/** Cal's name field is a string, or { firstName, lastName } in its split variant. */
function readName(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object') {
    const o = v as { firstName?: unknown; lastName?: unknown };
    return [str(o.firstName, 100), str(o.lastName, 100)].filter(Boolean).join(' ');
  }
  return '';
}

/** A checkbox answer: true, "true", "yes", "on", or a non-empty array. */
function truthy(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return /^(true|yes|on|1)$/i.test(v.trim());
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

export function parseCalBooking(payload: any): CalBooking {
  const p = payload ?? {};
  const responses = p.responses ?? {};
  const attendee = Array.isArray(p.attendees) ? p.attendees[0] ?? {} : {};

  const fullName = (readName(answer(responses, 'name')) || str(attendee.name, 200)).slice(0, 200);
  const [firstName = '', ...rest] = fullName.split(/\s+/).filter(Boolean);

  const metadata: Record<string, string> = {};
  if (p.metadata && typeof p.metadata === 'object') {
    for (const [k, v] of Object.entries(p.metadata)) {
      const s = str(v);
      if (s) metadata[k.slice(0, 40)] = s;
    }
  }

  return {
    uid: str(p.uid, 200),
    eventType: str(p.type, 200),
    startTime: str(p.startTime, 100),
    previousStartTime: str(p.rescheduleStartTime, 100) || str(p.rescheduledFrom?.startTime, 100),
    timeZone: str(attendee.timeZone, 64),
    fullName,
    firstName: firstName.slice(0, 100),
    lastName: rest.join(' ').slice(0, 100),
    email: (str(answer(responses, 'email'), 320) || str(attendee.email, 320)).toLowerCase(),
    phone: str(answer(responses, 'attendeePhoneNumber'), 40) || str(attendee.phoneNumber, 40),
    website: readWebsite(responses),
    // `systemsolution` is the event type's "What are you hoping that this
    // system solves for you?" question, if it is still on the form.
    notes: [
      str(answer(responses, 'systemsolution'), 2000) &&
        `Hoping it solves: ${str(answer(responses, 'systemsolution'), 2000)}`,
      str(answer(responses, 'notes'), 2000) || str(p.additionalNotes, 2000),
    ]
      .filter(Boolean)
      .join('\n'),
    smsConsent: truthy(answer(responses, 'sms_consent')),
    metadata,
  };
}
