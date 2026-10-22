// ---------------------------------------------------------------------------
// Turning Cal.com's booking timestamp into something you can put in an email.
//
// Cal sends an ISO 8601 instant in UTC — "2026-11-02T16:30:00.000Z". That is
// the right thing to keep: GHL can parse it for date filters and "wait until"
// steps, and it is unambiguous. It is the wrong thing to SHOW. A firm that
// reads 16:30Z and subtracts four hours gets the time wrong by an hour,
// because 2 November 2026 is after the clocks go back and Eastern is UTC-5
// that day, not UTC-4.
//
// So the ISO value stays and this adds a second, readable one beside it.
//
// IN THE ATTENDEE'S OWN ZONE, not ours. They picked a slot in a calendar that
// was showing their local time; telling them a different number afterwards is
// how people miss calls. The zone is captured in the browser at booking time
// (see components/InlineCalEmbed) and passed through.
//
// THE ZONE IS ALWAYS NAMED. "11:30 AM" with nothing after it is the single
// most expensive piece of ambiguity in a booking confirmation — a firm in
// California reading an Eastern time with no label shows up three hours late.
// Intl's 'short' zone name gives EST/PST/GMT+1 and so on.
// ---------------------------------------------------------------------------

/**
 * Our fallback zone. Used when the attendee's is missing or unusable — the
 * call is on a US Eastern calendar, so it is the least wrong default, and it
 * matches lib/tax-year-deadline, which pins the same zone for the same
 * reason.
 */
export const DEFAULT_BOOKING_ZONE = 'America/New_York';

/**
 * True when Intl recognises the string as an IANA zone.
 *
 * The value arrives from a browser over the wire, so it is untrusted: an
 * unknown zone makes DateTimeFormat THROW rather than fall back, which would
 * take down the booking route for the sake of a label.
 */
export function isValidTimeZone(zone: string | null | undefined): zone is string {
  if (!zone || typeof zone !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/**
 * "Sunday, November 2 at 11:30 AM EST"
 *
 * Returns '' when there is no usable timestamp, so callers can fall back to
 * the raw value rather than printing "Invalid Date" into an email.
 *
 * @param iso   Cal's start time, ISO 8601.
 * @param zone  The attendee's IANA zone. Falls back to Eastern when absent
 *              or unrecognised.
 */
export function formatBookingStart(
  iso: string | null | undefined,
  zone?: string | null,
): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const timeZone = isValidTimeZone(zone) ? zone : DEFAULT_BOOKING_ZONE;

  try {
    const day = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);

    const time = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(date);

    return `${day} at ${time}`;
  } catch {
    // isValidTimeZone already cleared this zone, so reaching here means an
    // Intl quirk rather than bad input. The raw instant beats nothing.
    return '';
  }
}
