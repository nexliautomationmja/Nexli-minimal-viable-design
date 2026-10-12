/**
 * DEV-ONLY state switch for walking the advisory funnel on localhost.
 *
 * The funnel cannot be walked in one pass: /offer hides itself once you have
 * bought, the calendar hides until you have cleared the qualifier, and locally
 * you cannot buy for real because checkout needs STRIPE_ADVISORY_PRICE_ID.
 *
 * `buy` and `as` are INDEPENDENT. They used to move together, from when the
 * $97 gated the calendar — but the main path now reaches the calendar having
 * bought nothing, so "unpaid and qualified" is the single most important state
 * to be able to produce, and the old coupling could not produce it.
 *
 *   buy=1 | 0        purchase flag on the lead
 *   as=agency        cleared the qualifier  → the calendar
 *   as=not-a-fit     missed the bar         → the $97 downsell
 *   as=none          has not answered yet   → the qualifier
 *
 * Get a cookie first with /api/demo/preview (it mints the shared lead), then:
 *
 *   ?as=none                     fresh opt-in       → /vsl
 *   ?as=agency                   qualified, unpaid  → /call
 *   ?as=not-a-fit                missed the bar     → /offer (downsell)
 *   ?buy=1&as=not-a-fit          bought the downsell → /next-steps
 *   ?buy=1&as=agency             bought, qualified   → /thank-you
 *   ?as=agency&to=/advisory-pricing/qualify
 *
 * It only ever touches the row the current cookie points at, and it writes
 * nothing a real purchase would write beyond the two advisory columns — no
 * Stripe session id, so it cannot be mistaken for a real sale in reporting.
 *
 * Hard-disabled in production: returns 404 when NODE_ENV is 'production'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { readDemoLead } from '@/lib/demo-session';
import {
  ADVISORY_CALL_PATH,
  ADVISORY_NEXT_STEPS_PATH,
  ADVISORY_OFFER_PATH,
  ADVISORY_PRICE_VALUE,
  ADVISORY_THANK_YOU_PATH,
  ADVISORY_PATH,
} from '@/lib/advisory-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Only ever redirect somewhere inside this app. */
function safeTo(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const { searchParams } = new URL(req.url);

  // Default to unpaid: that is the normal state everywhere except the two
  // post-purchase pages, now that the $97 is a downsell.
  const buying = searchParams.get('buy') === '1';

  const asParam = searchParams.get('as');
  const funnelPath =
    asParam === 'not-a-fit' ? 'not-a-fit' : asParam === 'none' ? null : 'agency';

  const leadId = await readDemoLead();
  if (!leadId) {
    return NextResponse.json(
      { error: 'No lead cookie. Visit /api/demo/preview first, then come back.' },
      { status: 401 },
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: 'No DATABASE_URL.' }, { status: 503 });
  }

  await db
    .update(leads)
    .set({
      advisoryPurchasedAt: buying ? new Date() : null,
      advisoryAmountCents: buying ? ADVISORY_PRICE_VALUE * 100 : null,
      funnelPath,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  // Wherever that state actually lands you in the live funnel.
  const fallback = buying
    ? funnelPath === 'not-a-fit'
      ? ADVISORY_NEXT_STEPS_PATH
      : ADVISORY_THANK_YOU_PATH
    : funnelPath === 'agency'
      ? ADVISORY_CALL_PATH
      : funnelPath === 'not-a-fit'
        ? ADVISORY_OFFER_PATH
        : ADVISORY_PATH;

  return NextResponse.redirect(new URL(safeTo(searchParams.get('to')) || fallback, req.url));
}
