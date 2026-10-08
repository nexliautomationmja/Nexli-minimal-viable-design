// ---------------------------------------------------------------------------
// Re-identify someone from a link, then send them where they were going.
//
// Exists because Next forbids cookies().set() from a Server Component — it
// throws "Cookies can only be modified in a Server Action or Route Handler",
// which surfaces as a 500. A route handler is the sanctioned place to do it.
//
// Two callers:
//
//   ?t=<signed lead token>   the email CTA. Lets an opted-in lead reach the
//                            gated VSL from any device without re-filling the
//                            form (which would also insert a duplicate lead
//                            row). The URL carries its own `to`, built from
//                            the opt-in route's nextPath.
//
//   ?session_id=cs_...       the thank-you page, when a buyer opens the
//                            delivery email somewhere with no cookie.
//
// The token is HMAC-signed with DEMO_SESSION_SECRET and expires on the same
// clock as the cookie, so it cannot be forged or replayed indefinitely. It is
// still a bearer credential in a URL: forward the email, forward the access.
// Acceptable for the VSL and the sales page. The paid pages are gated on the
// purchase recorded against the lead row, not on this, so a forwarded link
// cannot hand anyone the product; the calendar is gated on funnel_path, so it
// cannot hand anyone a booking either.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server';
import {
  DEMO_COOKIE,
  createDemoToken,
  demoCookieOptions,
  verifyDemoToken,
} from '@/lib/demo-session';
import {
  isCheckoutSessionId,
  isPaidAdvisorySession,
  retrieveCheckoutSession,
} from '@/lib/stripe';
import { ADVISORY_PATH, ADVISORY_VSL_PATH } from '@/lib/advisory-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only ever bounce to a path inside this app — never an absolute URL. */
function safeDestination(raw: string | null): string {
  // Falls back to the VSL, the funnel's main path — not to checkout.
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return ADVISORY_VSL_PATH;
  return raw;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = safeDestination(searchParams.get('to'));

  let leadId: string | null = null;

  // ---- Path 1: a signed lead token from an email -------------------------
  const token = searchParams.get('t');
  if (token) {
    leadId = await verifyDemoToken(token);
  }

  // ---- Path 2: a paid Stripe session -------------------------------------
  if (!leadId) {
    const sessionId = searchParams.get('session_id');
    if (isCheckoutSessionId(sessionId)) {
      const session = await retrieveCheckoutSession(sessionId).catch(() => null);
      if (session && isPaidAdvisorySession(session)) {
        const candidate = session.metadata?.lead_id;
        if (candidate && UUID_RE.test(candidate)) leadId = candidate;
      }
    }
  }

  // Expired or forged. Send them to the opt-in rather than an error page —
  // they can identify themselves again in one field.
  if (!leadId) {
    return NextResponse.redirect(new URL(ADVISORY_PATH, req.url));
  }

  // The destination never carries the token onward, so it does not sit in
  // browser history or leak through the Referer header to Stripe.
  const res = NextResponse.redirect(new URL(to, req.url));
  res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
  return res;
}
